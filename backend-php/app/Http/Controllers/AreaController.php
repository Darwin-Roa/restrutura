<?php

namespace App\Http\Controllers;

use App\Models\ManagementArea;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'areas' => ManagementArea::all()]);
    }

    public function store(Request $request)
    {
        $area = ManagementArea::create(['name' => $request->name, 'is_active' => true]);
        return response()->json(['success' => true, 'area' => $area]);
    }

    public function update(Request $request, $id)
    {
        $area = ManagementArea::findOrFail($id);
        $area->update($request->only(['name', 'is_active']));
        return response()->json(['success' => true, 'area' => $area]);
    }

    public function destroy($id)
    {
        ManagementArea::destroy($id);
        return response()->json(['success' => true, 'message' => 'Área eliminada']);
    }
}
