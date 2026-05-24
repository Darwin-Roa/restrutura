<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FixedTask extends Model
{
    use HasFactory;

    protected $table = 'tareas_institucionales';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'management_area', 'activity', 'expected_product', 'deadline_month',
        'scope', 'specific_teacher_id', 'created_by', 'is_active', 'period_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function specificTeacher()
    {
        return $this->belongsTo(User::class, 'specific_teacher_id');
    }

    public function period()
    {
        return $this->belongsTo(Period::class, 'period_id');
    }

    public function assignments()
    {
        return $this->hasMany(TaskAssignment::class, 'fixed_task_id');
    }
}
