<?php

namespace App\Services;

class ExportService
{
    public static function generarHTMLCartaModelo($plan, $currentUser = null)
    {
        $teacher = $plan->teacher;
        $period = $plan->period;
        $evaluation = $plan->evaluation;
        $actions = $plan->actions;
        $programa = $teacher->programa;
        $programaNombre = $programa ? $programa->nombre : 'N/A';
        
        $directorUser = null;
        
        // If the current user is a director generating it, use THEIR signature
        if ($currentUser && !in_array($currentUser->role, ['profesor', 'estudiante', 'admin'])) {
            $directorUser = $currentUser;
        } else {
            // Otherwise, fetch a director or equivalent custom role for the program
            // Prefer one that actually has a signature uploaded
            $directorUser = \App\Models\User::whereNotIn('role', ['profesor', 'admin', 'estudiante'])
                                            ->where('programa_id', $teacher->programa_id)
                                            ->whereNotNull('signature_path')
                                            ->where('signature_path', '!=', '')
                                            ->first();

            // Fallback to any director if no one uploaded a signature yet
            if (!$directorUser) {
                $directorUser = \App\Models\User::whereNotIn('role', ['profesor', 'admin', 'estudiante'])
                                                ->where('programa_id', $teacher->programa_id)
                                                ->first();
            }
        }
        
        $directorNombre = $directorUser ? $directorUser->name : ($plan->director_name ?? 'N/A');
        
        $directorRoleText = 'Director / Coordinador de Programa';
        if ($directorUser) {
            if (strtolower($directorUser->role) === 'coordinador') {
                $directorRoleText = 'Coordinador de Programa';
            } elseif (strtolower($directorUser->role) === 'director') {
                $directorRoleText = 'Director de Programa';
            } else {
                $directorRoleText = ucfirst($directorUser->role);
            }
        }
        
        $getSignatureImage = function($user) {
            if ($user && $user->signature_path) {
                $path = public_path($user->signature_path);
                if (file_exists($path)) {
                    $type = pathinfo($path, PATHINFO_EXTENSION);
                    $data = file_get_contents($path);
                    $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    return '<img src="' . $base64 . '" style="height: 40px; margin-bottom: 5px;" />';
                }
            }
            return '<p style="margin-bottom: 40px; color: #555;">Firma:</p>';
        };

        $directorSignature = $getSignatureImage($directorUser);
        $teacherSignature = $getSignatureImage($teacher);

        // Fetch courses
        $coursesList = \App\Models\TeacherCourse::with('course')->where('teacher_id', $teacher->id)->where('period_id', $period->id)->get();
        $cursosStr = $coursesList->isEmpty() ? 'Sin cursos asignados' : implode(', ', $coursesList->pluck('course.name')->toArray());

        // Fetch Tasks (Plan de Trabajo)
        $assignments = \App\Models\TaskAssignment::with('fixedTask')->where('teacher_id', $teacher->id)->where('period_id', $period->id)->get();

        $actionsRows = '';
        foreach ($actions as $i => $action) {
            $num = $i + 1;
            $actionsRows .= "<tr>
                <td class='td-center'>{$num}</td>
                <td class='td-data'>" . htmlspecialchars($action->aspect) . "</td>
                <td class='td-data'>" . htmlspecialchars($action->concrete_action) . "</td>
                <td class='td-data'>" . htmlspecialchars($action->verifiable_product) . "</td>
                <td class='td-data'>" . htmlspecialchars($action->expected_goal ?? '') . "</td>
                <td class='td-center'>" . htmlspecialchars($action->deadline ?? '') . "</td>
            </tr>";
        }

        $strengths = is_array($plan->strengths) ? implode('</li><li>', array_map('htmlspecialchars', $plan->strengths)) : htmlspecialchars($plan->strengths ?? '');
        $opps = is_array($plan->improvement_opps) ? implode('</li><li>', array_map('htmlspecialchars', $plan->improvement_opps)) : htmlspecialchars($plan->improvement_opps ?? '');
        $objectives = is_array($plan->objectives) ? implode('</li><li>', array_map('htmlspecialchars', $plan->objectives)) : htmlspecialchars($plan->objectives ?? '');

        if (empty($objectives)) {
            $objectives = "<li>Definir e implementar acciones de mejora continua.</li>";
        }

        $scoreSection = '';
        if ($evaluation) {
            $scoreSection = "
            <table class='eval-table'>
                <tr>
                    <th>Evaluación Estudiantes</th>
                    <th>Evaluación Director</th>
                    <th>Autoevaluación</th>
                    <th>Total (Escala 1.0 – 5.0)</th>
                </tr>
                <tr>
                    <td><strong>{$evaluation->score_students}</strong></td>
                    <td><strong>{$evaluation->score_director}</strong></td>
                    <td><strong>{$evaluation->score_self}</strong></td>
                    <td><strong>{$evaluation->score_total}</strong></td>
                </tr>
            </table>";
        }

        // Attempt to fetch evaluation if the relationship evaluation_id is null
        if (!$evaluation) {
            $evaluation = \App\Models\Evaluation::where('teacher_id', $teacher->id)
                ->where('period_id', $period->id)
                ->first();
        }

        $comentarios = $plan->consolidated_comments;
        if (is_array($comentarios)) {
            $comentarios = implode(' ', $comentarios);
        }
        
        if (empty($comentarios) && $evaluation) {
            $comentarios = str_replace('|', ' ', $evaluation->student_rep_comments);
        }

        if (empty($comentarios)) {
            $comentarios = 'No se registraron comentarios adicionales de los estudiantes en la evaluación de este periodo.';
        } else {
            // Limitar a ~40 palabras para mostrar lo más relevante sin amontonar
            $comentarios = \Illuminate\Support\Str::words($comentarios, 40, '... (resumen).');
        }

        $comentariosHtml = "
            <p style='font-weight: bold; margin-bottom: 5px; font-size: 11pt;'>Comentarios de estudiantes:</p>
            <ul style='margin-top: 0;'>
                <li style='font-style: italic; text-align: justify; color: #555;'>". nl2br(htmlspecialchars($comentarios)) ."</li>
            </ul>";

        $workPlanRows = '';
        if ($assignments->isEmpty()) {
            $workPlanRows = "<tr><td colspan='4' class='td-center'>Sin tareas asignadas.</td></tr>";
        } else {
            foreach ($assignments as $assignment) {
                if ($assignment->fixedTask) {
                    $task = $assignment->fixedTask;
                    $cleanProduct = preg_replace('/\s*\(S\/N\)\s*-?\s*/', '', $task->expected_product);
                    $workPlanRows .= "<tr>
                        <td class='td-data'>" . htmlspecialchars($task->management_area) . "</td>
                        <td class='td-data'>" . htmlspecialchars($task->activity) . "</td>
                        <td class='td-data'>" . htmlspecialchars($cleanProduct) . "</td>
                        <td class='td-center'>" . htmlspecialchars(substr($task->deadline_month ?? '', 0, 7)) . "</td>
                    </tr>";
                }
            }
        }

        $fechaInicio = \Carbon\Carbon::parse($plan->createdAt)->format('d/m/Y');

        return <<<HTML
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Plan de Mejora - {$teacher->name}</title>
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; margin: 30px; color: #333; }
                .text-green { color: #1e8449; }
                
                .header-container { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1e8449; padding-bottom: 10px; }
                .header-container h1 { font-size: 16pt; margin: 0 0 5px 0; font-weight: bold; }
                .header-container p { margin: 0; font-size: 11pt; }
                
                .plan-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 20px 0; }
                
                .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .info-table td { padding: 8px 10px; border: 1px solid #ccc; font-size: 11pt; }
                .info-table .label { width: 35%; background-color: #f4f6f9; font-weight: bold; color: #1e8449; }
                .info-table .value { text-transform: uppercase; }
                
                .section-title { 
                    background-color: #e9ecef; 
                    border-left: 5px solid #1e8449; 
                    padding: 8px 12px; 
                    font-weight: bold; 
                    font-size: 12pt; 
                    margin: 25px 0 10px 0;
                    color: #1e8449;
                }
                
                .eval-table { width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center; }
                .eval-table th { background: #1e8449; color: white; padding: 10px; border: 1px solid #ccc; font-weight: bold; }
                .eval-table td { padding: 10px; border: 1px solid #ccc; background-color: #fdfdfd; }
                
                .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10pt; page-break-inside: auto; }
                .data-table tr { page-break-inside: avoid; page-break-after: auto; }
                .data-table th { background: #1e8449; color: white; padding: 8px; border: 1px solid #ccc; }
                .td-data { padding: 8px; border: 1px solid #ccc; }
                .td-center { padding: 8px; border: 1px solid #ccc; text-align: center; }
                
                .text-justify { text-align: justify; }
                ol { padding-left: 20px; margin-top: 5px; }
                li { margin-bottom: 8px; }
                
                .signatures { margin-top: 60px; display: flex; justify-content: space-between; width: 100%; }
                .sig-block { width: 45%; float: left; margin-top: 50px; }
                .sig-line { border-top: 1px solid #333; padding-top: 5px; }
                .clear { clear: both; }
            </style>
        </head>
        <body>
            <div class="header-container">
                <h1 class="text-green">UNIVERSIDAD SIMÓN BOLÍVAR</h1>
                <p>Sede Cúcuta &middot; Facultad de Ingeniería</p>
            </div>

            <div class="plan-title text-green">
                PLAN DE MEJORAMIENTO PROFESORAL — {$period->name}
            </div>

            <table class="info-table">
                <tr>
                    <td class="label">Nombre del profesor(a):</td>
                    <td class="value">{$teacher->name}</td>
                </tr>
                <tr>
                    <td class="label">Departamento / Programa:</td>
                    <td class="value">{$programaNombre}</td>
                </tr>
                <tr>
                    <td class="label">Cursos impartidos:</td>
                    <td class="value">{$cursosStr}</td>
                </tr>
                <tr>
                    <td class="label">Fecha de inicio del plan:</td>
                    <td class="value">{$fechaInicio}</td>
                </tr>
                <tr>
                    <td class="label">{$directorRoleText}:</td>
                    <td class="value">{$directorNombre}</td>
                </tr>
            </table>

            <div class="section-title">Diagnóstico Inicial</div>
            <p class="text-justify">El presente Plan de Mejoramiento Profesoral se elabora a partir de los resultados de la Evaluación del Desempeño profesoral correspondiente al periodo académico {$period->name}, los cuales se relacionan a continuación. Este proceso evaluativo contó con la participación de actores clave del ámbito académico, entre ellos estudiantes, profesores (autoevaluación) y líderes de procesos, así como con la verificación del cumplimiento de compromisos, evidencias e informes, lo que permitió una valoración integral de la práctica profesoral. Los resultados obtenidos constituyen el principal insumo para identificar fortalezas que deben mantenerse y oportunidades de mejora que orientan las acciones de fortalecimiento, con el propósito de contribuir al mejoramiento continuo de la calidad académica del programa.</p>

            {$scoreSection}

            {$comentariosHtml}

            <div class="section-title">1. Oportunidad de mejora identificada.</div>
            <ol><li>{$opps}</li></ol>

            <div class="section-title">2. Identificación de fortalezas.</div>
            <ol><li>{$strengths}</li></ol>

            <div class="section-title">3. Objetivos del Plan de Mejora.</div>
            <ol><li>{$objectives}</li></ol>

            <div class="section-title">4. Plan de Mejoramiento.</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">N°</th>
                        <th>Aspecto a mejorar</th>
                        <th>Acción concreta</th>
                        <th>Producto verificable</th>
                        <th>Meta esperada</th>
                        <th style="width: 80px;">Fecha límite</th>
                    </tr>
                </thead>
                <tbody>
                    {$actionsRows}
                </tbody>
            </table>

            <div class="section-title">5. Plan de Trabajo {$period->name}.</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Eje de gestión / Función sustantiva</th>
                        <th>Compromiso asignado / Actividad específica</th>
                        <th>Producto / Insumo esperado</th>
                        <th style="width: 80px;">Mes de entrega</th>
                    </tr>
                </thead>
                <tbody>
                    {$workPlanRows}
                </tbody>
            </table>

            <div class="section-title" style="background:transparent; border-left:none; padding:0; margin-top: 50px;">Firma de Compromiso</div>
            <div class="signatures">
                <div class="sig-block">
                    {$teacherSignature}
                    <div class="sig-line">
                        <strong>{$teacher->name}</strong><br>
                        Profesor
                    </div>
                </div>
                <div class="sig-block" style="float: right;">
                    {$directorSignature}
                    <div class="sig-line">
                        {$directorRoleText}<br>
                        {$programaNombre}
                    </div>
                </div>
                <div class="clear"></div>
            </div>
            
            <p style="margin-top: 40px;">Fecha: __________________________</p>
        </body>
        </html>
        HTML;
    }
}
