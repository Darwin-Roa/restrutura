<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $jwtUser = $request->user();
        $user = \App\Models\User::find($jwtUser->id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }
        $notifications = $user->unreadNotifications()->take(20)->get();
        return response()->json(['success' => true, 'notifications' => $notifications]);
    }

    public function markAsRead(Request $request, $id)
    {
        $jwtUser = $request->user();
        $user = \App\Models\User::find($jwtUser->id);
        if ($user) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        }
        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $jwtUser = $request->user();
        $user = \App\Models\User::find($jwtUser->id);
        if ($user) {
            $user->unreadNotifications->markAsRead();
        }
        return response()->json(['success' => true]);
    }
}
