<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recognition extends Model
{
    use HasFactory;

    protected $table = 'reconocimientos_ia';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'title', 'description', 'ai_generated', 'published', 'published_at',
        'teacher_id', 'period_id', 'plan_id', 'published_by',
    ];

    protected $casts = [
        'ai_generated' => 'boolean',
        'published' => 'boolean',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function period()
    {
        return $this->belongsTo(Period::class, 'period_id');
    }

    public function plan()
    {
        return $this->belongsTo(ImprovementPlan::class, 'plan_id');
    }

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
