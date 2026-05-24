<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $teacherId = 16;
    $periodId = 1; // Assuming period 1 for testing
    
    $teacher = \App\Models\User::findOrFail($teacherId);
    $evaluation = \App\Models\Evaluation::where('teacher_id', $teacherId)->where('period_id', $periodId)->first();
    $assignments = \App\Models\TeacherCourse::with('course')->where('teacher_id', $teacherId)->where('period_id', $periodId)->get();
    $previousPlans = \App\Models\ImprovementPlan::where('teacher_id', $teacherId)->where('period_id', '<', $periodId)->get();
    
    echo "Testing generate for teacher: " . $teacher->id . "\n";
    $ai = new \App\Services\AIService();
    $result = $ai->generateImprovementPlan([
        'teacher' => $teacher,
        'evaluation' => $evaluation,
        'assignments' => $assignments,
        'previousPlans' => $previousPlans
    ]);

    echo "Success!\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
