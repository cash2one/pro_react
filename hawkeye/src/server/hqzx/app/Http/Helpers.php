<?php
/**
 * Created by PhpStorm.
 * User: xzc
 * Date: 16-6-7
 * Time: 上午9:17
 */
namespace App\Http;

use GuzzleHttp;
use App\Index;


class Helpers{

    public static function pzGuzzleHttp($method,$uri,$post_data=null){

		$client = new GuzzleHttp\Client(['base_uri' => $uri]);

        if($post_data){
            $response = $client->request($method,'',['form_params' => $post_data]);
        }else{
            $response = $client->request($method,'');
        }
        
		if($response){
			$result = json_decode($response->getBody());
			return $result->result;
		}else{
            return false;
        }

    }

    //获取数据库指数最新数据
    public static function getLastZhiShu($company_id,$keyword,$zhishu){

        $last_data = Index::where('company_uuid',$company_id)
            ->where('keyword',$keyword)
            ->where($zhishu,'>',0)
            ->orderBy('day','desc')
            ->first();

        if(!empty($last_data)){
            return $last_data->$zhishu;
        }else{
            return null;
        }

    }

}