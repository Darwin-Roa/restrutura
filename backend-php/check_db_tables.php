<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = Illuminate\Support\Facades\DB::table('usuarios')->find(20);
$user_sistema = Illuminate\Support\Facades\DB::table('usuarios_sistema')->find(20);

echo "usuarios: " . ($user ? 'yes' : 'no') . "\n";
echo "usuarios_sistema: " . ($user_sistema ? 'yes' : 'no') . "\n";
