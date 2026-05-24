<?php

namespace App\Http\Controllers;

use App\Models\ImprovementPlan;
use App\Models\PlanAction;
use App\Models\User;
use App\Models\Period;
use App\Models\Evaluation;
use App\Models\TaskAssignment;
use App\Models\FixedTask;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function previewPlanHtml(Request $request, $planId)
    {
        try {
            $plan = ImprovementPlan::with(['teacher.programa', 'period', 'actions', 'evaluation'])
                ->findOrFail($planId);

            $jwtUser = $request->user();
            $userModel = \App\Models\User::find($jwtUser->id);

            $html = ExportService::generarHTMLCartaModelo($plan, $userModel);
            return response($html)->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function exportPlanPdf(Request $request, $planId)
    {
        try {
            $plan = ImprovementPlan::with(['teacher.programa', 'period', 'actions', 'evaluation'])
                ->findOrFail($planId);

            $jwtUser = $request->user();
            $userModel = \App\Models\User::find($jwtUser->id);

            $html = ExportService::generarHTMLCartaModelo($plan, $userModel);
            $pdf = Pdf::loadHTML($html)->setPaper('letter');

            return $pdf->download("plan_mejora_{$plan->teacher->name}.pdf");
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function exportGlobalCsv(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $query = ImprovementPlan::with(['teacher', 'period', 'actions']);
            
            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $query->whereHas('teacher', function ($q) use ($jwtUser) {
                        $q->where('programa_id', $jwtUser->programa_id);
                    });
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
            
            $plans = $query->get();
            $csv = "ID,Docente,Periodo,Estado,Diagnóstico,# Acciones\n";
            foreach ($plans as $p) {
                $csv .= "\"{$p->id}\",\"{$p->teacher->name}\",\"{$p->period->name}\",\"{$p->status}\",\"" .
                    str_replace('"', '""', substr($p->diagnosis_text ?? '', 0, 200)) .
                    "\",\"{$p->actions->count()}\"\n";
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="planes_mejora_global.csv"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function exportMatrizGlobalExcel(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $activePeriod = Period::where('is_active', true)->first();
            
            $teacherQuery = User::where('role', 'profesor')->where('is_active', true);
            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $teacherQuery->where('programa_id', $jwtUser->programa_id);
                } else {
                    $teacherQuery->whereRaw('1 = 0');
                }
            }
            $teachers = $teacherQuery->get();
            
            $tasks = FixedTask::where('period_id', $activePeriod?->id)->where('is_active', true)->get();

            // Generar formato HTML para que Excel lo interprete con estilos (negrilla)
            $html = "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\">";
            $html .= "<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head>";
            $html .= "<body><table border=\"1\">";
            
            // Header Row (CEDULA)
            $html .= "<tr>";
            $html .= "<td style=\"background-color: #f2f2f2;\"><b>CEDULA</b></td>";
            foreach ($teachers as $teacher) {
                $html .= "<td>" . htmlspecialchars($teacher->cedula ?? 'N/A') . "</td>";
            }
            $html .= "</tr>";

            // Group tasks by area
            $groupedTasks = $tasks->groupBy('management_area');

            foreach ($groupedTasks as $areaName => $areaTasks) {
                $isGroup = !empty($areaName) && $areaName !== 'Otros';

                if ($isGroup) {
                    $html .= "<tr>";
                    $html .= "<td><b>" . htmlspecialchars($areaName) . "</b></td>"; // Área en negrilla
                    foreach ($teachers as $t) { $html .= "<td></td>"; }
                    $html .= "</tr>";
                }

                foreach ($areaTasks as $task) {
                    $html .= "<tr>";
                    // Add indentation if it's inside a group
                    $prefix = $isGroup ? "&nbsp;&nbsp;&nbsp;&nbsp;" : "";
                    $html .= "<td>" . $prefix . htmlspecialchars($task->activity) . "</td>";
                    
                    foreach ($teachers as $teacher) {
                        $assignment = TaskAssignment::where('teacher_id', $teacher->id)
                            ->where('fixed_task_id', $task->id)
                            ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                            ->first();
                        
                        if (!$assignment) {
                            $html .= "<td>N</td>";
                        } else {
                            if ($assignment->status === 'verified') {
                                if (!empty($assignment->teacher_response)) {
                                    $html .= "<td>" . htmlspecialchars($assignment->teacher_response) . "</td>";
                                } else {
                                    $html .= "<td>S</td>";
                                }
                            } else {
                                $html .= "<td>N</td>";
                            }
                        }
                    }
                    $html .= "</tr>";
                }
            }
            $html .= "</table></body></html>";

            return response($html, 200, [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="matriz_cumplimiento.xls"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getMatrizGlobalJson(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $activePeriod = Period::where('is_active', true)->first();
            
            $teacherQuery = User::where('role', 'profesor')->where('is_active', true);
            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $teacherQuery->where('programa_id', $jwtUser->programa_id);
                } else {
                    $teacherQuery->whereRaw('1 = 0');
                }
            }
            $teachers = $teacherQuery->get();
            
            $tasks = FixedTask::where('period_id', $activePeriod?->id)->where('is_active', true)->get();

            // Group tasks by management_area
            $areasData = [];
            foreach ($tasks as $task) {
                $areaName = $task->management_area ?? 'Otros';
                if (!isset($areasData[$areaName])) {
                    $areasData[$areaName] = [
                        'name' => $areaName,
                        'total' => 0,
                        'tasks' => []
                    ];
                }
                $areasData[$areaName]['tasks'][] = [
                    'id' => $task->id,
                    'name' => $task->activity
                ];
                $areasData[$areaName]['total']++;
            }
            $areasList = array_values($areasData);

            $docentes = [];
            foreach ($teachers as $teacher) {
                $teacherDoc = [
                    'id' => $teacher->id,
                    'nombre' => $teacher->name,
                    'areas' => []
                ];

                foreach ($areasList as $area) {
                    $areaDoc = [
                        'nombreArea' => $area['name'],
                        'total' => $area['total'],
                        'completadas' => 0,
                        'actividades' => []
                    ];

                    foreach ($area['tasks'] as $taskItem) {
                        $assignment = TaskAssignment::where('teacher_id', $teacher->id)
                            ->where('fixed_task_id', $taskItem['id'])
                            ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                            ->first();
                        
                        $status = $assignment ? $assignment->status : 'pending';
                        $isCompleted = ($status === 'verified');
                        
                        if ($isCompleted) {
                            $areaDoc['completadas']++;
                        }

                        $areaDoc['actividades'][] = [
                            'id' => $taskItem['id'],
                            'nombre' => $taskItem['name'],
                            'completado' => $isCompleted
                        ];
                    }
                    $teacherDoc['areas'][] = $areaDoc;
                }
                $docentes[] = $teacherDoc;
            }

            return response()->json([
                'success' => true,
                'period' => $activePeriod ? $activePeriod->name : 'Sin Periodo Activo',
                'docentes' => $docentes,
                'areasList' => $areasList
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
