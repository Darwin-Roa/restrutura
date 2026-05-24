<?php

namespace App\Http\Controllers;

use App\Models\Evidence;
use App\Models\TaskAssignment;
use App\Models\PlanAction;
use App\Models\Period;
use App\Models\User;
use Illuminate\Http\Request;

class EvidenceController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $request->validate(['file' => 'nullable|file|max:20480']);
            $jwtUser = $request->user();
            $file = $request->file('file');
            $activePeriod = Period::where('is_active', true)->first();

            $taskId = $request->task_id ?? $request->task_assignment_id;
            $planActionId = $request->action_id ?? $request->plan_action_id;

            $evidence = null;
            if ($request->hasFile('file')) {
                $filename = uniqid() . '_' . $file->getClientOriginalName();
                $uploadPath = public_path('uploads');
                
                $fileSize = $file->getSize();
                $fileMime = $file->getClientMimeType();
                $originalName = $file->getClientOriginalName();
                
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                $file->move($uploadPath, $filename);

                $evidence = Evidence::create([
                    'file_name' => $originalName,
                    'file_path' => 'uploads/' . $filename,
                    'file_type' => substr($fileMime, 0, 50),
                    'file_size' => $fileSize,
                    'teacher_id' => $jwtUser->id,
                    'period_id' => $activePeriod?->id,
                    'task_assignment_id' => $taskId,
                    'plan_action_id' => $planActionId,
                    'verified' => null,
                ]);
            }

            // Auto-update linked item status to completed
            $taskName = 'Soporte';
            if ($taskId) {
                $assignment = TaskAssignment::with('fixedTask')->find($taskId);
                if ($assignment) {
                    $taskName = $assignment->fixedTask ? $assignment->fixedTask->activity : 'Tarea Institucional';
                    $assignment->update([
                        'status' => 'completed', 
                        'completed_at' => now(),
                        'teacher_response' => $request->teacher_response
                    ]);
                }
            }
            if ($planActionId) {
                $action = PlanAction::find($planActionId);
                if ($action) {
                    $taskName = $action->concrete_action ?? 'Acción Plan de Mejora';
                    $action->update(['status' => 'completed']);
                }
            }

            // Notify Directors of the same program
            if ($jwtUser->programa_id) {
                try {
                    $directors = User::whereNotIn('role', ['profesor', 'admin', 'estudiante'])
                                     ->where('programa_id', $jwtUser->programa_id)
                                     ->get();
                    $notificationItem = $evidence ?? (object)['id' => $taskId ?? $planActionId];
                    \Illuminate\Support\Facades\Notification::send($directors, new \App\Notifications\EvidenceUploaded($notificationItem, $jwtUser, $taskName));
                } catch (\Exception $notifEx) {
                    \Illuminate\Support\Facades\Log::warning("Notification failed to send: " . $notifEx->getMessage());
                }
            }

            return response()->json(['success' => true, 'evidence' => $evidence], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Evidence upload error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['success' => false, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
        }
    }

    public function verify(Request $request, $id)
    {
        try {
            $evidence = Evidence::findOrFail($id);
            $isApproved = $request->is_approved;
            $newTeacherResponse = $request->teacher_response;
            $jwtUser = $request->user();

            $evidence->update([
                'verified' => $isApproved,
                'verified_at' => now(),
                'verified_by' => $jwtUser->id,
            ]);

            // Update linked item status
            $newStatus = $isApproved ? 'verified' : 'rejected';
            if ($evidence->task_assignment_id) {
                $assignmentQuery = TaskAssignment::where('id', $evidence->task_assignment_id);
                $updateData = ['status' => $newStatus];
                
                // If the director provided a modified response, save it
                if ($newTeacherResponse !== null) {
                    $updateData['teacher_response'] = $newTeacherResponse;
                }
                
                $assignmentQuery->update($updateData);
            }
            if ($evidence->plan_action_id) {
                PlanAction::where('id', $evidence->plan_action_id)->update(['status' => $newStatus]);
            }

            return response()->json(['success' => true, 'evidence' => $evidence]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getPending(Request $request)
    {
        try {
            $jwtUser = $request->user();
            $query = Evidence::with(['teacher', 'taskAssignment.fixedTask', 'planAction']);

            if ($request->query('all') !== 'true') {
                $query->whereNull('verified');
            }

            if ($jwtUser->role !== 'admin' && $jwtUser->programa_id) {
                $teacherIds = User::where('programa_id', $jwtUser->programa_id)->pluck('id');
                $query->whereIn('teacher_id', $teacherIds);
            }

            $evidences = $query->orderBy('id', 'desc')->get();
            return response()->json(['success' => true, 'evidences' => $evidences]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function view($id)
    {
        try {
            $evidence = Evidence::findOrFail($id);
            $path = public_path($evidence->file_path);

            if (!file_exists($path)) {
                return response()->json(['message' => 'Archivo no encontrado'], 404);
            }

            return response()->file($path, [
                'Content-Type' => $evidence->file_type ?? 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="' . $evidence->file_name . '"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
