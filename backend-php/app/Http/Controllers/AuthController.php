<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController extends Controller
{
    private const BASE_PROFESOR_PERMS = [
        'ver_dashboard', 'ver_planes', 'plan_trabajo', 'bandeja_evidencias',
        'subir_evidencia', 'descargar_evidencia', 'ver_buenas_practicas'
    ];

    private function getCombinedPerms($roleName, $rolePerms)
    {
        // Solo inyectar BASE_PROFESOR_PERMS si es literalmente el rol 'profesor'
        // Para roles personalizados, devolver estrictamente lo que se configuró en la base de datos
        if ($roleName === 'profesor') {
            return array_values(array_unique(array_merge(self::BASE_PROFESOR_PERMS, $rolePerms)));
        }
        return $rolePerms;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            $user = User::where('email', $request->email)
                        ->where('is_active', true)
                        ->first();

            if (!$user) {
                return response()->json(['message' => 'Credenciales inválidas o usuario inactivo'], 401);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Credenciales inválidas'], 401);
            }

            // Get role permissions
            $role = Role::where('name', $user->role)->first();
            $perms = [];
            if ($role) {
                $rawPerms = $role->permissions ?? [];
                if (is_string($rawPerms)) {
                    $rawPerms = json_decode($rawPerms, true) ?? [];
                }
                $perms = $this->getCombinedPerms($user->role, $rawPerms);
            } else {
                $perms = $this->getCombinedPerms($user->role, []);
            }

            $payload = [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'programa_id' => $user->programa_id,
                'iat' => time(),
                'exp' => time() + (int) env('JWT_EXPIRES_IN', 480) * 60,
            ];

            $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'programa_id' => $user->programa_id,
                    'permissions' => $perms,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error en el servidor', 'error' => $e->getMessage()], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $role = Role::where('name', $jwtUser->role)->first();
            $perms = [];
            if ($role) {
                $rawPerms = $role->permissions ?? [];
                if (is_string($rawPerms)) {
                    $rawPerms = json_decode($rawPerms, true) ?? [];
                }
                $perms = $this->getCombinedPerms($jwtUser->role, $rawPerms);
            } else {
                $perms = $this->getCombinedPerms($jwtUser->role, []);
            }

            return response()->json([
                'user' => [
                    'id' => $jwtUser->id,
                    'name' => $jwtUser->name,
                    'role' => $jwtUser->role,
                    'programa_id' => $jwtUser->programa_id ?? null,
                    'permissions' => $perms,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error en el servidor', 'error' => $e->getMessage()], 500);
        }
    }

    public function uploadSignature(Request $request)
    {
        $request->validate([
            'signature' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $jwtUser = $request->user();
        $user = User::find($jwtUser->id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        if ($request->hasFile('signature')) {
            $file = $request->file('signature');
            $filename = uniqid('sig_') . '.' . $file->getClientOriginalExtension();
            $path = $file->move(public_path('uploads/signatures'), $filename);

            $user->signature_path = 'uploads/signatures/' . $filename;
            $user->save();

            return response()->json(['success' => true, 'path' => $user->signature_path]);
        }

        return response()->json(['success' => false, 'message' => 'No se recibió ningún archivo'], 400);
    }
}
