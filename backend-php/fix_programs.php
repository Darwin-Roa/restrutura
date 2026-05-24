<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Programa;

$sistemas = Programa::where('nombre', 'like', '%sistemas%')->first();
if (!$sistemas) {
    echo "Programa Sistemas not found!\n";
    exit;
}

$updated = User::where('role', 'profesor')->whereNull('programa_id')->update(['programa_id' => $sistemas->id]);
echo "Updated $updated teachers to programa_id = {$sistemas->id} ({$sistemas->nombre})\n";

$directorsUpdated = User::where('role', 'director')->whereNull('programa_id')->update(['programa_id' => $sistemas->id]);
echo "Updated $directorsUpdated directors to programa_id = {$sistemas->id}\n";
