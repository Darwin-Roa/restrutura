<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use App\Models\FixedTask;

$tasks = FixedTask::all();
$areas = $tasks->pluck('management_area')->unique()->values()->toArray();
echo "Areas found in DB:\n";
print_r($areas);
