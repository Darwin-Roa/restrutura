<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    // FASE 0
    echo "Fase 0 - Alterando tabla usuarios...\n";
    $columns = DB::select("SHOW COLUMNS FROM usuarios LIKE 'role'");
    if (count($columns) == 0) {
        DB::statement("
            ALTER TABLE `usuarios`
              ADD COLUMN `role` varchar(50) NOT NULL DEFAULT 'profesor' AFTER `rol`,
              ADD COLUMN `programa_id` int(11) DEFAULT NULL,
              ADD COLUMN `is_active` tinyint(1) DEFAULT 1,
              ADD COLUMN `password` varchar(255) DEFAULT NULL,
              ADD COLUMN `updatedAt` datetime DEFAULT NULL,
              ADD COLUMN `deletedAt` datetime DEFAULT NULL;
        ");
        echo "Columnas anadidas.\n";
    } else {
        echo "Las columnas ya existen.\n";
    }

    echo "Fase 0 - Migrando usuarios_sistema a usuarios...\n";
    DB::statement("
        INSERT INTO `usuarios` 
          (nombre, email, cedula, password_hash, password, rol, role, is_active, creado_en)
        SELECT 
          name, email, cedula, '', password, 'Admin', 
          role, is_active, createdAt
        FROM `usuarios_sistema`
        WHERE email NOT IN (SELECT email FROM `usuarios`);
    ");
    echo "Usuarios migrados.\n";

    // FASE 1
    echo "Fase 1 - Borrando tablas inglesas duplicadas y usuarios_sistema...\n";
    DB::statement("DROP TABLE IF EXISTS `user`");
    DB::statement("DROP TABLE IF EXISTS `evaluation`");
    DB::statement("DROP TABLE IF EXISTS `improvement_plan`");
    DB::statement("DROP TABLE IF EXISTS `plan_action`");
    DB::statement("DROP TABLE IF EXISTS `task_assignment`");
    DB::statement("DROP TABLE IF EXISTS `teacher_course`");
    DB::statement("DROP TABLE IF EXISTS `fixed_task`");
    DB::statement("DROP TABLE IF EXISTS `period`");
    DB::statement("DROP TABLE IF EXISTS `student_comment`");
    DB::statement("DROP TABLE IF EXISTS `usuarios_sistema`");

    echo "Tablas eliminadas exitosamente.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
