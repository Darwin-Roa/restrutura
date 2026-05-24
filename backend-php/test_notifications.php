<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::find(53);
$notifications = $user->unreadNotifications()->take(20)->get();
echo "Total notifications for User 53: " . count($notifications) . "\n";
echo "JSON output:\n";
echo json_encode(['success' => true, 'notifications' => $notifications], JSON_PRETTY_PRINT);
