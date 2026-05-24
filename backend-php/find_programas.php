<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

echo "=== Datos en tabla 'docente' (usuario_id -> programa_id) ===\n";
$docentes = DB::table('docente')->select('usuario_id','programa_id','cedula')->get();
foreach ($docentes as $d) {
    $user = DB::table('usuarios')->where('id', $d->usuario_id)->first();
    $nombre = $user ? $user->nombre : '???';
    echo "usuario_id: {$d->usuario_id} ({$nombre}) -> programa_id: {$d->programa_id}\n";
}

echo "\n=== Datos en tabla 'director_programa_programa' ===\n";
$dirs = DB::table('director_programa_programa')->get();
foreach ($dirs as $d) {
    $user = DB::table('usuarios')->where('id', $d->director_usuario_id)->first();
    $nombre = $user ? $user->nombre : '???';
    echo "director_usuario_id: {$d->director_usuario_id} ({$nombre}) -> programa_id: {$d->programa_id}\n";
}

echo "\n=== Usuarios del sistema mejora SIN programa_id ===\n";
$sinProg = DB::table('usuarios')
    ->whereNotNull('role')
    ->whereNotIn('role', ['estudiante'])
    ->whereNull('programa_id')
    ->select('id','nombre','email','role')
    ->get();
echo "Total sin programa: " . count($sinProg) . "\n";
foreach ($sinProg as $u) {
    echo "  ID:{$u->id} | {$u->nombre} | {$u->role}\n";
}
