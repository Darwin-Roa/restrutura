<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\StudentComment;
use App\Models\User;
use App\Services\AIService;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    private function processComments($eval, Request $request, $useGemini = true)
    {
        $ai = new AIService();
        $allComments = [];

        if ($request->has('student_comments') && is_array($request->student_comments)) {
            foreach ($request->student_comments as $text) {
                if (trim($text)) $allComments[] = ['text' => trim($text), 'source' => 'student'];
            }
        }
        if ($request->has('rep_comments') && is_array($request->rep_comments)) {
            foreach ($request->rep_comments as $text) {
                if (trim($text)) $allComments[] = ['text' => trim($text), 'source' => 'representative'];
            }
        }
        if ($request->has('self_eval_comments') && is_array($request->self_eval_comments)) {
            foreach ($request->self_eval_comments as $text) {
                if (trim($text)) $allComments[] = ['text' => trim($text), 'source' => 'self_evaluation'];
            }
        }

        if (count($allComments) > 0) {
            $classified = [];
            if ($useGemini) {
                try {
                    $textsToClassify = array_map(function($c) { return $c['text']; }, $allComments);
                    $classified = $ai->classifySentiments($textsToClassify);
                } catch (\Exception $e) {
                    // Fallback to neutral if Gemini fails
                }
            }

            foreach ($allComments as $index => $c) {
                StudentComment::create([
                    'evaluation_id' => $eval->id,
                    'course_id' => $eval->course_id,
                    'comment_text' => $c['text'],
                    'sentiment' => isset($classified[$index]['sentiment']) ? $classified[$index]['sentiment'] : 'neutral',
                    'source' => $c['source'],
                ]);
            }
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->only(['teacher_id', 'period_id', 'course_id', 'score_students', 'score_director', 'score_self', 'director_notes', 'student_rep_comments']);
            if (empty($data['course_id'])) {
                $data['course_id'] = null;
            }
            if (!isset($data['score_total'])) {
                $s1 = floatval($data['score_students'] ?? 0);
                $s2 = floatval($data['score_director'] ?? 0);
                $s3 = floatval($data['score_self'] ?? 0);
                $data['score_total'] = round(($s1 + $s2 + $s3) / 3, 1);
            }
            $data['created_by'] = $request->user()->id;

            $eval = Evaluation::create($data);

            $this->processComments($eval, $request);

            $eval->load('studentComments');
            return response()->json(['success' => true, 'evaluation' => $eval]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getByTeacher(Request $request, $teacherId)
    {
        try {
            $evals = Evaluation::with(['studentComments', 'course', 'period'])
                ->where('teacher_id', $teacherId)
                ->orderBy('id', 'desc')
                ->get();
            return response()->json(['success' => true, 'evaluations' => $evals]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $eval = Evaluation::findOrFail($id);
            $data = $request->only(['score_students', 'score_director', 'score_self', 'director_notes', 'student_rep_comments']);
            if (!isset($data['score_total'])) {
                $s1 = floatval($data['score_students'] ?? $eval->score_students);
                $s2 = floatval($data['score_director'] ?? $eval->score_director);
                $s3 = floatval($data['score_self'] ?? $eval->score_self);
                $data['score_total'] = round(($s1 + $s2 + $s3) / 3, 1);
            }
            $eval->update($data);

            StudentComment::where('evaluation_id', $id)->delete();
            $this->processComments($eval, $request);

            $eval->load('studentComments');
            return response()->json(['success' => true, 'evaluation' => $eval]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            StudentComment::where('evaluation_id', $id)->delete();
            Evaluation::destroy($id);
            return response()->json(['success' => true, 'message' => 'Evaluación eliminada']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function massUpload(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file'
            ]);

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $path = $file->getRealPath();
            
            $rows = [];
            
            if (in_array(strtolower($extension), ['csv', 'txt'])) {
                if (($handle = fopen($path, "r")) !== false) {
                    $firstLine = fgets($handle);
                    rewind($handle);
                    $delimiter = strpos($firstLine, ';') !== false ? ';' : ',';
                    
                    fgetcsv($handle, 1000, $delimiter); // Skip header
                    
                    while (($data = fgetcsv($handle, 1000, $delimiter)) !== false) {
                        if (count($data) >= 5) {
                            $rows[] = $data;
                        }
                    }
                    fclose($handle);
                }
            } else if (in_array(strtolower($extension), ['xlsx', 'xls'])) {
                // Forzar carga de la clase si el servidor (php artisan serve) no se ha reiniciado tras el composer require
                if (!class_exists(\Shuchkin\SimpleXLSX::class)) {
                    $sxPath = base_path('vendor/shuchkin/simplexlsx/src/SimpleXLSX.php');
                    if (file_exists($sxPath)) {
                        require_once $sxPath;
                    }
                }

                if (class_exists(\Shuchkin\SimpleXLSX::class)) {
                    if ( $xlsx = \Shuchkin\SimpleXLSX::parse($path) ) {
                        $allRows = $xlsx->rows();
                        if (count($allRows) > 1) {
                            array_shift($allRows); // remove header
                            $rows = $allRows;
                        }
                    } else {
                        return response()->json(['success' => false, 'message' => 'Error leyendo Excel: ' . \Shuchkin\SimpleXLSX::parseError()], 400);
                    }
                } else {
                    return response()->json(['success' => false, 'message' => 'Falta dependencia para procesar Excel. Reinicia el servidor (php artisan serve) o sube un archivo CSV.'], 501);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Formato no soportado. Por favor sube un archivo CSV o XLSX.'], 400);
            }

            $activePeriod = \App\Models\Period::where('is_active', true)->first();
            if (!$activePeriod) {
                return response()->json(['success' => false, 'message' => 'No hay un periodo activo configurado en el sistema.'], 400);
            }

            $successCount = 0;
            $errors = [];
            
            foreach ($rows as $index => $row) {
                // Format: Periodo,Email_Profesor,Nota_Estudiantes,Nota_Director,Auto_Nota,Notas_Director_Texto,Comentarios_Representantes,Comentarios_Estudiantes,Comentarios_Autoevaluacion
                if (empty(trim($row[0] ?? '')) || empty(trim($row[1] ?? ''))) {
                    continue;
                }
                
                $periodName = trim($row[0]);
                if (strcasecmp($periodName, $activePeriod->name) !== 0) {
                    $errors[] = "Fila " . ($index + 2) . ": El periodo '{$periodName}' no coincide con el periodo activo '{$activePeriod->name}'";
                    continue;
                }
                
                $email = trim($row[1]);
                $period = $activePeriod;
                
                $teacher = User::where('email', $email)->first();
                
                if (!$teacher) {
                    $errors[] = "Fila " . ($index + 2) . ": Profesor $email no encontrado";
                    continue;
                }
                
                $s1 = floatval(str_replace(',', '.', $row[2] ?? 0));
                $s2 = floatval(str_replace(',', '.', $row[3] ?? 0));
                $s3 = floatval(str_replace(',', '.', $row[4] ?? 0));
                $scoreTotal = round(($s1 + $s2 + $s3) / 3, 1);
                
                $eval = Evaluation::where('period_id', $period->id)
                                  ->where('teacher_id', $teacher->id)
                                  ->whereNull('course_id')
                                  ->first();

                if ($eval) {
                    $eval->update([
                        'score_students' => $s1,
                        'score_director' => $s2,
                        'score_self' => $s3,
                        'score_total' => $scoreTotal,
                        'director_notes' => trim($row[5] ?? ''),
                        'student_rep_comments' => trim($row[6] ?? ''),
                        'created_by' => $request->user()->id,
                    ]);
                    
                    // Limpiar comentarios antiguos para no duplicarlos
                    StudentComment::where('evaluation_id', $eval->id)->delete();
                } else {
                    $eval = Evaluation::create([
                        'period_id' => $period->id,
                        'teacher_id' => $teacher->id,
                        'course_id' => null,
                        'score_students' => $s1,
                        'score_director' => $s2,
                        'score_self' => $s3,
                        'score_total' => $scoreTotal,
                        'director_notes' => trim($row[5] ?? ''),
                        'student_rep_comments' => trim($row[6] ?? ''),
                        'created_by' => $request->user()->id,
                    ]);
                }
                
                $req = new Request();
                $repComments  = !empty($row[6]) ? array_filter(array_map('trim', explode('|', $row[6]))) : [];
                $estComments  = !empty($row[7]) ? array_filter(array_map('trim', explode('|', $row[7]))) : [];
                $autoComments = !empty($row[8]) ? array_filter(array_map('trim', explode('|', $row[8]))) : [];
                
                $req->merge([
                    'rep_comments' => $repComments,
                    'student_comments' => $estComments,
                    'self_eval_comments' => $autoComments
                ]);
                
                // Evitamos llamar a Gemini en la carga masiva para no saturar la API
                $this->processComments($eval, $req, false);
                
                $successCount++;
            }
            
            return response()->json([
                'success' => true,
                'summary' => [
                    'success' => $successCount,
                    'skipped' => count($errors),
                    'errors' => $errors
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
