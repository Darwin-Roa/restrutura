<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

echo "=== USUARIOS DEL SISTEMA DE MEJORA (los 8 migrados) ===\n";
$users = DB::table('usuarios')
    ->whereIn('role', ['admin','director','coordinador','profesor','asistente_'])
    ->select('id','nombre','email','role','programa_id')
    ->get();

foreach ($users as $u) {
    printf(
        "ID:%-3d | %-35s | %-12s | programa_id: %s\n",
        $u->id,
        $u->nombre,
        $u->role,
        $u->programa_id ?? 'NULL'
    );
}

echo "\n=== PROGRAMAS DISPONIBLES ===\n";
$programas = DB::table('programa')->select('id','nombre')->get();
foreach ($programas as $p) {
    printf("ID:%-3d | %s\n", $p->id, $p->nombre);
}
