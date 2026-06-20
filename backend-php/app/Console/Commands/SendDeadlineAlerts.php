<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TaskAssignment;
use App\Models\PlanAction;
use App\Models\SystemSetting;
use App\Notifications\AlertaVencimiento;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendDeadlineAlerts extends Command
{
    protected $signature = 'alerts:deadlines';

    protected $description = 'Envía alertas de correo a los docentes sobre entregas próximas a vencer (usa días configurados dinámicamente en el panel de admin)';

    public function handle()
    {
        $this->info('Iniciando verificación de fechas límite...');

        // Leer los intervalos dinámicos desde la base de datos
        $raw  = SystemSetting::get('dias_alertas_programadas', '[{"value":7,"unit":"days"},{"value":3,"unit":"days"},{"value":1,"unit":"days"}]');
        $intervalos = json_decode($raw, true) ?? [];
        
        // Convertir números sueltos (retrocompatibilidad)
        $intervalos = array_map(function($item) {
            return is_numeric($item) ? ['value' => (int)$item, 'unit' => 'days'] : $item;
        }, $intervalos);

        $alertsSent = 0;
        $now = Carbon::now();

        foreach ($intervalos as $intervalo) {
            $value = (int)$intervalo['value'];
            $unit = $intervalo['unit'] ?? 'days';
            
            // Calculamos la fecha objetivo. 
            // Si el vencimiento es un 'date', asumimos que vence al final del día (23:59:59).
            if ($unit === 'days') {
                $fechaObjetivo = $now->copy()->addDays($value)->format('Y-m-d');
                $isMatchHour = true; // Para días, revisamos una vez al día (generalmente cron 08:00 AM)
                $label = "{$value} día(s)";
            } else {
                // Si son horas, ej: 2 horas antes de las 23:59:59 -> 21:59:59 -> revisamos a las 22:00.
                // Como las fechas no tienen hora en la BD, calculamos si la hora actual + horas configuradas nos da el final del día.
                $targetTime = $now->copy()->addHours($value);
                $fechaObjetivo = $targetTime->format('Y-m-d');
                
                // Solo disparamos si la hora objetivo coincide con la hora final del día (23) o si estamos probando.
                // Si el cron se ejecuta cada hora, en algún momento $targetTime->hour será 23.
                $isMatchHour = ($targetTime->hour == 23 || $targetTime->hour == 0); 
                $label = "{$value} hora(s)";
            }

            if (!$isMatchHour) {
                continue;
            }

            $this->line("Revisando actividades que vencen en {$label} → {$fechaObjetivo}");

            // 1. Acciones de planes de mejora
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
                        $alertsSent++;
                        Log::info("Alerta enviada [Plan] a {$teacher->email}: {$action->concrete_action} ({$label})");
                    } catch (\Exception $e) {
                        Log::warning("Error alerta plan {$action->id}: " . $e->getMessage());
                    }
                }
            }

            // 2. Tareas institucionales (asignaciones)
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
                        $alertsSent++;
                        Log::info("Alerta enviada [Tarea] a {$teacher->email}: {$task->activity} ({$label})");
                    } catch (\Exception $e) {
                        Log::warning("Error alerta tarea {$assignment->id}: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Verificación completada. Alertas enviadas: {$alertsSent}");
        Log::info("Cron alerts:deadlines ejecutado. Total alertas: {$alertsSent}");

        return Command::SUCCESS;
    }
}
