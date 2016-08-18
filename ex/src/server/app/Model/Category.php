<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    //
//    public $timestamps = false;
    protected $guarded = [''];
    protected $table = 'category';

    public function keywords()
    {
        return $this->belongsToMany('App\Model\Keywords','keywords_category', 'category_id', 'keyword_id');
    }


    public  function formatToApi() {
        return array(
            'id'    => $this->id,
            'name'  => $this->name,
            'last_at'  => $this->updated_at->toDateTimeString(),
            'keywords' => $this->formatToCategory($this->keywords)
        );
    }

    public  function formatToCategory($keywords) {
        $keywordAry = array();
        foreach($keywords as $keyword) {
               $kyObj['id'] = $keyword['id'];
               $kyObj['name'] = $keyword['name'];
                array_push($keywordAry,$kyObj);
        }
        return $keywordAry;
    }
}
