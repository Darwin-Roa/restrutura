<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $plan = \App\Models\ImprovementPlan::findOrFail(89);
    \App\Models\PlanAction::where('plan_id', $plan->id)->delete();
    $plan->forceDelete();
    echo "Deleted successfully\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
