<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class CompanyMedias extends Model
{
    public $timestamps = false;
    protected $guarded = [''];

    //api返回
    public static function formatToApi($cat,$tags) {
        return array(
            'category' => $cat,
            'tags'     => $tags,
        );
    }
}
