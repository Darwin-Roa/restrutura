<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "Dropping old foreign key...\n";
    DB::statement('ALTER TABLE planes_mejora_ia DROP FOREIGN KEY planes_mejora_ia_ibfk_1');
    echo "Old foreign key dropped.\n";
} catch (\Exception $e) {
    echo "Note: Old FK might not exist or already dropped: " . $e->getMessage() . "\n";
}

try {
    echo "Adding new foreign key to usuarios table...\n";
    DB::statement('ALTER TABLE planes_mejora_ia ADD CONSTRAINT planes_mejora_ia_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE');
    echo "New foreign key created successfully!\n";
} catch (\Exception $e) {
    echo "Error creating new FK: " . $e->getMessage() . "\n";
}
