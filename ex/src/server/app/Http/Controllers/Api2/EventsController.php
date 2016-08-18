<?php

namespace App\Http\Controllers\Api2;

use App\Http\Spread;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Input;
use App\Model\Event;

class EventsController extends Controller
{
    //获取事件名称
    public function getEventsName(){

        $ids = Input::get('id');
        
        if(!is_array($ids)){
            $ids = explode(',',$ids);
        }

        $rows = Event::whereIn('id',$ids)->get();
        
        $result = array();
        foreach ($rows as $evt){
            $event = array();
            $event['id'] = $evt->id;
            $event['name'] = $evt->title;
            array_push($result,$event);
        }
        
        return response()->json($result);

    }


}
