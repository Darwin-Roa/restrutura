<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    $total = DB::table('usuarios')->count();
    $migrados = DB::table('usuarios')->where('creado_en', '!=', null)->where('rol', 'Admin')->count(); 
    // En el script original migramos usuarios_sistema poniendo 'Admin' en el enum viejo.
    
    echo "TOTAL USUARIOS EN LA TABLA: $total\n";
    echo "----------------------------------------\n";
    
    $legacy_roles = DB::table('usuarios')
        ->select('rol', DB::raw('count(*) as cantidad'))
        ->groupBy('rol')
        ->get();
        
    echo "Agrupación por columna vieja 'rol' (La de Node/bdUnisimon):\n";
    foreach($legacy_roles as $r) {
        echo " - " . ($r->rol ?: 'NULL') . ": " . $r->cantidad . "\n";
    }
    
    echo "----------------------------------------\n";
    $new_roles = DB::table('usuarios')
        ->select('role', DB::raw('count(*) as cantidad'))
        ->groupBy('role')
        ->get();
        
    echo "Agrupación por columna nueva 'role' (La de Laravel):\n";
    foreach($new_roles as $r) {
        echo " - " . ($r->role ?: 'NULL') . ": " . $r->cantidad . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
