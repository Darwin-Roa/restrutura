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

    echo "Testing generate for teacher: " . $teacher->id . "\n";
    $ai = new \App\Services\AIService();
    $result = $ai->generateImprovementPlan([
        'teacher' => $teacher,
        'evaluation' => null,
        'assignments' => collect([]),
        'previousPlans' => collect([])
    ]);

    print_r($result);
    echo "\nSuccess\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
