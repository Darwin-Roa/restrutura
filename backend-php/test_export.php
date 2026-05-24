<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Period;
use App\Models\User;
use App\Models\FixedTask;
use App\Models\TaskAssignment;

try {
    $activePeriod = Period::where('is_active', true)->first();
    $teachers = User::where('role', 'profesor')->where('is_active', true)->get();
    $tasks = FixedTask::where('period_id', $activePeriod?->id)->where('is_active', true)->get();

    $csv = "Docente";
    foreach ($tasks as $task) {
        $csv .= ",\"" . str_replace('"', '""', $task->activity) . "\"";
    }
    $csv .= "\n";

    foreach ($teachers as $teacher) {
        $csv .= "\"{$teacher->name}\"";
        foreach ($tasks as $task) {
            $assignment = TaskAssignment::where('teacher_id', $teacher->id)
                ->where('fixed_task_id', $task->id)
                ->when($activePeriod, fn($q) => $q->where('period_id', $activePeriod->id))
                ->first();
            $status = $assignment ? $assignment->status : 'N/A';
            $csv .= ",\"{$status}\"";
        }
        $csv .= "\n";
    }
    echo "¡Script de exportación terminó sin errores! (Longitud: " . strlen($csv) . ")\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
