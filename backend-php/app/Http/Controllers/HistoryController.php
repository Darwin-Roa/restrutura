<?php

namespace App\Http\Controllers;

use App\Models\ImprovementPlan;
use App\Models\PlanAction;
use App\Models\User;
use App\Models\Period;
use App\Models\Evaluation;
use App\Models\TeacherCourse;
use App\Models\TaskAssignment;
use App\Models\FixedTask;
use App\Models\Evidence;
use App\Services\AIService;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    private function getComputedStatus($item, $type)
    {
        // If the item status is completed or verified, it's 'Realizado'
        if (in_array(strtolower($item->status), ['completed', 'verified', 'realizado'])) {
            return 'Realizado';
        }

        // Check if there is an approved evidence
        if ($item->evidences && $item->evidences->where('verified', true)->isNotEmpty()) {
            return 'Realizado';
        }

        // Determine the deadline date
        $deadlineStr = null;
        if ($type === 'fixed') {
            if (!empty($item->custom_deadline)) {
                $deadlineStr = $item->custom_deadline;
            } elseif ($item->fixedTask && !empty($item->fixedTask->deadline_month)) {
                $deadlineStr = $item->fixedTask->deadline_month;
            }
        } else { // action
            if (!empty($item->deadline)) {
                $deadlineStr = $item->deadline;
            }
        }

        if (!$deadlineStr) {
            return 'Pendiente';
        }

        // Try to parse deadline
        try {
            $deadline = \Carbon\Carbon::parse($deadlineStr);
            $today = \Carbon\Carbon::today();
            if ($deadline->lt($today)) {
                return 'Retrasado';
            }
        } catch (\Exception $e) {
            // If parsing fails, default to Pendiente
        }

        return 'Pendiente';
    }

    public function getGlobalHistory(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $periods = Period::orderBy('id', 'desc')->get();

            $teacherQuery = User::with('programa')->where('role', 'profesor')->where('is_active', true);
            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $teacherQuery->where('programa_id', $jwtUser->programa_id);
                } else {
                    $teacherQuery->whereRaw('1 = 0');
                }
            }
            $teachers = $teacherQuery->get();

            $history = [];
            foreach ($periods as $period) {
                $planCount = ImprovementPlan::where('period_id', $period->id);
                $evalCount = Evaluation::where('period_id', $period->id);

                if ($jwtUser->role !== 'admin') {
                    if ($jwtUser->programa_id) {
                        $planCount->whereHas('teacher', function ($q) use ($jwtUser) {
                            $q->where('programa_id', $jwtUser->programa_id);
                        });
                        $evalCount->whereHas('teacher', function ($q) use ($jwtUser) {
                            $q->where('programa_id', $jwtUser->programa_id);
                        });
                    } else {
                        $planCount->whereRaw('1 = 0');
                        $evalCount->whereRaw('1 = 0');
                    }
                }

                $history[] = [
                    'period' => $period,
                    'plans' => $planCount->count(),
                    'evaluations' => $evalCount->count(),
                ];
            }

            $evalQuery = Evaluation::with(['teacher.programa', 'period', 'course', 'studentComments']);
            $planQuery = ImprovementPlan::with(['actions', 'period', 'teacher.programa']);

            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $evalQuery->whereHas('teacher', function ($q) use ($jwtUser) {
                        $q->where('programa_id', $jwtUser->programa_id);
                    });
                    $planQuery->whereHas('teacher', function ($q) use ($jwtUser) {
                        $q->where('programa_id', $jwtUser->programa_id);
                    });
                } else {
                    $evalQuery->whereRaw('1 = 0');
                    $planQuery->whereRaw('1 = 0');
                }
            }

            $evaluations_timeline = $evalQuery->orderBy('id', 'desc')->get()->map(function ($ev) {
                $arr = $ev->toArray();
                $arr['Period'] = $ev->period ? $ev->period->toArray() : null;
                $arr['Course'] = $ev->course ? $ev->course->toArray() : null;
                $arr['StudentComments'] = $ev->studentComments ? $ev->studentComments->toArray() : [];
                if ($ev->teacher) {
                    $teacherArr = $ev->teacher->toArray();
                    $teacherArr['department'] = $ev->teacher->programa ? $ev->teacher->programa->nombre : null;
                    $arr['teacher'] = $teacherArr;
                }
                return $arr;
            });

            $plans_distribution = $planQuery->get()->map(function ($pl) {
                $arr = $pl->toArray();
                $arr['Period'] = $pl->period ? $pl->period->toArray() : null;
                if ($pl->teacher) {
                    $teacherArr = $pl->teacher->toArray();
                    $teacherArr['department'] = $pl->teacher->programa ? $pl->teacher->programa->nombre : 'General';
                    $arr['teacher'] = $teacherArr;
                }
                return $arr;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'history' => $history,
                    'evaluations_timeline' => $evaluations_timeline,
                    'plans_distribution' => $plans_distribution,
                    'total_teachers' => $teachers->count(),
                    'debug_total_db' => $teachers->count(),
                    'debug_periods' => $periods->count(),
                    'debug_raw_plans' => $plans_distribution->count(),
                ],
                'teachers' => $teachers->makeHidden('password'),
                'periods' => $periods,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getTeacherTasks(Request $request, $teacherId)
    {
        try {
            $activePeriod = Period::where('is_active', true)->first();

            // Fixed task assignments
            $assignments = TaskAssignment::with(['fixedTask', 'course', 'evidences'])
                ->where('teacher_id', $teacherId)
                ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                ->get();

            // AI plan actions
            $plan = ImprovementPlan::with(['actions.evidences', 'actions.course'])
                ->where('teacher_id', $teacherId)
                ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                ->where('status', 'approved')
                ->first();

            // Debt from previous periods
            $debtAssignments = [];
            $debtActions = [];
            if ($activePeriod) {
                $debtAssignments = TaskAssignment::with(['fixedTask', 'course', 'evidences'])
                    ->where('teacher_id', $teacherId)
                    ->where('period_id', '!=', $activePeriod->id)
                    ->whereIn('status', ['pending', 'in_progress'])
                    ->get();

                $prevPlans = ImprovementPlan::where('teacher_id', $teacherId)
                    ->where('period_id', '!=', $activePeriod->id)->pluck('id');
                if ($prevPlans->isNotEmpty()) {
                    $debtActions = PlanAction::with(['course', 'evidences'])
                        ->whereIn('plan_id', $prevPlans)
                        ->whereIn('status', ['pending', 'in_progress'])
                        ->get();
                }
            }

            // Map fixedTasks
            $fixedTasks = $assignments->map(function ($assignment) {
                $arr = $assignment->toArray();
                $arr['FixedTask'] = $assignment->fixedTask ? $assignment->fixedTask->toArray() : null;
                $arr['computed_status'] = $this->getComputedStatus($assignment, 'fixed');
                return $arr;
            });

            // Map planActions
            $planActions = [];
            if ($plan && $plan->actions) {
                $planActions = $plan->actions->map(function ($action) {
                    $arr = $action->toArray();
                    $arr['computed_status'] = $this->getComputedStatus($action, 'action');
                    return $arr;
                })->toArray();
            }

            // Map debtAssignments
            $debtAssignmentsFormatted = collect($debtAssignments)->map(function ($assignment) {
                $arr = $assignment->toArray();
                $arr['FixedTask'] = $assignment->fixedTask ? $assignment->fixedTask->toArray() : null;
                $arr['computed_status'] = $this->getComputedStatus($assignment, 'fixed');
                return $arr;
            })->toArray();

            // Map debtActions
            $debtActionsFormatted = collect($debtActions)->map(function ($action) {
                $arr = $action->toArray();
                $arr['computed_status'] = $this->getComputedStatus($action, 'action');
                return $arr;
            })->toArray();

            // Fetch raw plans in active period
            $rawPlans = ImprovementPlan::where('teacher_id', $teacherId)
                ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                ->get();

            return response()->json([
                'success' => true,
                'fixedTasks' => $fixedTasks,
                'planActions' => $planActions,
                'rawPlans' => $rawPlans,
                'activePeriodId' => $activePeriod ? $activePeriod->id : null,
                'debtAssignments' => $debtAssignmentsFormatted,
                'debtActions' => $debtActionsFormatted,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getGlobalTracking(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $activePeriod = Period::where('is_active', true)->first();

            $teacherQuery = User::with('programa')->where('role', 'profesor')->where('is_active', true);
            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $teacherQuery->where('programa_id', $jwtUser->programa_id);
                } else {
                    $teacherQuery->whereRaw('1 = 0');
                }
            }
            $teachers = $teacherQuery->get();

            $tracking = [];
            foreach ($teachers as $teacher) {
                $totalAssignments = TaskAssignment::where('teacher_id', $teacher->id)
                    ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                    ->count();
                $completedAssignments = TaskAssignment::where('teacher_id', $teacher->id)
                    ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                    ->whereIn('status', ['completed', 'verified'])
                    ->count();

                $plan = ImprovementPlan::where('teacher_id', $teacher->id)
                    ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                    ->first();

                $totalActions = 0;
                $completedActions = 0;
                if ($plan && $plan->status === 'approved') {
                    $totalActions = PlanAction::where('plan_id', $plan->id)->count();
                    $completedActions = PlanAction::where('plan_id', $plan->id)
                        ->whereIn('status', ['completed', 'verified'])->count();
                }

                $total = $totalAssignments + $totalActions;
                $completed = $completedAssignments + $completedActions;

                $tracking[] = [
                    'teacher' => [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        'email' => $teacher->email,
                        'role' => $teacher->role,
                        'programa_id' => $teacher->programa_id,
                        'is_active' => $teacher->is_active,
                        'department' => $teacher->programa ? $teacher->programa->nombre : null,
                    ],
                    'planStatus' => $plan ? $plan->status : null,
                    'planId' => $plan ? $plan->id : null,
                    'totalTasks' => $total,
                    'verifiedTasks' => $completed,
                    'progress' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
                ];
            }

            return response()->json([
                'success' => true,
                'tracking' => $tracking,
                'period' => $activePeriod ? $activePeriod->name : 'Sin Periodo Activo'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getGlobalAIAnalysis(Request $request)
    {
        try {
            $ai = new AIService();
            $analysis = $ai->generateGlobalAnalysis($request->all());
            return response()->json(['success' => true, 'analysis' => $analysis]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
