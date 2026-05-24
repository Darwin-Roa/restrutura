<?php
$start = microtime(true);
require __DIR__.'/vendor/autoload.php';
echo "Autoload in " . (microtime(true) - $start) . "s\n";
$app = require_once __DIR__.'/bootstrap/app.php';
echo "App created in " . (microtime(true) - $start) . "s\n";
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
echo "Kernel resolved in " . (microtime(true) - $start) . "s\n";
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);
echo "Handled in " . (microtime(true) - $start) . "s\n";
