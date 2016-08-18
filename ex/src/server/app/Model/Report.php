<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    //
    protected $table = 'report';
    protected $guarded = [''];
    public $timestamps = false;

    public function formatToApi() {
      return array(
          'id'          => $this->id,
          'title'       => $this->title,
          'title_at'    => $this->title_at,
          'status'      => $this->status,
          'need_notify' => 'xxxxx',
          'notified'    => 'xxx'
      );
    }


}
