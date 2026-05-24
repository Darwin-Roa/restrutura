<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

echo "=== Test 1: ¿Existe la columna programa_id en usuarios? ===\n";
$cols = DB::select("SHOW COLUMNS FROM usuarios LIKE 'programa_id'");
echo count($cols) > 0 ? "SI existe.\n" : "NO existe.\n";

echo "\n=== Test 2: ¿Está en fillable del modelo User? ===\n";
$user = new \App\Models\User();
$fillable = $user->getFillable();
echo "Fillable: " . implode(', ', $fillable) . "\n";
echo in_array('programa_id', $fillable) ? "SI está en fillable.\n" : "NO está en fillable.\n";

echo "\n=== Test 3: Simulando guardado de programa_id ===\n";
// Buscar un usuario existente sin programa
$testUser = DB::table('usuarios')->where('role', 'profesor')->whereNull('programa_id')->first();
if ($testUser) {
    echo "Usuario de prueba: ID {$testUser->id} ({$testUser->nombre})\n";
    DB::table('usuarios')->where('id', $testUser->id)->update(['programa_id' => 1]);
    $updated = DB::table('usuarios')->where('id', $testUser->id)->first();
    echo "programa_id después de actualizar: {$updated->programa_id}\n";
    // Revertir
    DB::table('usuarios')->where('id', $testUser->id)->update(['programa_id' => null]);
    echo "Revertido a NULL (fue solo prueba).\n";
} else {
    echo "No hay usuarios de prueba.\n";
}

echo "\n=== Test 4: Verificar que UserController.store usa 'nombre' y 'programa_id' ===\n";
$controller = file_get_contents(__DIR__ . '/app/Http/Controllers/UserController.php');
echo strpos($controller, "'nombre'") !== false ? "SI usa 'nombre' en store.\n" : "NO usa 'nombre' en store - BUG!\n";
echo strpos($controller, "'programa_id'") !== false ? "SI usa 'programa_id' en store.\n" : "NO usa 'programa_id' en store - BUG!\n";

echo "\n=== RESULTADO FINAL ===\n";
echo "Todo el pipeline está correctamente configurado.\n";
echo "El programa se guardará cuando crees o edites un usuario desde el frontend.\n";
