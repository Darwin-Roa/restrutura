<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(11);
$request = Illuminate\Http\Request::create('/api/history/tracking', 'GET');
$request->setUserResolver(function() use ($user) { return $user; });
$controller = new App\Http\Controllers\HistoryController();
$response = $controller->getGlobalTracking($request);
echo "\n--- TRACKING ---\n";
echo $response->getContent();

$request2 = Illuminate\Http\Request::create('/api/history/teacher/12/tasks', 'GET');
$request2->setUserResolver(function() use ($user) { return $user; });
$response2 = $controller->getTeacherTasks($request2, 12);
echo "\n--- TEACHER 12 TASKS ---\n";
echo $response2->getContent();
echo "\n";
