<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $teacher = \App\Models\User::where('role', 'profesor')->first();
    $period = \App\Models\Period::first();
    
    if (!$teacher || !$period) {
        die("No teacher or period found\n");
    }

    $ai = new \App\Services\AIService();
    $p = $ai->generateImprovementPlan([
        'teacher' => $teacher,
        'evaluation' => null,
        'assignments' => collect([]),
        'previousPlans' => collect([])
    ]);

    // Simulate frontend mapping
    $formattedPlan = [
        'diagnosis_text' => $p['diagnosis'] ?? $p['diagnosis_text'] ?? '',
        'consolidated_comments' => $p['consolidated_comments'] ?? [],
        'strengths' => $p['strengths'] ?? [],
        'improvement_opps' => $p['improvement_opportunities'] ?? $p['improvement_opps'] ?? [],
        'objectives' => $p['objectives'] ?? [],
        'actions' => $p['plan_actions'] ?? $p['actions'] ?? [],
        'work_plan' => $p['work_plan'] ?? [],
        'history_analysis' => $p['history_analysis'] ?? null
    ];

    // Simulate save request
    $request = new \Illuminate\Http\Request();
    $request->merge([
        'teacher_id' => $teacher->id,
        'period_id' => $period->id,
        'planData' => $formattedPlan,
        'status' => 'ai_generated'
    ]);

    $controller = new \App\Http\Controllers\PlanController();
    $response = $controller->save($request);
    
    echo "Response:\n";
    echo $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
