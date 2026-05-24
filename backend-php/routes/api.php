<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\RecognitionController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes — Migrado de Node.js Express backend
|--------------------------------------------------------------------------
*/

// ═══════════════════════════════════════════════════════
// PÚBLICAS (sin autenticación)
// ═══════════════════════════════════════════════════════
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', fn() => response()->json(['message' => 'Sesión cerrada']));

// Rutas públicas de referencia (catálogos)
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/roles', [RoleController::class, 'index']);
Route::get('/periods', [PeriodController::class, 'index']);
Route::get('/areas', [AreaController::class, 'index']);

Route::get('/debug/db', function () {
    return response()->json([
        'users_profesor' => \App\Models\User::where('role', 'profesor')->count(),
        'users_profesor_active' => \App\Models\User::where('role', 'profesor')->where('is_active', true)->count(),
        'tasks' => \App\Models\FixedTask::count(),
        'tasks_active_period' => \App\Models\FixedTask::where('period_id', \App\Models\Period::where('is_active', true)->value('id'))->count(),
        'task_assignments' => \App\Models\TaskAssignment::count(),
        'task_assignments_active_period' => \App\Models\TaskAssignment::where('period_id', \App\Models\Period::where('is_active', true)->value('id'))->count(),
        'active_period' => \App\Models\Period::where('is_active', true)->first(),
        'teacher_courses' => \App\Models\TeacherCourse::count(),
        'sample_assignment' => \App\Models\TaskAssignment::first()
    ]);
});

Route::get('/debug/my-tasks/{id}', function ($id) {
    $activePeriod = \App\Models\Period::where('is_active', true)->first();
    $query = \App\Models\TaskAssignment::with(['fixedTask', 'course', 'evidences'])
        ->where('teacher_id', $id);
    if ($activePeriod) {
        $query->where('period_id', $activePeriod->id);
    }
    return response()->json([
        'assignments' => $query->get()
    ]);
});


// ═══════════════════════════════════════════════════════
// PROTEGIDAS (JWT Auth)
// ═══════════════════════════════════════════════════════
Route::middleware('jwt.auth')->group(function () {
    // --- Auth ---
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // --- Debug User ---
    Route::get('/debug/whoami', function(\Illuminate\Http\Request $request) {
        return response()->json([
            'id' => $request->user()->id ?? null,
            'role' => $request->user()->role ?? 'NO_ROLE',
            'role_length' => strlen($request->user()->role ?? ''),
            'is_active' => $request->user()->is_active,
        ]);
    });

    // --- Users (admin-only para CUD) ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/signature', [AuthController::class, 'uploadSignature']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store'])->middleware('role:admin');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('role:admin');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('role:admin');

    // --- Courses ---
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/assignments', [CourseController::class, 'getAssignments'])->middleware('role:admin,director');
    Route::post('/courses', [CourseController::class, 'store'])->middleware('role:admin,director');
    Route::post('/courses/assign', [CourseController::class, 'assignTeacher'])->middleware('role:admin,director');
    Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->middleware('role:admin,director');
    Route::delete('/courses/assign/{id}', [CourseController::class, 'deleteAssignment'])->middleware('role:admin,director');

    // --- Periods (ya es pública arriba, aquí solo CUD) ---
    Route::post('/periods', [PeriodController::class, 'store'])->middleware('role:admin');
    Route::put('/periods/{id}', [PeriodController::class, 'update'])->middleware('role:admin');
    Route::post('/periods/{id}/open', [PeriodController::class, 'openPeriod'])->middleware('role:admin,director');

    // --- Plans (Mejora Profesoral) ---
    Route::post('/plans/generate', [PlanController::class, 'generateWithAI'])->middleware('role:admin,director');
    Route::post('/plans/mass-generate', [PlanController::class, 'massGenerate'])->middleware('role:admin,director');
    Route::get('/plans/mass-status/{jobId}', [PlanController::class, 'getMassStatus'])->middleware('role:admin,director');
    Route::post('/plans/save', [PlanController::class, 'save'])->middleware('role:admin,director');
    Route::get('/plans', [PlanController::class, 'index']);
    Route::get('/plans/my-plan', [PlanController::class, 'getMyPlan'])->middleware('role:profesor,admin,director');
    Route::patch('/plans/{id}/status', [PlanController::class, 'updateStatus'])->middleware('role:admin,director');
    Route::patch('/plans/actions/{id}/deadline', [PlanController::class, 'updateActionDeadline'])->middleware('role:admin,director');
    Route::delete('/plans/{id}', [PlanController::class, 'destroy'])->middleware('role:admin,director');

    // --- Evaluations ---
    Route::post('/evaluations', [EvaluationController::class, 'store'])->middleware('role:director,admin');
    Route::post('/evaluations/mass-upload', [EvaluationController::class, 'massUpload'])->middleware('role:director,admin');
    Route::get('/evaluations/teacher/{teacherId}', [EvaluationController::class, 'getByTeacher'])->middleware('role:director,admin');
    Route::put('/evaluations/{id}', [EvaluationController::class, 'update'])->middleware('role:director,admin');
    Route::delete('/evaluations/{id}', [EvaluationController::class, 'destroy'])->middleware('role:director,admin');

    // --- Tasks (Institucionales) ---
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store'])->middleware('role:admin,director');
    Route::put('/tasks/{id}', [TaskController::class, 'update'])->middleware('role:admin,director');
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->middleware('role:admin,director');
    Route::post('/tasks/clone-to-period', [TaskController::class, 'cloneToPeriod'])->middleware('role:admin,director');
    Route::post('/tasks/reminders', [TaskController::class, 'sendReminders'])->middleware('role:admin,director');
    Route::post('/tasks/assignments/reset', [TaskController::class, 'resetAssignments'])->middleware('role:admin,director');
    Route::post('/tasks/seed-institutional', [TaskController::class, 'seedInstitutionalTasks'])->middleware('role:admin,director');
    Route::get('/tasks/assignments/my-tasks', [TaskController::class, 'getMyAssignments'])->middleware('role:profesor,admin,director');
    Route::patch('/tasks/assignments/{id}/status', [TaskController::class, 'updateAssignmentStatus']);
    Route::patch('/tasks/assignments/{id}/deadline', [TaskController::class, 'updateAssignmentDeadline'])->middleware('role:admin,director');
    Route::get('/tasks/cleanup', [TaskController::class, 'cleanupBadAssignments']);

    // --- Evidence ---
    Route::post('/evidence', [EvidenceController::class, 'upload']);
    Route::patch('/evidence/{id}/verify', [EvidenceController::class, 'verify'])->middleware('role:admin,director');
    Route::get('/evidence/pending', [EvidenceController::class, 'getPending'])->middleware('role:admin,director');
    Route::get('/evidence/view/{id}', [EvidenceController::class, 'view'])->middleware('role:admin,director,profesor');

    // --- Export ---
    Route::get('/export/plan/{planId}/preview', [ExportController::class, 'previewPlanHtml']);
    Route::get('/export/plan/{planId}/pdf', [ExportController::class, 'exportPlanPdf']);
    Route::get('/export/global/csv', [ExportController::class, 'exportGlobalCsv']);
    Route::get('/export/global/excel-matriz', [ExportController::class, 'exportMatrizGlobalExcel']);
    Route::get('/export/global/matrix-json', [ExportController::class, 'getMatrizGlobalJson']);

    // --- History ---
    Route::get('/history/global', [HistoryController::class, 'getGlobalHistory'])->middleware('role:director,admin');
    Route::post('/history/ai-analysis', [HistoryController::class, 'getGlobalAIAnalysis'])->middleware('role:director,admin');
    Route::get('/history/tracking', [HistoryController::class, 'getGlobalTracking'])->middleware('role:director');
    Route::get('/history/teacher/{teacherId}/tasks', [HistoryController::class, 'getTeacherTasks'])->middleware('role:director,admin');

    // --- Recognitions ---
    Route::get('/recognitions', [RecognitionController::class, 'index']);
    Route::post('/recognitions/draft', [RecognitionController::class, 'draft'])->middleware('role:admin,director');
    Route::post('/recognitions/publish', [RecognitionController::class, 'publish'])->middleware('role:admin,director');

    // --- Areas de Gestión (ya es pública arriba, aquí solo CUD) ---
    Route::post('/areas', [AreaController::class, 'store'])->middleware('role:admin');
    Route::put('/areas/{id}', [AreaController::class, 'update'])->middleware('role:admin');
    Route::delete('/areas/{id}', [AreaController::class, 'destroy'])->middleware('role:admin');

    // --- Departments (ya es pública arriba, aquí solo CUD) ---
    Route::post('/departments', [DepartmentController::class, 'store'])->middleware('role:admin');
    Route::put('/departments/{id}', [DepartmentController::class, 'update'])->middleware('role:admin');
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy'])->middleware('role:admin');

    // --- Roles (ya es pública arriba, aquí solo CUD) ---
    Route::post('/roles', [RoleController::class, 'store'])->middleware('role:director,admin');
    Route::put('/roles/{id}', [RoleController::class, 'update'])->middleware('role:director,admin');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('role:director,admin');

    // --- Notifications ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
});
