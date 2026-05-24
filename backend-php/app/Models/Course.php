<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $table = 'cursos';

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'code',
        'name',
        'group',
        'period_id',
    ];

    public function period()
    {
        return $this->belongsTo(Period::class, 'period_id');
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'course_id');
    }

    public function planActions()
    {
        return $this->hasMany(PlanAction::class, 'course_id');
    }

    public function teacherCourses()
    {
        return $this->hasMany(TeacherCourse::class, 'course_id');
    }
}
