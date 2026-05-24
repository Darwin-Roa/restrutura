<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    /**
     * Get user permissions
     */
    public function getUserPermissions($userId)
    {
        $user = User::findOrFail($userId);
        return response()->json([
            'direct_permissions' => $user->permissions,
            'role' => $user->role,
            // Aquí podríamos cargar permisos del rol si los mapeamos, pero para este endpoint basta con directos
        ]);
    }

    /**
     * Assign permission to user
     */
    public function assignPermission(Request $request, $userId)
    {
        $request->validate([
            'permission_name' => 'required|string'
        ]);

        $user = User::findOrFail($userId);
        
        $permission = Permission::firstOrCreate(['name' => $request->permission_name]);

        // Evitar duplicados
        if (!$user->permissions->contains($permission->id)) {
            $user->permissions()->attach($permission->id);
        }

        return response()->json([
            'message' => 'Permission assigned successfully',
            'user' => $user->load('permissions')
        ]);
    }

    /**
     * Remove permission from user
     */
    public function removePermission(Request $request, $userId)
    {
        $request->validate([
            'permission_name' => 'required|string'
        ]);

        $user = User::findOrFail($userId);
        $permission = Permission::where('name', $request->permission_name)->first();

        if ($permission) {
            $user->permissions()->detach($permission->id);
        }

        return response()->json([
            'message' => 'Permission removed successfully'
        ]);
    }
}
