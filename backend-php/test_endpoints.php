<?php
use App\Models\User;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$director7 = User::find(7);
$request7 = Request::create('/api/history/tracking', 'GET');
$request7->setUserResolver(function() use ($director7) {
    return $director7;
});

echo "=== CONTROLADOR DIRECTO getGlobalTracking PARA DIRECTOR 7 (director@usb.edu.co) ===\n";
$historyController = new \App\Http\Controllers\HistoryController();
$response7 = $historyController->getGlobalTracking($request7);
echo "Response: " . $response7->getContent() . "\n\n";

$director11 = User::find(11);
$request11 = Request::create('/api/history/tracking', 'GET');
$request11->setUserResolver(function() use ($director11) {
    return $director11;
});

echo "=== CONTROLADOR DIRECTO getGlobalTracking PARA DIRECTOR 11 (director1@usb.edu.co) ===\n";
$response11 = $historyController->getGlobalTracking($request11);
echo "Response: " . $response11->getContent() . "\n\n";

echo "=== CONTROLADOR DIRECTO TaskController index PARA DIRECTOR 7 ===\n";
$taskController = new \App\Http\Controllers\TaskController();
$responseTasks7 = $taskController->index($request7);
echo "Response: " . $responseTasks7->getContent() . "\n\n";

echo "=== CONTROLADOR DIRECTO TaskController index PARA DIRECTOR 11 ===\n";
$responseTasks11 = $taskController->index($request11);
echo "Response: " . $responseTasks11->getContent() . "\n\n";
