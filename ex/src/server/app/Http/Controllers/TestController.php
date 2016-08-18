<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class TestController extends Controller
{
    //
    public function test()
    {
        $uri = "http://www.star-lord-ex.com/api/v1/user/media/rank/1/5";
        // 参数数组
//        $data = array(
//        'name' => "关键字",
//        'emotion' => 1,
//        'depend' => 1,
//        'warn' => 1,
//        'category'=>[
//                    'id'=>1,
//                    'name'=>'abc',
//            ]
//        );
        $data = [
            'mid'=>1,
            'rank'=>1
        ];
        $ch = curl_init ();
        curl_setopt ( $ch, CURLOPT_URL, $uri );
//        curl_setopt ( $ch, CURLOPT_PUT, 1 );
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
//        curl_setopt ( $ch, CURLOPT_HEADER, 0 );
        curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
        curl_setopt ( $ch, CURLOPT_POSTFIELDS, $data );


        $return = curl_exec ( $ch );
        curl_close ( $ch );
        echo $return;
    }
}
