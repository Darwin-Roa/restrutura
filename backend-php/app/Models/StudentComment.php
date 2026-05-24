<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentComment extends Model
{
    use HasFactory;

    protected $table = 'comentarios_estudiantes';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = ['comment_text', 'sentiment', 'source', 'course_id', 'evaluation_id'];

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class, 'evaluation_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
