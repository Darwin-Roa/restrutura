<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

$db = env('DB_DATABASE', 'restrutura');

echo "=== FOREIGN KEYS ===\n";
$fks = DB::select("
    SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = '$db'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME
");

foreach ($fks as $fk) {
    echo "{$fk->TABLE_NAME}.{$fk->COLUMN_NAME} -> {$fk->REFERENCED_TABLE_NAME}.{$fk->REFERENCED_COLUMN_NAME}\n";
}

echo "\n=== COLUMNAS CLAVE POR TABLA ===\n";
$tables = DB::select("SHOW TABLES");
foreach ($tables as $t) {
    $tname = current((array)$t);
    $cols = DB::select("SHOW COLUMNS FROM `$tname`");
    $fields = array_map(fn($c) => $c->Field . '(' . $c->Type . ')', $cols);
    echo "\n[$tname]\n  " . implode(", ", $fields) . "\n";
}
