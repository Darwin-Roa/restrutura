<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $table = 'roles_sistema';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = ['name', 'label', 'permissions', 'is_system', 'created_by'];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
    ];
}
