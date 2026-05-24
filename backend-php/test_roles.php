<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;
$roles = DB::table('roles_sistema')->get();
$out = [];
foreach($roles as $role) {
    $out[] = ['name' => $role->name, 'permissions' => $role->permissions];
}
file_put_contents('roles_dump.json', json_encode($out, JSON_PRETTY_PRINT));
echo "Dumped to roles_dump.json\n";
