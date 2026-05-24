<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ImprovementPlan;

$teacher = User::where('nombre', 'like', '%Heidy%')->orWhere('nombre', 'like', '%Adarme%')->first();
if (!$teacher) {
    echo "Teacher not found.\n";
    exit;
}
echo "Teacher ID: " . $teacher->id . " Name: {$teacher->nombre}\n";

$plans = ImprovementPlan::with('actions', 'period')->where('teacher_id', $teacher->id)->orderBy('period_id')->get();
foreach ($plans as $plan) {
    echo "Plan ID: {$plan->id} | Period: {$plan->period->name} | Status: {$plan->status} | Diagnosis: ".substr($plan->diagnosis_text, 0, 50)."\n";
    foreach ($plan->actions as $action) {
        echo "  Action ID: {$action->id} | carry_over_count: {$action->carry_over_count} | Status: {$action->status} | Text: " . substr($action->concrete_action, 0, 50) . "\n";
    }
    echo "--------------------------\n";
}
