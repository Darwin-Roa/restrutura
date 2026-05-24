<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = Illuminate\Support\Facades\DB::select('SHOW TABLES');
$dbName = 'mejora_profesoral';
$key = "Tables_in_" . $dbName;

echo "\n=== LISTADO DE TABLAS ===\n";
foreach ($tables as $t) {
    $tableName = $t->$key ?? ((array)$t)[key((array)$t)];
    
    $count = Illuminate\Support\Facades\DB::table($tableName)->count();
    echo str_pad($tableName, 35) . " - $count registros\n";
}
echo "\n";
