<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'updatedAt';
    const DELETED_AT = 'deletedAt';

    protected $fillable = [
        'nombre',
        'email',
        'cedula',
        'password',
        'role',
        'programa_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'cedula' => 'integer',
        'programa_id' => 'integer',
    ];

    protected $appends = [
        'department',
        'name',
    ];

    public function getNameAttribute()
    {
        return $this->nombre;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['nombre'] = $value;
    }

    public function getDepartmentAttribute()
    {
        return $this->programa ? $this->programa->nombre : null;
    }

    public function programa()
    {
        return $this->belongsTo(Programa::class, 'programa_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'user_has_permissions');
    }

    public function hasPermissionTo($permissionName)
    {
        // Direct permission
        if ($this->permissions()->where('name', $permissionName)->exists()) {
            return true;
        }
        // Role-based permission
        return \DB::table('role_has_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
            ->where('role_has_permissions.role_name', $this->role)
            ->where('permissions.name', $permissionName)
            ->exists();
    }
}
