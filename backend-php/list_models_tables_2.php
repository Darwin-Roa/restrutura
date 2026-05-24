<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (glob(__DIR__ . '/app/Models/*.php') as $file) {
    $class = 'App\\Models\\' . basename($file, '.php');
    if (class_exists($class)) {
        try {
            $model = new $class;
            echo str_pad(basename($file, '.php'), 20) . " -> " . $model->getTable() . "\n";
        } catch (Exception $e) {}
    }
}
