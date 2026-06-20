<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\Programa;
use App\Models\TaskAssignment;
use App\Models\PlanAction;
use App\Notifications\AlertaVencimiento;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationSettingsController extends Controller
{
    /**
     * GET /admin/notification-settings
     * Retorna los dias configurados y los correos de cada departamento.
     */
    public function index()
    {
        $raw = SystemSetting::get('dias_alertas_programadas', '[{"value":7,"unit":"days"},{"value":3,"unit":"days"},{"value":1,"unit":"days"}]');
        $dias = json_decode($raw, true) ?? [];
        
        // Convertir cualquier número suelto a objeto (retrocompatibilidad)
        $dias = array_map(function($item) {
            if (is_numeric($item)) {
                return ['value' => (int)$item, 'unit' => 'days'];
            }
            return $item;
        }, $dias);

        // Ordenar
        usort($dias, function($a, $b) {
            $aHours = $a['unit'] === 'days' ? $a['value'] * 24 : $a['value'];
            $bHours = $b['unit'] === 'days' ? $b['value'] * 24 : $b['value'];
            return $bHours <=> $aHours;
        });

        $departments = Programa::all()->map(fn($d) => [
            'id'             => $d->id,
            'name'           => $d->nombre,
            'email_contacto' => $d->email_contacto,
        ]);

        return response()->json([
            'success'       => true,
            'dias_alertas'  => $dias,
            'departments'   => $departments,
        ]);
    }

    /**
     * POST /admin/notification-settings
     * Guarda el array de intervalos de alerta dinámicos.
     * Body: { "dias": [{"value": 7, "unit": "days"}, {"value": 2, "unit": "hours"}] }
     */
    public function saveDias(Request $request)
    {
        $request->validate([
            'dias'   => 'required|array|min:1',
        ]);

        $intervalos = $request->dias;
        
        // Convertir cualquier número suelto a objeto (retrocompatibilidad)
        $intervalos = array_map(function($item) {
            if (is_numeric($item)) {
                return ['value' => (int)$item, 'unit' => 'days'];
            }
            return $item;
        }, $intervalos);

        // Eliminar duplicados exactos
        $unique = [];
        foreach ($intervalos as $item) {
            $key = $item['value'] . '_' . $item['unit'];
            $unique[$key] = $item;
        }
        $intervalos = array_values($unique);

        // Ordenar: primero días (mayor a menor), luego horas (mayor a menor)
        usort($intervalos, function($a, $b) {
            $aHours = $a['unit'] === 'days' ? $a['value'] * 24 : $a['value'];
            $bHours = $b['unit'] === 'days' ? $b['value'] * 24 : $b['value'];
            return $bHours <=> $aHours;
        });

        SystemSetting::set('dias_alertas_programadas', $intervalos);

        return response()->json([
            'success'      => true,
            'message'      => 'Intervalos de alerta guardados correctamente.',
            'dias_alertas' => $intervalos,
        ]);
    }

    /**
     * PATCH /admin/departments/{id}/email
     * Actualiza el correo de contacto de un departamento.
     * Body: { "email_contacto": "sistemas@unisimon.edu.co" }
     */
    public function updateDepartmentEmail(Request $request, $id)
    {
        $request->validate([
            'email_contacto' => 'nullable|email|max:255',
        ]);

        $dept = Programa::findOrFail($id);
        $dept->email_contacto = $request->email_contacto;
        $dept->save();

        return response()->json([
            'success'    => true,
            'message'    => "Correo del departamento '{$dept->nombre}' actualizado.",
            'department' => [
                'id'             => $dept->id,
                'name'           => $dept->nombre,
                'email_contacto' => $dept->email_contacto,
            ],
        ]);
    }

    /**
     * POST /admin/notifications/test-run
     * Dispara la lógica de alertas de vencimiento manualmente (para demostración).
     * Útil para exponer el proyecto sin esperar al cron diario.
     */
    public function testRun()
    {
        $raw  = SystemSetting::get('dias_alertas_programadas', '[{"value":7,"unit":"days"},{"value":3,"unit":"days"},{"value":1,"unit":"days"}]');
        $intervalos = json_decode($raw, true) ?? [];
        
        $intervalos = array_map(function($item) {
            return is_numeric($item) ? ['value' => (int)$item, 'unit' => 'days'] : $item;
        }, $intervalos);

        $now       = Carbon::now();
        $enviados  = 0;
        $detalle   = [];

        foreach ($intervalos as $intervalo) {
            $value = (int)$intervalo['value'];
            $unit = $intervalo['unit'] ?? 'days';
            
            if ($unit === 'days') {
                $fechaObjetivo = $now->copy()->addDays($value)->format('Y-m-d');
                $label = "{$value} día(s)";
            } else {
                $targetTime = $now->copy()->addHours($value);
                $fechaObjetivo = $targetTime->format('Y-m-d');
                $label = "{$value} hora(s)";
            }

            // — Tareas Institucionales —
            $assignments = TaskAssignment::with(['fixedTask', 'teacher'])
                ->whereIn('status', ['pending', 'in_progress'])
                ->where(function ($q) use ($fechaObjetivo) {
                    $q->where('custom_deadline', $fechaObjetivo)
                      ->orWhere(function ($q2) use ($fechaObjetivo) {
                          $q2->whereNull('custom_deadline')
                             ->whereHas('fixedTask', fn($q3) => $q3->where('deadline_month', $fechaObjetivo));
                      });
                })
                ->get();

            foreach ($assignments as $assignment) {
                $teacher = $assignment->teacher;
                $task    = $assignment->fixedTask;
                if ($teacher && $teacher->email && $task) {
                    try {
                        $teacher->notify(new AlertaVencimiento($task->activity, $value, "tarea_unit_{$unit}"));
                        $enviados++;
                        $detalle[] = "Tarea: {$task->activity} → {$teacher->email} ({$label})";
                    } catch (\Exception $e) {
                        Log::warning("Error enviando alerta tarea {$task->id}: " . $e->getMessage());
                        $detalle[] = "[ERROR] Tarea: {$task->activity} → {$teacher->email}: " . $e->getMessage();
                    }
                }
            }

            // — Acciones de Planes de Mejora —
            $actions = PlanAction::with('plan.teacher')
                ->whereIn('status', ['pending', 'in_progress'])
                ->whereNotNull('deadline')
                ->whereDate('deadline', $fechaObjetivo)
                ->get();

            foreach ($actions as $action) {
                $teacher = $action->plan?->teacher;
                if ($teacher && $teacher->email) {
                    try {
                        $teacher->notify(new AlertaVencimiento($action->concrete_action, $value, "plan_unit_{$unit}"));
                        $enviados++;
                        $detalle[] = "Plan: {$action->concrete_action} → {$teacher->email} ({$label})";
                    } catch (\Exception $e) {
                        Log::warning("Error enviando alerta plan {$action->id}: " . $e->getMessage());
                        $detalle[] = "[ERROR] Plan: {$action->concrete_action} → {$teacher->email}: " . $e->getMessage();
                    }
                }
            }
        }

        return response()->json([
            'success'  => true,
            'message'  => "Simulación completada. Alertas enviadas: {$enviados}",
            'enviados' => $enviados,
            'detalle'  => $detalle,
        ]);
    }
}
