<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

// Test 1: ¿Existen registros en la tabla programa?
echo "=== Tabla 'programa' ===\n";
$progs = DB::table('programa')->get();
foreach($progs as $p) {
    echo "ID: {$p->id} | nombre: {$p->nombre} | activo: {$p->activo}\n";
}
echo "Total: " . count($progs) . "\n\n";

// Test 2: ¿Qué devuelve el modelo Programa?
echo "=== Modelo Programa::all() ===\n";
$items = \App\Models\Programa::all();
foreach($items as $p) {
    echo "ID: {$p->id} | nombre: {$p->nombre}\n";
}
echo "Total modelo: " . count($items) . "\n\n";

// Test 3: Simular la respuesta del DepartmentController
echo "=== Respuesta formateada (como la vería el frontend) ===\n";
$formatted = $items->map(fn($d) => [
    'id' => $d->id,
    'name' => $d->nombre,
    'is_active' => (bool)$d->activo
]);
echo json_encode(['success' => true, 'departments' => $formatted], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
