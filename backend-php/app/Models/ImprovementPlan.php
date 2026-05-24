<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ImprovementPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'planes_mejora_ia';

    const DELETED_AT = 'deletedAt';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'status',
        'diagnosis_text',
        'strengths',
        'improvement_opps',
        'objectives',
        'consolidated_comments',
        'work_plan',
        'history_analysis',
        'ai_generated_at',
        'ai_prompt_context',
        'reviewed_at',
        'director_feedback',
        'approved_at',
        'notified_teacher',
        'notified_at',
        'teacher_id',
        'period_id',
        'evaluation_id',
        'reviewed_by',
    ];

    protected $casts = [
        'strengths' => 'array',
        'improvement_opps' => 'array',
        'objectives' => 'array',
        'consolidated_comments' => 'array',
        'work_plan' => 'array',
        'notified_teacher' => 'boolean',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function period()
    {
        return $this->belongsTo(Period::class, 'period_id');
    }

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class, 'evaluation_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function actions()
    {
        return $this->hasMany(PlanAction::class, 'plan_id');
    }

    public function recognitions()
    {
        return $this->hasMany(Recognition::class, 'plan_id');
    }
}
