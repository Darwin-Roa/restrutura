<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    $tables = DB::select('SHOW TABLES');
    $db = "Tables_in_" . env('DB_DATABASE', 'restrutura');
    echo "Lista de tablas actuales:\n";
    foreach ($tables as $table) {
        $array = (array) $table;
        echo current($array) . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
