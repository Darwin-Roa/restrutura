<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

App\Models\PlanAction::whereIn('id', [534, 535, 536, 537])->update(['carry_over_count' => 1]);
echo "Fixed Heidy actions!\n";
