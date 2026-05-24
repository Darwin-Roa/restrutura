<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $userRole = $user->role; // ej: 'director', 'asistente_ventas'

        // Verificar si el rol del usuario está en los roles permitidos directamente
        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        // Si la ruta permite 'director' y el usuario tiene un rol personalizado (no es profesor ni admin)
        // le permitimos pasar, asumiendo que los permisos granulares se manejan en el frontend
        // o que los roles personalizados actúan como un subconjunto del rol director.
        if (in_array('director', $roles) && !in_array($userRole, ['profesor', 'admin', 'estudiante'])) {
            return $next($request);
        }

        return response()->json(['error' => 'Sin permisos'], 403);
    }
}
