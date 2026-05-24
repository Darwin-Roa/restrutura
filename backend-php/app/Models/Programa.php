<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Programa extends Model
{
    protected $table = 'programa';

    public $timestamps = false;

    protected $fillable = ['nombre', 'activo'];

    protected $casts = [
        'activo' => 'integer',
    ];

    public function usuarios()
    {
        return $this->hasMany(User::class, 'programa_id');
    }
}
