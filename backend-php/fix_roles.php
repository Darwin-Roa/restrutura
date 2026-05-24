<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    DB::statement("UPDATE usuarios SET role = 'estudiante' WHERE rol = 'Estudiante'");
    DB::statement("UPDATE usuarios SET role = NULL WHERE rol IS NULL");
    echo "Falsos profesores limpiados exitosamente.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
