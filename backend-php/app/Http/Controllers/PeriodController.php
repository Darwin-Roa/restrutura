<?php

namespace App\Http\Controllers;

use App\Models\Period;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
    public function index()
    {
        try {
            $periods = Period::orderBy('id', 'desc')->get();
            return response()->json(['success' => true, 'periods' => $periods]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $period = Period::create($request->only(['name', 'start_date', 'end_date', 'is_active']));
            return response()->json(['success' => true, 'period' => $period]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $period = Period::findOrFail($id);
            $period->update($request->only(['name', 'start_date', 'end_date']));
            return response()->json(['success' => true, 'period' => $period]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function openPeriod($id, Request $request)
    {
        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            Period::where('is_active', true)->update(['is_active' => false]);
            $period = Period::findOrFail($id);
            $period->update(['is_active' => true]);

            // --- Lógica de Arrastre de Tareas (Carry Over) ---
            $oldPeriodIds = Period::where('start_date', '<', $period->start_date)->pluck('id');
            
            // 1. Marcar tareas viejas (pendientes/en curso) como no entregadas
            $actionsToCarryOver = \App\Models\PlanAction::whereIn('status', ['pending', 'in_progress'])
                ->whereHas('plan', function($q) use ($oldPeriodIds) {
                    $q->whereIn('period_id', $oldPeriodIds);
                })
                ->with('plan')
                ->get();
                
            foreach($actionsToCarryOver as $action) {
                $action->status = 'not_delivered';
                $action->needs_carry_over = true;
                $action->save();
            }
            
            // 2. Clonar todas las tareas en espera al nuevo periodo
            $needsCarry = \App\Models\PlanAction::where('needs_carry_over', true)->with('plan')->get();
            $plansCache = [];
            
            foreach($needsCarry as $act) {
                $teacherId = $act->plan->teacher_id;
                if (!$teacherId) continue;

                if (!isset($plansCache[$teacherId])) {
                    $existingPlan = \App\Models\ImprovementPlan::where('teacher_id', $teacherId)
                        ->where('period_id', $period->id)
                        ->first();
                        
                    if (!$existingPlan) {
                        $existingPlan = \App\Models\ImprovementPlan::create([
                            'teacher_id' => $teacherId,
                            'period_id' => $period->id,
                            'status' => 'approved',
                            'diagnosis_text' => 'Plan autogenerado para contener tareas arrastradas de periodos anteriores.',
                            'ai_generated_at' => now(),
                        ]);
                    }
                    $plansCache[$teacherId] = $existingPlan;
                }
                
                $newPlan = $plansCache[$teacherId];
                
                \App\Models\PlanAction::create([
                    'plan_id' => $newPlan->id,
                    'order_num' => $act->order_num,
                    'aspect' => $act->aspect,
                    'concrete_action' => $act->concrete_action,
                    'verifiable_product' => $act->verifiable_product,
                    'expected_goal' => $act->expected_goal,
                    'deadline' => $period->end_date, // Nuevas fechas actualizadas
                    'status' => 'pending',
                    'course_id' => $act->course_id,
                    'carry_over_count' => $act->carry_over_count + 1,
                    'needs_carry_over' => false,
                ]);
                
                $act->needs_carry_over = false;
                $act->save();
            }
            // --- Fin Lógica Arrastre ---

            // Clonar tareas institucionalmente de manera optimizada (Bulk Insert)
            $jwtUser = $request->user();
            $tasks = \App\Models\FixedTask::where('period_id', $period->id)->where('is_active', true)->get();
            
            $professorsQuery = \App\Models\User::where('role', 'profesor')->where('is_active', true);
            if ($jwtUser && $jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $professorsQuery->where('programa_id', $jwtUser->programa_id);
                } else {
                    $professorsQuery->whereRaw('1 = 0');
                }
            }
            $professors = $professorsQuery->get();

            $existingAssignments = \App\Models\TaskAssignment::where('period_id', $period->id)->get(['fixed_task_id', 'teacher_id', 'course_id']);
            $existingSet = [];
            foreach($existingAssignments as $ea) {
                $key = "{$ea->fixed_task_id}_{$ea->teacher_id}_{$ea->course_id}";
                $existingSet[$key] = true;
            }

            $teacherCourses = \App\Models\TeacherCourse::where('period_id', $period->id)->get()->groupBy('teacher_id');
            $inserts = [];
            $now = now();
            
            foreach ($tasks as $task) {
                foreach ($professors as $prof) {
                    if ($task->scope === 'individual' && $task->specific_teacher_id !== $prof->id) continue;

                    if ($task->scope === 'por_curso') {
                        $courses = $teacherCourses->get($prof->id, collect());
                        foreach ($courses as $tc) {
                            $key = "{$task->id}_{$prof->id}_{$tc->course_id}";
                            if (!isset($existingSet[$key])) {
                                $inserts[] = [
                                    'fixed_task_id' => $task->id,
                                    'teacher_id' => $prof->id,
                                    'period_id' => $period->id,
                                    'course_id' => $tc->course_id,
                                    'status' => 'pending',
                                    'createdAt' => $now,
                                    'updatedAt' => $now,
                                ];
                                $existingSet[$key] = true;
                            }
                        }
                    } else {
                        $key = "{$task->id}_{$prof->id}_";
                        if (!isset($existingSet[$key])) {
                            $inserts[] = [
                                'fixed_task_id' => $task->id,
                                'teacher_id' => $prof->id,
                                'period_id' => $period->id,
                                'course_id' => null,
                                'status' => 'pending',
                                'createdAt' => $now,
                                'updatedAt' => $now,
                            ];
                            $existingSet[$key] = true;
                        }
                    }
                }
            }

            foreach (array_chunk($inserts, 500) as $chunk) {
                \App\Models\TaskAssignment::insert($chunk);
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['success' => true, 'message' => "Periodo '{$period->name}' activado y " . count($inserts) . " tareas clonadas."]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
