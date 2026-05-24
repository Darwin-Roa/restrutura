<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $table = 'evaluaciones_desempeno';
    DB::statement("ALTER TABLE $table DROP FOREIGN KEY evaluaciones_desempeno_ibfk_4");
    echo "Dropped FK evaluaciones_desempeno_ibfk_4 (created_by)\n";
    
    DB::statement("ALTER TABLE $table ADD CONSTRAINT fk_evaluaciones_created_by FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE");
    echo "Added FK fk_evaluaciones_created_by (created_by) -> usuarios(id)\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

