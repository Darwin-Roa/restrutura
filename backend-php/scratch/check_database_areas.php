<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "--- AREAS TABLE ---\n";
$areas = DB::table('areas')->get();
foreach ($areas as $area) {
    echo "- ID: {$area->id}, Name: '{$area->name}', Active: {$area->is_active}\n";
}

echo "\n--- UNIQUE AREAS IN TASKS TABLE ---\n";
$taskAreas = DB::table('tareas_fijas')->select('management_area')->distinct()->get();
foreach ($taskAreas as $ta) {
    echo "- '{$ta->management_area}'\n";
}
