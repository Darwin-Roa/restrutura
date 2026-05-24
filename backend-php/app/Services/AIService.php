<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private $provider;
    
    // Gemini Settings
    private $geminiApiKey;
    private $geminiModel = 'gemini-3.5-flash';
    
    // OpenAI Settings
    private $openaiApiKey;
    private $openaiModel;

    public function __construct()
    {
        $this->provider = env('AI_PROVIDER', 'gemini');
        $this->geminiApiKey = env('GEMINI_API_KEY');
        $this->openaiApiKey = env('OPENAI_API_KEY');
        $this->openaiModel = env('OPENAI_MODEL', 'gpt-4o-mini');
    }

    /**
     * Main router for AI calls based on provider
     */
    private function callAI($prompt, $maxRetries = 5)
    {
        if ($this->provider === 'openai') {
            return $this->callOpenAI($prompt, $maxRetries);
        }
        
        // Default to Gemini
        return $this->callGemini($prompt, $maxRetries);
    }

    private function callGemini($prompt, $maxRetries = 5)
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->geminiModel}:generateContent?key={$this->geminiApiKey}";

        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            try {
                $response = Http::timeout(120)->post($url, [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                        'thinkingConfig' => ['thinkingBudget' => 1024],
                    ],
                ]);

                if ($response->status() === 429 || $response->status() === 503) {
                    $wait = pow(2, $attempt) * 1000000; // microseconds
                    usleep($wait);
                    continue;
                }

                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($text) {
                    $decoded = json_decode($text, true);
                    return $decoded ?? $text;
                }

                return null;
            } catch (\Exception $e) {
                Log::error("Gemini API error attempt {$attempt}: " . $e->getMessage());
                if ($attempt < $maxRetries - 1) {
                    usleep(pow(2, $attempt) * 1000000);
                }
            }
        }

        throw new \Exception('Gemini API: max retries exceeded');
    }

    private function callOpenAI($prompt, $maxRetries = 5)
    {
        $url = "https://api.openai.com/v1/chat/completions";

        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            try {
                $response = Http::timeout(120)
                    ->withToken($this->openaiApiKey)
                    ->post($url, [
                        'model' => $this->openaiModel,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'response_format' => ['type' => 'json_object'],
                    ]);

                if ($response->status() === 429 || $response->status() === 503) {
                    $wait = pow(2, $attempt) * 1000000; // microseconds
                    usleep($wait);
                    continue;
                }

                $data = $response->json();
                $text = $data['choices'][0]['message']['content'] ?? null;

                if ($text) {
                    $decoded = json_decode($text, true);
                    return $decoded ?? $text;
                }

                return null;
            } catch (\Exception $e) {
                Log::error("OpenAI API error attempt {$attempt}: " . $e->getMessage());
                if ($attempt < $maxRetries - 1) {
                    usleep(pow(2, $attempt) * 1000000);
                }
            }
        }

        throw new \Exception('OpenAI API: max retries exceeded');
    }

    public function generateImprovementPlan($data)
    {
        $teacher = $data['teacher'];
        $evaluation = $data['evaluation'] ?? null;
        $previousPlans = $data['previousPlans'] ?? [];
        $assignments = $data['assignments'] ?? [];

        $coursesStr = $assignments->map(fn($a) => $a->course?->name ?? 'Sin curso')->join(', ');

        $isExcellent = false;
        $negativeCommentsCount = 0;

        $scoresStr = '';
        if ($evaluation) {
            $scoresStr = "Estudiantes: {$evaluation->score_students}, Director: {$evaluation->score_director}, Auto: {$evaluation->score_self}, Total: {$evaluation->score_total}";
            
            // Si la nota total es alta (ej: >= 4.0 en escala 5, o >= 80 en escala 100)
            if (floatval($evaluation->score_total) >= 4.0 || floatval($evaluation->score_total) >= 80) {
                $isExcellent = true;
            }

            if ($evaluation->studentComments && $evaluation->studentComments->count() > 0) {
                $negativeCommentsCount = $evaluation->studentComments->filter(function($c) {
                    return strtolower($c->sentiment) === 'negative';
                })->count();
                
                $comments = $evaluation->studentComments->map(fn($c) => "- [{$c->sentiment}] {$c->comment_text}")->join("\n");
                $scoresStr .= "\n\nComentarios de estudiantes:\n{$comments}";
            }
        }

        $historyStr = '';
        foreach ($previousPlans as $pp) {
            $historyStr .= "Periodo {$pp->period?->name}: Estado={$pp->status}, Acciones=" . ($pp->actions?->count() ?? 0) . "\n";
        }
        
        $flexibilityRule = "Genera entre 3 y 6 acciones específicas, medibles y con fechas.";
        if ($isExcellent && $negativeCommentsCount === 0) {
            $flexibilityRule = "CRITERIO DE FLEXIBILIDAD: El docente tiene excelentes calificaciones y no tiene comentarios negativos. Genera MÁXIMO 1 o 2 acciones de mejora (enfocadas en mantenimiento) y máximo 1 a 2 fortalezas/oportunidades.";
        }

        $prompt = <<<PROMPT
        Eres un experto en evaluación docente universitaria colombiana. Genera un plan de mejora profesoral en JSON con la siguiente estructura:
        {
          "diagnosis_text": "texto de diagnóstico",
          "strengths": ["fortaleza1", "fortaleza2"],
          "improvement_opps": ["oportunidad1", "oportunidad2"],
          "objectives": ["objetivo1", "objetivo2"],
          "consolidated_comments": { "positive": [...], "negative": [...], "topics": [...] },
          "work_plan": { "summary": "..." },
          "history_analysis": "análisis del historial",
          "actions": [
            {
              "aspect": "aspecto a mejorar",
              "concrete_action": "acción concreta",
              "verifiable_product": "producto verificable",
              "expected_goal": "meta esperada",
              "deadline": "YYYY-MM-DD"
            }
          ]
        }

        DATOS DEL DOCENTE:
        - Nombre: {$teacher->name}
        - Cursos: {$coursesStr}

        PUNTUACIONES EVALUACIÓN:
        {$scoresStr}

        HISTORIAL PREVIO:
        {$historyStr}

        {$flexibilityRule}
        Responde SOLO con el JSON.
        PROMPT;

        return $this->callAI($prompt);
    }

    public function classifySentiments($comments)
    {
        if (empty($comments)) return [];

        $commentsList = is_array($comments)
            ? implode("\n", array_map(fn($c) => is_string($c) ? $c : ($c['text'] ?? $c['comment_text'] ?? ''), $comments))
            : $comments;

        $prompt = <<<PROMPT
        Clasifica cada uno de los siguientes comentarios de estudiantes como "positive", "negative" o "neutral".
        Responde en JSON como array: [{"text": "comentario", "sentiment": "positive|negative|neutral"}]

        Comentarios:
        {$commentsList}
        PROMPT;

        $result = $this->callAI($prompt);
        return is_array($result) ? $result : [];
    }

    public function generateGlobalAnalysis($stats)
    {
        $statsJson = json_encode($stats, JSON_UNESCAPED_UNICODE);

        $prompt = <<<PROMPT
        Eres un analista educativo. Genera un párrafo de análisis cualitativo (máximo 200 palabras) basado en estas estadísticas globales de cumplimiento docente:
        {$statsJson}
        Responde en JSON: {"analysis": "tu párrafo aquí"}
        PROMPT;

        $result = $this->callAI($prompt);
        return is_array($result) ? ($result['analysis'] ?? '') : '';
    }

    public function generateRecognitionDraft($data)
    {
        $dataJson = json_encode($data, JSON_UNESCAPED_UNICODE);

        $prompt = <<<PROMPT
        Genera un borrador de reconocimiento para un docente universitario destacado.
        Datos: {$dataJson}
        Responde en JSON: {"title": "Título del reconocimiento", "description": "Texto descriptivo del reconocimiento"}
        PROMPT;

        return $this->callAI($prompt);
    }
}
