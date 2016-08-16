<?php

use GuzzleHttp;
use App\Index;

if(!function_exists('pzGuzzleHttp')){
	
	//接口
	function pzGuzzleHttp($method,$uri,$post_data){

		$client = new GuzzleHttp\Client(['base_uri' => $uri]);
		
		$response = $client->request($method,'',['form_params' => $post_data]);

		if($response){
			$result = json_decode($response->getBody());
			return $result->result;
		}else{
			return false;
		}

	}
	
}

if(!function_exists('getLastZhiShu')){

	//获取数据库指数最新数据
	function getLastZhiShu($company_id,$keyword,$zhishu){

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

