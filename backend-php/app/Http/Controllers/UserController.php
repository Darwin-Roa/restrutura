<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            // FILTRO: Solo traer usuarios que tengan un rol válido en Mejora Profesoral
            $query = User::whereNotNull('role')->whereNotIn('role', ['estudiante'])->with('programa');
            $jwtUser = $request->user();

            if ($request->query('role')) {
                $query->where('role', $request->query('role'));
            }

            if ($jwtUser && $jwtUser->role !== 'admin') {
                if ($jwtUser->programa_id) {
                    $query->where('programa_id', $jwtUser->programa_id);
                } else {
                    $query->whereRaw('1 = 0'); // See no one if no program is assigned
                }
            }

            $users = $query->get()->makeHidden('password');
            return response()->json(['success' => true, 'users' => $users]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $existing = User::where('email', $request->email)->first();
            if ($existing) {
                return response()->json(['success' => false, 'message' => 'El usuario ya existe con este correo.'], 400);
            }

            $user = User::create([
                'nombre' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'profesor',
                'programa_id' => $request->programa_id,
                'cedula' => $request->cedula,
                'is_active' => $request->has('is_active') ? $request->is_active : true,
            ]);
            $userData = $user->makeHidden('password')->toArray();

            // Asignar tareas globales automáticamente si es un profesor activo
            if ($user->role === 'profesor' && $user->is_active) {
                $activePeriod = \App\Models\Period::where('is_active', true)->first();
                if ($activePeriod) {
                    $globalTasks = \App\Models\FixedTask::where('period_id', $activePeriod->id)
                        ->where('is_active', true)
                        ->whereIn('scope', ['global', 'individual'])
                        ->get();
                    
                    foreach ($globalTasks as $task) {
                        if ($task->scope === 'individual' && $task->specific_teacher_id !== $user->id) continue;
                        
                        \App\Models\TaskAssignment::create([
                            'fixed_task_id' => $task->id,
                            'teacher_id' => $user->id,
                            'period_id' => $activePeriod->id,
                            'status' => 'pending',
                        ]);
                    }
                }
            }

            return response()->json(['success' => true, 'user' => $userData]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 404);
            }

            if ($request->has('name')) $user->name = $request->name;
            if ($request->has('role')) $user->role = $request->role;
            if ($request->has('programa_id')) $user->programa_id = $request->programa_id;
            if ($request->has('cedula')) $user->cedula = $request->cedula;
            if ($request->has('is_active')) $user->is_active = $request->is_active;
            $user->save();

            $userData = $user->makeHidden('password')->toArray();
            return response()->json(['success' => true, 'user' => $userData]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 404);
            }
            $user->is_active = false;
            $user->save();
            return response()->json(['success' => true, 'message' => 'Usuario desactivado correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
