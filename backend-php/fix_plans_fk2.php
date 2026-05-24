<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "Cleaning orphaned rows from planes_mejora_ia...\n";
    DB::statement('DELETE FROM planes_mejora_ia WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    
    // Also clean up plan actions
    DB::statement('DELETE FROM acciones_plan WHERE plan_id NOT IN (SELECT id FROM planes_mejora_ia)');
    
    echo "Orphaned rows deleted.\n";
} catch (\Exception $e) {
    echo "Error cleaning rows: " . $e->getMessage() . "\n";
}

try {
    echo "Adding new foreign key to usuarios table...\n";
    DB::statement('ALTER TABLE planes_mejora_ia ADD CONSTRAINT planes_mejora_ia_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE');
    echo "New foreign key created successfully!\n";
} catch (\Exception $e) {
    echo "Error creating new FK: " . $e->getMessage() . "\n";
}
