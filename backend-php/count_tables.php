<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

$tables = [
    'failed_jobs',
    'password_resets',
    'personal_access_tokens',
    'profesor_curso',
    'recognition',
    'reconocimientos_ia',
    'role_has_permissions',
    'self_evaluations',
    'user_has_permissions'
];

foreach ($tables as $table) {
    try {
        $count = DB::table($table)->count();
        echo str_pad($table, 25) . " : $count registros\n";
    } catch (Exception $e) {
        echo str_pad($table, 25) . " : ERROR - " . $e->getMessage() . "\n";
    }
}
