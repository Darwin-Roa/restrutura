<?php

namespace App\Http\Controllers;

use App\Models\ImprovementPlan;
use App\Models\PlanAction;
use App\Models\Evaluation;
use App\Models\StudentComment;
use App\Models\User;
use App\Models\Period;
use App\Models\TeacherCourse;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $query = ImprovementPlan::with(['teacher', 'period', 'actions']);

            if ($jwtUser->role !== 'admin' && $jwtUser->programa_id) {
                $teacherIds = User::where('programa_id', $jwtUser->programa_id)
                    ->where('is_active', true)
                    ->pluck('id');
                $query->whereIn('teacher_id', $teacherIds);
            } else {
                $query->whereHas('teacher', function($q) {
                    $q->where('is_active', true);
                });
            }

            $plans = $query->orderBy('id', 'desc')->get();
            return response()->json(['success' => true, 'plans' => $plans]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getMyPlan(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $activePeriod = Period::where('is_active', true)->first();

            $plan = ImprovementPlan::with('actions')
                ->where('teacher_id', $jwtUser->id)
                ->where('status', 'approved')
                ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                ->first();

            // Past debt actions from previous periods
            $debtActions = [];
            if ($activePeriod) {
                $pastPeriodIds = Period::where('start_date', '<', $activePeriod->start_date)->pluck('id');
                $previousPlans = ImprovementPlan::where('teacher_id', $jwtUser->id)
                    ->whereIn('period_id', $pastPeriodIds)
                    ->pluck('id');
                if ($previousPlans->isNotEmpty()) {
                    $debtActions = PlanAction::whereIn('plan_id', $previousPlans)
                        ->whereIn('status', ['pending', 'in_progress'])
                        ->get();
                }
            }

            // Preparar respuesta para el frontend, mapeando deudas directamente en PlanActions
            $planResponse = null;
            if ($plan) {
                $planResponse = $plan->toArray();
                $currentActions = $plan->actions->map(function ($a) {
                    $a->is_debt = false;
                    return $a;
                });
                
                $debtActionsMapped = $debtActions ? $debtActions->map(function ($a) {
                    $a->is_debt = true;
                    return $a;
                }) : collect([]);
                
                // El frontend busca plan.PlanActions o plan.actions, así que lo inyectamos de manera explícita
                $planResponse['PlanActions'] = $currentActions->concat($debtActionsMapped)->toArray();
            }

            return response()->json([
                'success' => true,
                'plan' => $planResponse,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function generateWithAI(Request $request)
    {
        set_time_limit(0); // Evitar timeout de 60s si Gemini tarda en responder
        try {
            $teacherId = $request->teacher_id;
            $periodId = $request->period_id;

            // Get existing dragged actions if any
            $existing = ImprovementPlan::where('teacher_id', $teacherId)
                ->where('period_id', $periodId)->first();
            $draggedActions = [];
            if ($existing) {
                $draggedActions = PlanAction::where('plan_id', $existing->id)
                    ->where('carry_over_count', '>', 0)
                    ->get()
                    ->toArray();
            }

            $teacher = User::findOrFail($teacherId);

            // Gather evaluation data
            $evaluation = Evaluation::with('studentComments')
                ->where('teacher_id', $teacherId)
                ->where('period_id', $periodId)
                ->first();

            // Gather course assignments
            $assignments = TeacherCourse::with('course')
                ->where('teacher_id', $teacherId)
                ->where('period_id', $periodId)
                ->get();

            $periodObj = Period::findOrFail($periodId);
            $pastPeriodIds = Period::where('start_date', '<', $periodObj->start_date)->pluck('id');

            // Previous plans for history
            $previousPlans = ImprovementPlan::with('actions')
                ->where('teacher_id', $teacherId)
                ->whereIn('period_id', $pastPeriodIds)
                ->orderBy('id', 'desc')
                ->limit(3)
                ->get();

            $ai = new AIService();
            $aiResult = $ai->generateImprovementPlan([
                'teacher' => $teacher,
                'evaluation' => $evaluation,
                'assignments' => $assignments,
                'previousPlans' => $previousPlans,
                'excludeSelfEvaluation' => true,
            ]);

            if (!empty($draggedActions)) {
                $actionsKey = isset($aiResult['plan_actions']) ? 'plan_actions' : 'actions';
                if (!isset($aiResult[$actionsKey])) {
                    $aiResult[$actionsKey] = [];
                }
                foreach ($draggedActions as $d) {
                    $aiResult[$actionsKey][] = [
                        'aspect' => $d['aspect'],
                        'concrete_action' => $d['concrete_action'],
                        'verifiable_product' => $d['verifiable_product'],
                        'expected_goal' => $d['expected_goal'],
                        'deadline' => $d['deadline'],
                        'carry_over_count' => $d['carry_over_count'],
                    ];
                }
            }

            return response()->json(['success' => true, 'plan' => $aiResult]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function save(Request $request)
    {
        try {
            // Support both flat and nested (planData) format
            $raw = $request->planData ?? $request->all();
            
            $period = Period::find($request->period_id);
            $pStart = $period ? $period->start_date : null;
            $pEnd = $period ? $period->end_date : null;
            $pYear = $period ? date('Y', strtotime($pStart)) : null;

            $aiGenAt = $raw['ai_generated_at'] ?? now();
            if ($period) {
                $dt = date('Y-m-d H:i:s', strtotime($aiGenAt));
                $onlyDate = substr($dt, 0, 10);
                if ($pYear) {
                    $onlyDate = $pYear . substr($onlyDate, 4);
                }
                if ($onlyDate < $pStart) {
                    $onlyDate = $pStart;
                } elseif ($onlyDate > $pEnd) {
                    $onlyDate = $pEnd;
                }
                $aiGenAt = $onlyDate . substr($dt, 10);
            }

            $planData = [
                'teacher_id' => $request->teacher_id,
                'period_id' => $request->period_id,
                'status' => $request->status ?? 'ai_generated',
                'diagnosis_text' => $raw['diagnosis_text'] ?? ($raw['diagnosis'] ?? ''),
                'strengths' => $raw['strengths'] ?? [],
                'improvement_opps' => $raw['improvement_opps'] ?? ($raw['improvement_opportunities'] ?? []),
                'objectives' => $raw['objectives'] ?? [],
                'consolidated_comments' => $raw['consolidated_comments'] ?? [],
                'work_plan' => $raw['work_plan'] ?? [],
                'history_analysis' => $raw['history_analysis'] ?? '',
                'ai_generated_at' => $aiGenAt,
                'ai_prompt_context' => $raw['ai_prompt_context'] ?? null,
                'director_feedback' => $raw['director_feedback'] ?? ($request->director_feedback ?? null),
                'evaluation_id' => $raw['evaluation_id'] ?? ($request->evaluation_id ?? null),
            ];

            // Upsert plan
            $existing = ImprovementPlan::where('teacher_id', $request->teacher_id)
                ->where('period_id', $request->period_id)->first();

            if ($existing) {
                $existing->update($planData);
                $plan = $existing;
                PlanAction::where('plan_id', $plan->id)->delete();
            } else {
                $plan = ImprovementPlan::create($planData);
            }

            // Create actions - check multiple sources
            $actions = $raw['actions'] ?? ($raw['plan_actions'] ?? ($request->actions ?? []));
            if (is_array($actions)) {
                foreach ($actions as $i => $action) {
                    $deadline = !empty($action['deadline']) ? $action['deadline'] : null;
                    if ($deadline && $period) {
                        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline)) {
                            if ($pYear) {
                                $deadline = $pYear . substr($deadline, 4);
                            }
                            if ($deadline < $pStart) {
                                $deadline = $pStart;
                            } elseif ($deadline > $pEnd) {
                                $deadline = $pEnd;
                            }
                        } else {
                            $deadline = $pEnd;
                        }
                    } elseif (!$deadline && $period) {
                        $deadline = $pEnd;
                    }

                    PlanAction::create([
                        'plan_id' => $plan->id,
                        'order_num' => $i + 1,
                        'aspect' => $action['aspect'] ?? '',
                        'concrete_action' => $action['concrete_action'] ?? '',
                        'verifiable_product' => $action['verifiable_product'] ?? '',
                        'expected_goal' => $action['expected_goal'] ?? '',
                        'deadline' => $deadline,
                        'carry_over_count' => $action['carry_over_count'] ?? 0,
                    ]);
                }
            }

            // If approved, send email
            if ($request->status === 'approved') {
                $plan->update(['approved_at' => now()]);
                $teacher = User::find($plan->teacher_id);
                $period = Period::find($plan->period_id);
                // Email notification placeholder
            }

            $plan->load('actions');
            return response()->json(['success' => true, 'plan' => $plan]);
        } catch (\Exception $e) {
            \Log::error("SAVE ERROR: " . $e->getMessage());
            file_put_contents(storage_path('logs/save_error.txt'), $e->getMessage() . "\n" . json_encode($request->all()));
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $plan = ImprovementPlan::findOrFail($id);
            $plan->update([
                'status' => $request->status,
                'director_feedback' => $request->director_feedback ?? $plan->director_feedback,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
            ]);
            if ($request->status === 'approved') {
                $plan->update(['approved_at' => now()]);
            }
            return response()->json(['success' => true, 'plan' => $plan]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateActionDeadline(Request $request, $id)
    {
        try {
            $action = PlanAction::findOrFail($id);
            $action->update(['deadline' => $request->deadline]);
            return response()->json(['success' => true, 'action' => $action]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $plan = ImprovementPlan::findOrFail($id);
            PlanAction::where('plan_id', $plan->id)->delete();
            $plan->forceDelete();
            return response()->json(['success' => true, 'message' => 'Plan eliminado']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function massGenerate(Request $request)
    {
        try {
            $teacherIds = $request->teacher_ids;
            $periodId = $request->period_id;
            $jobId = uniqid('mass_');

            // Store job status in cache
            cache()->put("mass_job_{$jobId}", [
                'status' => 'processing',
                'total' => count($teacherIds),
                'completed' => 0,
                'failed' => 0,
                'results' => [],
            ], 3600);

            // Process in background (sync for now)
            dispatch(function () use ($teacherIds, $periodId, $jobId) {
                $job = cache()->get("mass_job_{$jobId}");
                $ai = new \App\Services\AIService();

                $period = \App\Models\Period::find($periodId);
                $pStart = $period ? $period->start_date : null;
                $pEnd = $period ? $period->end_date : null;
                $pYear = $period ? date('Y', strtotime($pStart)) : null;

                foreach ($teacherIds as $tid) {
                    try {
                        $teacher = \App\Models\User::find($tid);
                        if ($teacher) {
                            $job['current_teacher'] = $teacher->name;
                            cache()->put("mass_job_{$jobId}", $job, 3600);
                        }

                        // Get existing dragged actions if any
                        $existing = \App\Models\ImprovementPlan::where('teacher_id', $tid)
                            ->where('period_id', $periodId)->first();
                        $draggedActions = [];
                        if ($existing) {
                            $draggedActions = \App\Models\PlanAction::where('plan_id', $existing->id)
                                ->where('carry_over_count', '>', 0)
                                ->get()
                                ->toArray();
                            \App\Models\PlanAction::where('plan_id', $existing->id)->delete();
                            $existing->forceDelete();
                        }

                        $evaluation = \App\Models\Evaluation::with('studentComments')
                            ->where('teacher_id', $tid)
                            ->where('period_id', $periodId)
                            ->first();

                        $assignments = \App\Models\TeacherCourse::with('course')
                            ->where('teacher_id', $tid)
                            ->where('period_id', $periodId)
                            ->get();

                        $pastPeriodIdsMass = \App\Models\Period::where('start_date', '<', $period->start_date)->pluck('id');

                        $previousPlans = \App\Models\ImprovementPlan::with('actions')
                            ->where('teacher_id', $tid)
                            ->whereIn('period_id', $pastPeriodIdsMass)
                            ->orderBy('id', 'desc')
                            ->limit(3)
                            ->get();

                        $aiResult = $ai->generateImprovementPlan([
                            'teacher' => $teacher,
                            'evaluation' => $evaluation,
                            'assignments' => $assignments,
                            'previousPlans' => $previousPlans,
                            'excludeSelfEvaluation' => true,
                        ]);

                        $aiGenAt = now();
                        if ($period) {
                            $dt = date('Y-m-d H:i:s', strtotime($aiGenAt));
                            $onlyDate = substr($dt, 0, 10);
                            if ($pYear) {
                                $onlyDate = $pYear . substr($onlyDate, 4);
                            }
                            if ($onlyDate < $pStart) {
                                $onlyDate = $pStart;
                            } elseif ($onlyDate > $pEnd) {
                                $onlyDate = $pEnd;
                            }
                            $aiGenAt = $onlyDate . substr($dt, 10);
                        }

                        // Save the plan as draft
                        $plan = \App\Models\ImprovementPlan::create([
                            'teacher_id' => $tid,
                            'period_id' => $periodId,
                            'evaluation_id' => $evaluation ? $evaluation->id : null,
                            'status' => 'ai_generated',
                            'diagnosis_text' => $aiResult['diagnosis'] ?? ($aiResult['diagnosis_text'] ?? ''),
                            'strengths' => $aiResult['strengths'] ?? [],
                            'improvement_opps' => $aiResult['improvement_opportunities'] ?? ($aiResult['improvement_opps'] ?? []),
                            'objectives' => $aiResult['objectives'] ?? [],
                            'consolidated_comments' => $aiResult['consolidated_comments'] ?? [],
                            'work_plan' => $aiResult['work_plan'] ?? [],
                            'history_analysis' => $aiResult['history_analysis'] ?? '',
                            'ai_generated_at' => $aiGenAt,
                        ]);

                        $actions = $aiResult['plan_actions'] ?? ($aiResult['actions'] ?? []);
                        // Merge dragged actions
                        foreach($draggedActions as $d) {
                            $actions[] = $d;
                        }

                        foreach ($actions as $i => $action) {
                            $deadline = $action['deadline'] ?? '';
                            if ($deadline && $period) {
                                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline)) {
                                    if ($pYear) {
                                        $deadline = $pYear . substr($deadline, 4);
                                    }
                                    if ($deadline < $pStart) {
                                        $deadline = $pStart;
                                    } elseif ($deadline > $pEnd) {
                                        $deadline = $pEnd;
                                    }
                                } else {
                                    $deadline = $pEnd;
                                }
                            } elseif (!$deadline && $period) {
                                $deadline = $pEnd;
                            }

                            \App\Models\PlanAction::create([
                                'plan_id' => $plan->id,
                                'order_num' => $i + 1,
                                'aspect' => $action['aspect'] ?? '',
                                'concrete_action' => $action['concrete_action'] ?? '',
                                'verifiable_product' => $action['verifiable_product'] ?? '',
                                'expected_goal' => $action['expected_goal'] ?? '',
                                'deadline' => $deadline,
                                'carry_over_count' => $action['carry_over_count'] ?? 0,
                            ]);
                        }

                        $job['completed']++;
                        $job['results'][] = ['teacher_id' => $tid, 'status' => 'ok'];
                    } catch (\Exception $e) {
                        $job['failed']++;
                        $job['results'][] = ['teacher_id' => $tid, 'status' => 'error', 'error' => $e->getMessage()];
                    }
                    cache()->put("mass_job_{$jobId}", $job, 3600);
                }
                $job['status'] = 'completed';
                cache()->put("mass_job_{$jobId}", $job, 3600);
            });

            return response()->json(['success' => true, 'jobId' => $jobId]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getMassStatus($jobId)
    {
        $job = cache()->get("mass_job_{$jobId}");
        if (!$job) {
            return response()->json(['success' => false, 'message' => 'Job no encontrado'], 404);
        }
        return response()->json(['success' => true, 'job' => $job]);
    }
}
