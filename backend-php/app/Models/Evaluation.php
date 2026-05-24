<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_desempeno';

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'score_students', 'score_director', 'score_self', 'score_total',
        'director_notes', 'student_rep_comments', 'course_id',
        'teacher_id', 'period_id', 'created_by',
    ];

    protected $casts = [
        'score_students' => 'decimal:1',
        'score_director' => 'decimal:1',
        'score_self' => 'decimal:1',
        'score_total' => 'decimal:1',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function period()
    {
        return $this->belongsTo(Period::class, 'period_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function studentComments()
    {
        return $this->hasMany(StudentComment::class, 'evaluation_id');
    }
}
