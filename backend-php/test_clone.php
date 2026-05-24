<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\FixedTask;
use App\Models\TaskAssignment;
use App\Models\User;
use App\Models\Period;
use App\Models\TeacherCourse;

try {
    $activePeriod = Period::where('is_active', true)->firstOrFail();
    $jwtUser = User::where('role', 'director')->first(); // Simulate user
    
    $tasks = FixedTask::where('period_id', $activePeriod->id)->where('is_active', true)->get();
    
    $professorsQuery = User::where('role', 'profesor')->where('is_active', true);
    if ($jwtUser->role === 'director') {
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
    echo "Success! Created: $created\n";
} catch (\Exception $e) {
    echo "ERROR:\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
