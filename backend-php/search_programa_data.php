<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

echo "=== 1. profesor_curso (2 registros) ===\n";
$pc = DB::table('profesor_curso')->get();
foreach ($pc as $r) {
    $user = DB::table('usuarios')->where('id', $r->teacher_id)->first();
    echo "  teacher_id: {$r->teacher_id} (" . ($user->nombre ?? '?') . ") -> course_id: {$r->course_id}\n";
}

echo "\n=== 2. evaluaciones_desempeno (teacher_id + created_by) ===\n";
$evals = DB::table('evaluaciones_desempeno')->select('teacher_id','created_by')->distinct()->get();
foreach ($evals as $e) {
    $teacher = DB::table('usuarios')->where('id', $e->teacher_id)->first();
    $creator = DB::table('usuarios')->where('id', $e->created_by)->first();
    echo "  teacher: {$e->teacher_id} (" . ($teacher->nombre ?? '?') . ") | created_by: {$e->created_by} (" . ($creator->nombre ?? '?') . ")\n";
}

echo "\n=== 3. planes_mejora_ia (teacher_id) ===\n";
$planes = DB::table('planes_mejora_ia')->select('teacher_id','reviewed_by')->distinct()->get();
foreach ($planes as $p) {
    $teacher = DB::table('usuarios')->where('id', $p->teacher_id)->first();
    echo "  teacher_id: {$p->teacher_id} (" . ($teacher->nombre ?? '?') . ")\n";
}

echo "\n=== 4. tareas_institucionales (created_by) ===\n";
$tareas = DB::table('tareas_institucionales')->select('created_by')->distinct()->get();
foreach ($tareas as $t) {
    $user = DB::table('usuarios')->where('id', $t->created_by)->first();
    echo "  created_by: {$t->created_by} (" . ($user->nombre ?? '?') . ")\n";
}

echo "\n=== 5. asignaciones_tareas (teacher_id) ===\n";
$asig = DB::table('asignaciones_tareas')->select('teacher_id')->distinct()->get();
foreach ($asig as $a) {
    $user = DB::table('usuarios')->where('id', $a->teacher_id)->first();
    echo "  teacher_id: {$a->teacher_id} (" . ($user->nombre ?? '?') . ")\n";
}

echo "\n=== 6. periodos_evaluacion (created_by) ===\n";
$per = DB::table('periodos_evaluacion')->select('created_by')->distinct()->get();
foreach ($per as $p) {
    $user = DB::table('usuarios')->where('id', $p->created_by)->first();
    echo "  created_by: " . ($p->created_by ?? 'NULL') . " (" . ($user->nombre ?? '?') . ")\n";
}

echo "\n=== 7. Buscando columnas 'programa' en TODAS las tablas ===\n";
$cols = DB::select("
    SELECT TABLE_NAME, COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND COLUMN_NAME LIKE '%programa%'
    ORDER BY TABLE_NAME
");
foreach ($cols as $c) {
    $count = DB::table($c->TABLE_NAME)->whereNotNull($c->COLUMN_NAME)->count();
    echo "  {$c->TABLE_NAME}.{$c->COLUMN_NAME} -> {$count} registros con dato\n";
}

echo "\n=== 8. Revisando la columna 'rol' vieja de usuarios con valores ===\n";
$viejos = DB::table('usuarios')
    ->select('id','nombre','email','rol','role')
    ->whereNotNull('role')
    ->whereNotIn('role', ['estudiante'])
    ->get();
foreach ($viejos as $u) {
    echo "  ID:{$u->id} | {$u->nombre} | rol_viejo: " . ($u->rol ?? 'NULL') . " | role_nuevo: {$u->role}\n";
}
