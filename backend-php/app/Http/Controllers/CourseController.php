<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\TeacherCourse;
use App\Models\User;
use App\Models\Period;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function getAssignments(Request $request)
    {
        try {
            $assignments = TeacherCourse::with(['teacher', 'course.period'])->get();
            return response()->json(['success' => true, 'assignments' => $assignments]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $teacherId = $request->query('teacher_id');
            $periodId = $request->query('period_id');

            if ($teacherId || $periodId) {
                $query = TeacherCourse::with(['course.period']);
                if ($teacherId) $query->where('teacher_id', $teacherId);
                if ($periodId) $query->where('period_id', $periodId);
                $assignments = $query->get();
                $courses = $assignments->map(fn($a) => $a->course)->filter()->unique('id')->values();
            } else {
                $courses = Course::with('period')->orderBy('period_id', 'desc')->orderBy('name')->get();
            }
            return response()->json(['success' => true, 'courses' => $courses]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $course = Course::create($request->only(['code', 'name', 'group', 'period_id']));
            return response()->json(['success' => true, 'course' => $course]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function assignTeacher(Request $request)
    {
        try {
            $teacher = User::where('id', $request->teacher_id)->where('role', 'profesor')->first();
            if (!$teacher) return response()->json(['success' => false, 'message' => 'Profesor no encontrado'], 404);
            $assignment = TeacherCourse::create($request->only(['teacher_id', 'course_id', 'period_id']));
            return response()->json(['success' => true, 'assignment' => $assignment]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Course::destroy($id);
            return response()->json(['success' => true, 'message' => 'Curso eliminado']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar.', 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteAssignment($id)
    {
        try {
            TeacherCourse::destroy($id);
            return response()->json(['success' => true, 'message' => 'Asignación eliminada']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
