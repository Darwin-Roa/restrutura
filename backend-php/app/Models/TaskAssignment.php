<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskAssignment extends Model
{
    use HasFactory;

    protected $table = 'asignaciones_tareas';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'status', 'completed_at', 'custom_deadline', 'course_id',
        'fixed_task_id', 'teacher_id', 'period_id', 'teacher_response'
    ];

    public function fixedTask()
    {
        return $this->belongsTo(FixedTask::class, 'fixed_task_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function period()
    {
        return $this->belongsTo(Period::class, 'period_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function evidences()
    {
        return $this->hasMany(Evidence::class, 'task_assignment_id');
    }
}
