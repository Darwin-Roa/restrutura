<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanAction extends Model
{
    use HasFactory;

    protected $table = 'acciones_plan_ia';

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'plan_id', 'order_num', 'aspect', 'concrete_action',
        'verifiable_product', 'expected_goal', 'deadline', 'status', 'course_id',
        'carry_over_count', 'needs_carry_over',
    ];

    public function plan()
    {
        return $this->belongsTo(ImprovementPlan::class, 'plan_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function evidences()
    {
        return $this->hasMany(Evidence::class, 'plan_action_id');
    }
}
