<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\TaskAssignment;

$profesor = User::where('role', 'profesor')->where('is_active', true)->first();
$assignments = TaskAssignment::with(['fixedTask', 'course', 'period'])->where('teacher_id', $profesor->id)->get();
echo json_encode($assignments->first(), JSON_PRETTY_PRINT);
