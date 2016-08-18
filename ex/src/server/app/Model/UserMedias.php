<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class UserMedias extends Model
{
    //
    protected $guarded = [''];
    public $timestamps = true;


    public function formatToApi() {
        return array(
            'name' => '媒体名',
            'mid'  =>  $this->mid,
            'rank' =>  $this->rank,
        );
    }
}
