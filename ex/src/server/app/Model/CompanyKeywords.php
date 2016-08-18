<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class CompanyKeywords extends Model
{
    //
    public $timestamps = false;
    protected $guarded = [''];

    public  function formatToApi() {
        return array(
            'id'    => $this->keyword_id,
            'name'  => $this->name,
            'status'  => $this->status,
            'emotion'  => $this->emotion,
            'depend'  => $this->related,
            'warn'    => $this->warn
        );
    }

    public function keywords()
    {
        return $this->hasOne($this,'keyword_id','company_id');
//        return $this->belongsToMany('App\Model\Keywords','company_keywords', 'id', 'keyword_id');
    }

    public function companyKeywords()
    {
        return $this->belongsToMany('App\Model\CompanyKeywords','company_keywords','keyword_id','company_id');
    }
}
