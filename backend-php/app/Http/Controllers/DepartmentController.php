<?php

namespace App\Http\Controllers;

use App\Models\Programa;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    private function formatDept($dept)
    {
        return [
            'id' => $dept->id,
            'name' => $dept->nombre,
            'is_active' => (bool)$dept->activo
        ];
    }

    public function index()
    {
        $departments = Programa::all()->map(fn($d) => $this->formatDept($d));
        return response()->json(['success' => true, 'departments' => $departments]);
    }

    public function store(Request $request)
    {
        $dept = Programa::create(['nombre' => $request->name, 'activo' => 1]);
        return response()->json(['success' => true, 'department' => $this->formatDept($dept)]);
    }

    public function update(Request $request, $id)
    {
        $dept = Programa::findOrFail($id);
        if ($request->has('name')) $dept->nombre = $request->name;
        if ($request->has('is_active')) $dept->activo = $request->is_active ? 1 : 0;
        $dept->save();
        return response()->json(['success' => true, 'department' => $this->formatDept($dept)]);
    }

    public function destroy($id)
    {
        Programa::destroy($id);
        return response()->json(['success' => true, 'message' => 'Departamento eliminado']);
    }
}
