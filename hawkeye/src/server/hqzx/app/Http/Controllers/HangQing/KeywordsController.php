<?php namespace App\Http\Controllers\HangQing;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Http\Helpers;
use App\Keywords;
use App\Index;
use Illuminate\Support\Facades\Input;
use App\Http\Api;

class KeywordsController extends Controller {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 *
	 * 获取公司关键字列表
	 */
	public function index()
	{
		$user = Input::get('user');
		
		$company_uuid = $user->company_uuid;			//公司id
		$data = Keywords::where('company_uuid',$company_uuid)->orderBy('create_at','ASC')->get();	//当前公司关键字列表

		return json_encode($data);


	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 *
	 * 增加关键字
	 */
	public function store(Request $request)
	{
		$keyword = Input::get('keyword');			//关键字

		if(!$keyword){

			$data['result'] = false;
			$data['msg'] 	= '请输入关键字！';

			return json_encode($data,406);

		}

		$user = Input::get('user');
		
		$company_uuid = $user->company_uuid;	//公司id

		//判断关键字是否存在
		$hasone = Keywords::where(['company_uuid' => $company_uuid,'keyword' => $keyword])->first();

		if(!empty($hasone)){

			$data['result'] = false;
			$data['msg'] = '关键字已存在！';

		}else{

			$keywords = new Keywords;
			$keywords->keyword = Input::get('keyword');
			$keywords->company_uuid = $user->company_uuid;
			$keywords->creator_id = $user->uuid;
			//$keywords->py = '';
			$keywords->status = 0;
			$keywords->create_at = date('Y-m-d H:i:s',time());
			if ($keywords->save()) {

				$data = Keywords::find($keywords->id);

				$api_zhishu_uri = config('app.api_zhishu_uri');

				$method = 'POST';
				$uri = $api_zhishu_uri.$data->company_uuid;

				$post_data = array (
					"hawkeye_host" => config('app.hawkeye_host'),
					"keys" => json_encode(array($data->keyword))
				);

				if(Helpers::pzGuzzleHttp($method,$uri,$post_data)){
					
					$data['result'] = true;
					
				}else{
					$data['result'] = false;
					$data['msg'] 	= '保存成功！更新抓取指数失败！';
				}

			} else {

				$data['result'] = false;
				$data['msg'] = '保存失败！';

			}

		}


		return json_encode($data);

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 *
	 * 更新关键字状态	status 默认：1：启用；0：关闭
	 */
	public function update($id)
	{
		$user = Input::get('user');
		
		$api_zhishu_uri = config('app.api_zhishu_uri');

		$company_uuid = $user->company_uuid;	//公司id
		$keyword_id	= intval($id);					//关键字id
		$keyword = Keywords::where(['company_uuid' => $company_uuid,'id' => $keyword_id])->first();

		if(!empty($keyword)){

			if($keyword->status == 1){

				$keyword->status = 0;

				$method = 'DELETE';
				$uri =  $api_zhishu_uri.$company_uuid;

				$post_data = array (
					"_method" => "DELETE",
					"keys" => json_encode(array($keyword->keyword))
				);


			}else{

				$keyword->status = 1;

				$method = 'POST';
				$uri = $api_zhishu_uri.$company_uuid;
				$post_data = array (
					"hawkeye_host" => config('app.hawkeye_host'),
					"keys" => json_encode(array($keyword->keyword))
				);

			}


			if ($keyword->save()) {

				if(Helpers::pzGuzzleHttp($method,$uri,$post_data)) {

					$data['result'] = true;

				}else{

					$data['result'] = false;
					$data['msg'] = '保存成功！抓取指数失败！';

				}


			}else{

				$data['result'] = false;
				$data['msg'] = '保存失败！';

			}


		}else{

			$data['result'] = false;
			$data['msg'] = '关键字不存在！';

		}
		
		return json_encode($data);

	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 *
	 * 删除关键字
	 */
	public function destroy($id)
	{
		$user = Input::get('user');
		
		$company_uuid = $user->company_uuid;	//公司id
		
		if(empty($id)){
			
			$data['result'] = false;
			$data['msg'] = '关键字不能为空！';

		}else{

			$keyword_id	= intval($id);					//关键字id
			$keyword = Keywords::where(['company_uuid' => $company_uuid,'id' => $keyword_id])->first();

			if(!empty($keyword)){

				if($keyword->status == 1){

					$data['result'] = false;
					$data['msg'] = '关键字已启用，不可删除！';

				}elseif ($keyword->delete()) {

					//删除关键字指数数据
					Index::where(['company_uuid' => $company_uuid,'keyword' => $keyword->keyword])->delete();

					$data['result'] = true;

					$method = 'GET';
					$api_zhishu_del_uri = config('app.api_zhishu_del_uri');
					$del_keyword = urlencode(mb_convert_encoding($keyword->keyword, 'gb2312'));
					$uri = $api_zhishu_del_uri.'?keyword='.$del_keyword.'&company='.$company_uuid;
					$data['msg'] = Helpers::pzGuzzleHttp($method,$uri);

				} else {

					//return Redirect::back()->withInput()->withErrors('保存失败！');
					$data['result'] = false;
					$data['msg'] = '删除失败！';

				}

			}else{

				$data['result'] = false;
				$data['msg'] = '关键字不存在！';

			}
			
		}
	
		return json_encode($data);

	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 *
	 * 报表获取公司关键字列表
	 */
	public function reportIndex()
	{
		$code = Input::get('code');
		if(empty($code)){
			$data['result'] = false;
			$data['msg'] 	= '获取不到信息';
			return json_encode($data);
		}
		$user = Api::getInfoByCode($code);
		$company_uuid = $user['companyUuid'];			//公司id
		
		$data = Keywords::where('company_uuid',$company_uuid)->orderBy('create_at','ASC')->get();	//当前公司关键字列表

		return json_encode($data);


	}
	
	
}
