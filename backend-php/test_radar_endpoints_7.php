<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(11);
$request = Illuminate\Http\Request::create('/api/history/global', 'GET');
$request->setUserResolver(function() use ($user) { return $user; });
$controller = new App\Http\Controllers\HistoryController();
$response = $controller->getGlobalHistory($request);
echo "\n--- GLOBAL HISTORY ---\n";
echo $response->getContent();
echo "\n";
