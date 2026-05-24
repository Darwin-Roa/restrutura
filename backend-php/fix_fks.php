<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Check constraints in asignaciones_tareas
    try { DB::statement('ALTER TABLE asignaciones_tareas DROP FOREIGN KEY asignaciones_tareas_ibfk_3'); } catch(\Exception $e) {}
    DB::statement('DELETE FROM asignaciones_tareas WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE asignaciones_tareas ADD CONSTRAINT asignaciones_tareas_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');
    echo "Fixed asignaciones_tareas FK.\n";

    // planes_mejora
    try { DB::statement('ALTER TABLE planes_mejora DROP FOREIGN KEY planes_mejora_ibfk_1'); } catch(\Exception $e) {}
    DB::statement('DELETE FROM planes_mejora WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE planes_mejora ADD CONSTRAINT planes_mejora_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');
    echo "Fixed planes_mejora FK.\n";

    // evaluaciones
    try { DB::statement('ALTER TABLE evaluaciones DROP FOREIGN KEY evaluaciones_ibfk_1'); } catch(\Exception $e) {}
    DB::statement('DELETE FROM evaluaciones WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE evaluaciones ADD CONSTRAINT evaluaciones_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');
    echo "Fixed evaluaciones FK.\n";

    // profesor_curso
    try { DB::statement('ALTER TABLE profesor_curso DROP FOREIGN KEY profesor_curso_ibfk_1'); } catch(\Exception $e) {}
    DB::statement('DELETE FROM profesor_curso WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE profesor_curso ADD CONSTRAINT profesor_curso_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');
    echo "Fixed profesor_curso FK.\n";

    echo "All FKs pointing to usuarios_sistema should be fixed now to point to usuarios.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
