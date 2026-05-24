<?php

namespace App\Http\Controllers;

use App\Models\FixedTask;
use App\Models\TaskAssignment;
use App\Models\User;
use App\Models\Period;
use App\Models\TeacherCourse;
use App\Models\Course;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $periodId = $request->query('period_id');
            $query = FixedTask::with(['creator', 'period']);

            if ($periodId) {
                $query->where('period_id', $periodId);
            }

            // Las tareas institucionales son globales del periodo académico.
            // Todos los directores y admins deben visualizar todas las tareas activas.

            $tasks = $query->orderBy('id', 'desc')->get();
            return response()->json(['success' => true, 'tasks' => $tasks]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->only(['management_area', 'activity', 'expected_product', 'deadline_month', 'scope', 'specific_teacher_id', 'period_id']);
            
            // Adjust and clamp deadline_month to period range
            if (!empty($data['deadline_month']) && !empty($data['period_id'])) {
                $period = Period::find($data['period_id']);
                if ($period) {
                    $deadline = $data['deadline_month'];
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline)) {
                        $periodYear = date('Y', strtotime($period->start_date));
                        $deadline = $periodYear . substr($deadline, 4);
                        if ($deadline < $period->start_date) {
                            $deadline = $period->start_date;
                        } elseif ($deadline > $period->end_date) {
                            $deadline = $period->end_date;
                        }
                        $data['deadline_month'] = $deadline;
                    }
                }
            }

            $data['created_by'] = $request->user()->id;
            $data['is_active'] = true;
            $task = FixedTask::create($data);
            return response()->json(['success' => true, 'task' => $task]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $task = FixedTask::findOrFail($id);
            $data = $request->only(['management_area', 'activity', 'expected_product', 'deadline_month', 'scope', 'specific_teacher_id', 'is_active']);

            // Adjust and clamp deadline_month to period range
            if (!empty($data['deadline_month'])) {
                $period = Period::find($task->period_id);
                if ($period) {
                    $deadline = $data['deadline_month'];
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline)) {
                        $periodYear = date('Y', strtotime($period->start_date));
                        $deadline = $periodYear . substr($deadline, 4);
                        if ($deadline < $period->start_date) {
                            $deadline = $period->start_date;
                        } elseif ($deadline > $period->end_date) {
                            $deadline = $period->end_date;
                        }
                        $data['deadline_month'] = $deadline;
                    }
                }
            }

            $task->update($data);

            // Propagate deadline changes to assignments
            if ($request->has('deadline_month')) {
                TaskAssignment::where('fixed_task_id', $id)
                    ->whereNull('custom_deadline')
                    ->update(['custom_deadline' => null]);
            }

            return response()->json(['success' => true, 'task' => $task]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $hasAssignments = TaskAssignment::where('fixed_task_id', $id)->exists();
            if ($hasAssignments) {
                return response()->json(['success' => false, 'message' => 'No se puede eliminar: tiene asignaciones activas'], 400);
            }
            FixedTask::destroy($id);
            return response()->json(['success' => true, 'message' => 'Tarea eliminada']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function cloneToPeriod(Request $request)
    {
        try {
            $activePeriod = Period::where('is_active', true)->firstOrFail();
            $jwtUser = $request->user();
            
            // Obtener todas las tareas institucionales activas del periodo
            $tasks = FixedTask::where('period_id', $activePeriod->id)->where('is_active', true)->get();
            
            // Si el usuario es director, solo asocia con los profesores de su programa académico
            $professorsQuery = User::where('role', 'profesor')->where('is_active', true);
            if ($jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $professorsQuery->where('programa_id', $jwtUser->programa_id);
                } else {
                    $professorsQuery->whereRaw('1 = 0');
                }
            }
            $professors = $professorsQuery->get();

            $created = 0;
            foreach ($tasks as $task) {
                foreach ($professors as $prof) {
                    if ($task->scope === 'individual' && $task->specific_teacher_id !== $prof->id) continue;

                    if ($task->scope === 'por_curso') {
                        $courses = TeacherCourse::where('teacher_id', $prof->id)
                            ->where('period_id', $activePeriod->id)->get();
                        foreach ($courses as $tc) {
                            $exists = TaskAssignment::where('fixed_task_id', $task->id)
                                ->where('teacher_id', $prof->id)
                                ->where('course_id', $tc->course_id)->exists();
                            if (!$exists) {
                                TaskAssignment::create([
                                    'fixed_task_id' => $task->id,
                                    'teacher_id' => $prof->id,
                                    'period_id' => $activePeriod->id,
                                    'course_id' => $tc->course_id,
                                    'status' => 'pending',
                                ]);
                                $created++;
                            }
                        }
                    } else {
                        $exists = TaskAssignment::where('fixed_task_id', $task->id)
                            ->where('teacher_id', $prof->id)
                            ->where('period_id', $activePeriod->id)->exists();
                        if (!$exists) {
                            TaskAssignment::create([
                                'fixed_task_id' => $task->id,
                                'teacher_id' => $prof->id,
                                'period_id' => $activePeriod->id,
                                'status' => 'pending',
                            ]);
                            $created++;
                        }
                    }
                }
            }

            return response()->json(['success' => true, 'message' => "{$created} asignaciones creadas", 'created' => $created]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getMyAssignments(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $activePeriod = Period::where('is_active', true)->first();

            $query = TaskAssignment::with(['fixedTask', 'course', 'evidences'])
                ->where('teacher_id', $jwtUser->id);

            if ($activePeriod) {
                $query->where('period_id', $activePeriod->id);
            }

            $assignments = clone $query;
            $assignments = $assignments->get();


            return response()->json([
                'success' => true,
                'assignments' => $assignments,
                'period' => $activePeriod,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateAssignmentStatus(Request $request, $id)
    {
        try {
            $assignment = TaskAssignment::findOrFail($id);
            $assignment->update([
                'status' => $request->status,
                'completed_at' => $request->status === 'completed' ? now() : $assignment->completed_at,
            ]);
            return response()->json(['success' => true, 'assignment' => $assignment]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function updateAssignmentDeadline(Request $request, $id)
    {
        try {
            $assignment = TaskAssignment::findOrFail($id);
            $assignment->update(['custom_deadline' => $request->deadline ?? $request->custom_deadline]);
            return response()->json(['success' => true, 'assignment' => $assignment]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function sendReminders(Request $request)
    {
        try {
            // TODO: Implement email sending when SMTP is configured
            return response()->json(['success' => true, 'message' => 'Recordatorios pendientes de configuración SMTP']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function resetAssignments(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $activePeriod = Period::where('is_active', true)->firstOrFail();
            
            $query = TaskAssignment::where('period_id', $activePeriod->id);
            
            // Si es director, solo elimina asignaciones de profesores de su programa académico
            if ($jwtUser->role !== 'admin' && $jwtUser->programa_id) {
                $teacherIds = User::where('role', 'profesor')
                    ->where('programa_id', $jwtUser->programa_id)
                    ->where('is_active', true)
                    ->pluck('id');
                $query->whereIn('teacher_id', $teacherIds);
            }
            
            $deleted = $query->delete();
            return response()->json(['success' => true, 'message' => "{$deleted} asignaciones eliminadas"]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function seedInstitutionalTasks(Request $request)
    {
        try {
            $activePeriod = Period::where('is_active', true)->firstOrFail();
            $userId = $request->user() ? $request->user()->id : null;
            $isValidUser = $userId ? User::where('id', $userId)->exists() : false;
            $createdBy = $isValidUser ? $userId : User::where('role', 'admin')->where('is_active', true)->value('id');
            
            $existing = FixedTask::where('period_id', $activePeriod->id)->where('is_active', true)->count();
            
            $TAREAS = [
                [
                    'management_area' => 'Compromisos Académicos',
                    'activity' => 'Firma Plan de Mejoramiento',
                    'expected_product' => 'Plan firmado (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Compromisos Académicos',
                    'activity' => 'Nivel de Inglés',
                    'expected_product' => 'Nivel certificado o declarado',
                    'deadline_month' => '2026-02-28',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Compromisos Académicos',
                    'activity' => 'Líderes MediaTic',
                    'expected_product' => 'Nivel de dominio declarado',
                    'deadline_month' => '2026-03-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Compromisos Académicos',
                    'activity' => 'Integración curricular con otros cursos',
                    'expected_product' => 'Listado de cursos integrados',
                    'deadline_month' => '2026-03-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Compromisos Académicos',
                    'activity' => 'Proyecto Integrador',
                    'expected_product' => 'Número de entregas realizadas',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Programa Analítico del Curso (PAC)',
                    'expected_product' => 'PAC subido a plataforma (S/N)',
                    'deadline_month' => '2026-05-20',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Presentación del Curso - Documento guía de aprendizaje',
                    'expected_product' => 'Documento publicado en plataforma (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Agenda del Curso (por semana tipo de trabajo)',
                    'expected_product' => 'Agenda publicada (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Pacto Pedagógico del Curso',
                    'expected_product' => 'Formulario diligenciado (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Perfil y Competencias institucionales y específicas del programa',
                    'expected_product' => 'Publicado en plataforma (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Foro de bienvenida',
                    'expected_product' => 'Foro creado y respondido (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Foro de novedades e inquietudes',
                    'expected_product' => 'Foro activo hasta fin de semestre (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Glosario de términos',
                    'expected_product' => 'Glosario publicado (S/N)',
                    'deadline_month' => '2026-02-28',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Fechas de actividades actualizadas',
                    'expected_product' => 'Calendario del curso actualizado (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Uso de Rúbricas de Evaluación',
                    'expected_product' => 'Rúbricas publicadas (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Aula Extendida',
                    'activity' => 'Recursos: OVAs, Bibliografía, Wiki (H5P), cuestionarios y talleres',
                    'expected_product' => 'Recursos disponibles - Apropiada (S/N)',
                    'deadline_month' => '2026-02-28',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Uso de la Biblioteca',
                    'activity' => 'Visita a biblioteca',
                    'expected_product' => 'Fecha de visita registrada',
                    'deadline_month' => '2026-03-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Uso de la Biblioteca',
                    'activity' => 'Tipo de ejercicio de biblioteca',
                    'expected_product' => 'Descripción del ejercicio realizado',
                    'deadline_month' => '2026-03-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'PAC en Word',
                    'expected_product' => 'PAC entregado (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'HMRA Inicial',
                    'expected_product' => 'HMRA Inicial entregado (S/N)',
                    'deadline_month' => '2026-01-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'HMRA 1er Corte',
                    'expected_product' => 'HMRA 1 Corte entregado (S/N)',
                    'deadline_month' => '2026-04-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'HMRA 2do Corte',
                    'expected_product' => 'HMRA 2 Corte entregado (S/N)',
                    'deadline_month' => '2026-07-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'HMRA 3er Corte',
                    'expected_product' => 'HMRA 3 Corte entregado (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'Bitácora',
                    'expected_product' => 'Bitácora entregada (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'Estrategia Didáctica',
                    'expected_product' => 'Estrategia Didáctica entregada (S/N)',
                    'deadline_month' => '2026-02-28',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Entrega de Documentos',
                    'activity' => 'Estudiantes con Pacto Pedagógico firmado',
                    'expected_product' => 'Porcentaje de estudiantes con pacto (%)',
                    'deadline_month' => '2026-02-28',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Internacionalización',
                    'activity' => 'Clases Espejo',
                    'expected_product' => 'Realizado (S/N) - Número de clases',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Internacionalización',
                    'activity' => 'Clases COILS',
                    'expected_product' => 'Realizado (S/N) - Número de clases',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Internacionalización',
                    'activity' => 'Uso de estrategias en inglés en cursos',
                    'expected_product' => 'Número de estrategias utilizadas',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Extensión',
                    'activity' => 'Visitas a empresas',
                    'expected_product' => 'Realizado (S/N) - Número de visitas',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Extensión',
                    'activity' => 'Otros procesos de extensión',
                    'expected_product' => 'Descripción del proceso realizado',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Tipo y cantidad de productos informados',
                    'expected_product' => 'Descripción de tipo y cantidad',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Actividad con Semilleros',
                    'expected_product' => 'Descripción de actividad',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Actividad pedagógica alineada con eje transversal',
                    'expected_product' => 'Descripción de la actividad',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Participación en actividades de cualificación pedagógica',
                    'expected_product' => 'Participó (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Participación en proceso de Formación Disciplinar',
                    'expected_product' => 'Participó (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Estrategia Diagnóstica de Presaberes',
                    'expected_product' => 'Realizó (S/N)',
                    'deadline_month' => '2026-02-28',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Taller Diseño de cuestionarios tipo Saber Pro',
                    'expected_product' => 'Asistió (S/N)',
                    'deadline_month' => '2026-03-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Ejercicio práctico en clase con evidencia digital',
                    'expected_product' => 'Realizó y recopiló evidencia (S/N)',
                    'deadline_month' => '2026-10-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Participación en actividades del programa',
                    'expected_product' => 'Participó (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Investigación',
                    'activity' => 'Estrategia fortalecimiento comunicación escrita',
                    'expected_product' => 'Ejecutó estrategia (S/N)',
                    'deadline_month' => '2026-11-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Informe de Gestión',
                    'activity' => 'Informe de Gestión — Junio',
                    'expected_product' => 'Informe entregado (S/N)',
                    'deadline_month' => '2026-05-31',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
                [
                    'management_area' => 'Informe de Gestión',
                    'activity' => 'Informe de Gestión — Diciembre',
                    'expected_product' => 'Informe entregado (S/N)',
                    'deadline_month' => '2026-05-30',
                    'scope' => 'global',
                    'specific_teacher_id' => null,
                ],
            ];
            
            $inserted = 0;
            $pStart = $activePeriod->start_date;
            $pEnd = $activePeriod->end_date;
            $pYear = date('Y', strtotime($pStart));

            foreach ($TAREAS as $t) {
                $exists = FixedTask::where('period_id', $activePeriod->id)
                    ->where('activity', $t['activity'])
                    ->exists();
                if (!$exists) {
                    $deadline = $t['deadline_month'];
                    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline)) {
                        $deadline = $pYear . substr($deadline, 4);
                        if ($deadline < $pStart) {
                            $deadline = $pStart;
                        } elseif ($deadline > $pEnd) {
                            $deadline = $pEnd;
                        }
                    } else {
                        $deadline = $pEnd;
                    }

                    FixedTask::create([
                        'management_area' => $t['management_area'],
                        'activity' => $t['activity'],
                        'expected_product' => $t['expected_product'],
                        'deadline_month' => $deadline,
                        'scope' => $t['scope'],
                        'specific_teacher_id' => $t['specific_teacher_id'],
                        'created_by' => $createdBy,
                        'is_active' => true,
                        'period_id' => $activePeriod->id,
                    ]);
                    $inserted++;
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "Se insertaron {$inserted} nuevas tareas institucionales en el periodo \"{$activePeriod->name}\". (Ya existían: {$existing})",
                'inserted' => $inserted,
                'period' => $activePeriod->name
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function cleanupBadAssignments()
    {
        try {
            $deleted = TaskAssignment::whereNull('fixed_task_id')->orWhereNull('teacher_id')->delete();
            return response()->json(['success' => true, 'message' => "{$deleted} asignaciones corruptas eliminadas"]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
