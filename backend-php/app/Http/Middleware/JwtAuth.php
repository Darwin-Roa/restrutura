<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = null;

        // Extract from Authorization header
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        }

        // Fallback: extract from query param (for browser window.open)
        if (!$token && $request->query('token')) {
            $token = $request->query('token');
        }

        if (!$token) {
            return response()->json(['message' => 'No token provided'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $request->merge(['jwt_user' => (array) $decoded]);
            $request->setUserResolver(function () use ($decoded) {
                return (object) [
                    'id' => $decoded->id,
                    'name' => $decoded->name,
                    'role' => $decoded->role,
                    'programa_id' => $decoded->programa_id ?? null,
                ];
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        return $next($request);
    }
}
