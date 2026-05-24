<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index()
    {
        // El usuario pidió "eliminalo Profesor" de la gestión de roles.
        // Ocultamos el rol 'profesor' para que no sea editable en la interfaz.
        $roles = Role::where('name', '!=', 'profesor')->get();
        return response()->json(['success' => true, 'roles' => $roles]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        // Obtener permisos del usuario actual (el que está creando el rol)
        $permisosUser = DB::table('role_has_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
            ->where('role_has_permissions.role_name', $user->role)
            ->pluck('permissions.name')
            ->toArray();

        $permisosNuevos = $request->permissions ?? []; // array de strings (nombres de permisos)

        // Si no es admin, validar escalada de privilegios
        if ($user->role !== 'admin') {
            $invalidos = array_diff($permisosNuevos, $permisosUser);
            if (!empty($invalidos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes asignar permisos que no posees: ' . implode(', ', $invalidos)
                ], 403);
            }
        }

        $role = Role::create([
            'name' => $request->name,
            'label' => $request->label,
            'permissions' => $permisosNuevos, // Mantenemos el JSON para legacy support temporal
            'is_system' => false,
            'created_by' => $user->id,
        ]);

        // Poblar la tabla relacional role_has_permissions
        if (!empty($permisosNuevos)) {
            $permissionIds = DB::table('permissions')->whereIn('name', $permisosNuevos)->pluck('id');
            foreach ($permissionIds as $pId) {
                DB::table('role_has_permissions')->insert([
                    'role_name' => $role->name,
                    'permission_id' => $pId,
                    'created_at' => now(),
                ]);
            }
        }

        return response()->json(['success' => true, 'role' => $role], 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        if ($role->is_system && $request->has('name') && $request->name !== $role->name) {
            return response()->json(['success' => false, 'message' => 'No se puede cambiar el nombre de un rol del sistema'], 400);
        }

        $user = $request->user();
        
        $permisosUser = DB::table('role_has_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
            ->where('role_has_permissions.role_name', $user->role)
            ->pluck('permissions.name')
            ->toArray();

        $permisosNuevos = $request->permissions ?? [];

        if ($user->role !== 'admin') {
            $invalidos = array_diff($permisosNuevos, $permisosUser);
            if (!empty($invalidos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes asignar permisos que no posees: ' . implode(', ', $invalidos)
                ], 403);
            }
        }

        $oldName = $role->name;
        $role->update($request->only(['name', 'label', 'permissions']));

        if ($request->has('permissions')) {
            // Actualizar tabla relacional
            DB::table('role_has_permissions')->where('role_name', $oldName)->delete();
            $permissionIds = DB::table('permissions')->whereIn('name', $permisosNuevos)->pluck('id');
            foreach ($permissionIds as $pId) {
                DB::table('role_has_permissions')->insert([
                    'role_name' => $role->name,
                    'permission_id' => $pId,
                    'created_at' => now(),
                ]);
            }
        }

        return response()->json(['success' => true, 'role' => $role]);
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        if ($role->is_system) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar un rol del sistema'], 400);
        }

        // Eliminar registros relacionales de permisos primero
        DB::table('role_has_permissions')->where('role_name', $role->name)->delete();
        $role->delete();
        
        return response()->json(['success' => true, 'message' => 'Rol eliminado']);
    }
}
