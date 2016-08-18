<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Keywords extends Model
{
    //
    public $timestamps = false;
    protected $guarded = [''];

    public function company()
    {
        return $this->hasOne('App\Model\CompanyKeywords','keyword_id', 'id');
    }

    public function category()
    {
        return $this->belongsToMany('App\Model\Category','keywords_category','keyword_id','category_id');
    }



    public  function formatToCategory() {
        $catAry = array();
        foreach($this->category as $cat) {
            $catObj['id'] = $cat['id'];
            $catObj['name'] = $cat['name'];
            array_push($catAry,$catObj);
        }
        return $catAry;
    }
}
