<?php namespace App\Http\Controllers\HangQing;

use App\Http\Api;
use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Redis;
use App\Http\Helpers;

use App\Index;
use App\Keywords;
use Illuminate\Support\Facades\Input;

class IndexController extends Controller {


	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 * 获取关键字数据信息
	 */
	public function index(Request $request)
	{
		$user = Input::get('user');

		$keywords_id = Input::get('k');		//查询关键字，数组或字符串
		$from = Input::get('from')?Input::get('from'):date('Y-m-d',strtotime("-1 day"));	//数据起始时间
		$days = Input::get('days')?intval(Input::get('days')):7;					//查询天数

		if(!preg_match("/^\d{4}-\d{2}-\d{2}$/s", $from)){
			$data['result'] = false;
			$data['msg'] 	= '起始日期数据格式不正确！';
			return json_encode($data);
		}

		$company_uuid = $user->company_uuid;			//公司id

		if(!empty($keywords_id)){
			if(is_array($keywords_id)){
				$keywords_id = implode(',',$keywords_id);
			}
			$keywords = Keywords::whereRaw("company_uuid = '".$company_uuid."' AND status = 1 AND id IN (".$keywords_id.")")->get();	//获取关键字信息

		}else{
			$data['result'] = false;
			$data['msg'] 	= '获取不到关键字！';
			return json_encode($data);
		}

		if($keywords->count() != 0){

			$data = Array();

			foreach ($keywords as $keyword) {

				$keywords_data = Index::whereRaw("company_uuid='" . $company_uuid . "' AND keyword='" . $keyword->keyword . "' AND day>DATE_SUB('" . $from . "', INTERVAL " . $days . " DAY)")->orderBy('day', 'ASC')->get();

				if(count($keywords_data) > 0) {
					//数据格式转换
					unset($trans_data);
					foreach ($keywords_data as $value) {
						$trans_data[$value->day]['day'] = $value->day;
						//指数小于0时暂时返回空，-1表示抓取不到；-2表示抓取错误
						$trans_data[$value->day]['sina'] = ($value->sina < 0) ? null:$value->sina;
						$trans_data[$value->day]['baidu'] = ($value->baidu < 0) ? null:$value->baidu;
						$trans_data[$value->day]['data_360'] = ($value->data_360 < 0) ? null:$value->data_360;
						$trans_data[$value->day]['youku'] = ($value->youku < 0) ? null:$value->youku;
					}

					$first_data = false;        //起始数据
					$data_day = array();		//近一周每天的数据
					//数据处理
					for ($d = $days - 1; $d >= 0; $d--) {

						unset($days_d);
						$days_d = date('Y-m-d', (strtotime($from)) - 3600 * 24 * $d);	//近一周日期

						if (isset($trans_data[$days_d])) {
							if(!$first_data){
								if( !is_null($trans_data[$days_d]['sina']) || !is_null($trans_data[$days_d]['baidu']) || !is_null($trans_data[$days_d]['data_360']) || !is_null($trans_data[$days_d]['youku']) ){
									$first_data = true;
									$data_day[$keyword->id][$days_d] = $trans_data[$days_d];	//近一周各关键字每天的数据
								}
							}else{
								$data_day[$keyword->id][$days_d] = $trans_data[$days_d];	//近一周各关键字每天的数据
							}
						} elseif ($first_data) {
							//无数据时返回空
							$data_day[$keyword->id][$days_d]['day'] = $days_d;
							$data_day[$keyword->id][$days_d]['sina'] = null;
							$data_day[$keyword->id][$days_d]['baidu'] = null;
							$data_day[$keyword->id][$days_d]['data_360'] = null;
							$data_day[$keyword->id][$days_d]['youku'] = null;

						}

					}

					unset($days_data);
					unset($sina_data);
					unset($baidu_data);
					unset($data_360_data);
					unset($youku_data);

					if(!empty($data_day)){
						//数据转换
						foreach ($data_day[$keyword->id] as $keyword_d) {

							$days_data[] = $keyword_d['day'];
							$sina_data[] = $keyword_d['sina'];
							$baidu_data[] = $keyword_d['baidu'];
							$data_360_data[] = $keyword_d['data_360'];
							$youku_data[] = $keyword_d['youku'];
						}

						$data[$keyword->id]['day'] = $days_data;
						$data[$keyword->id]['sina'] = $sina_data;
						$data[$keyword->id]['baidu'] = $baidu_data;
						$data[$keyword->id]['data_360'] = $data_360_data;
						$data[$keyword->id]['youku'] = $youku_data;
					}

				}

			}

			$keywords_id = explode(',',$keywords_id);
			foreach ($keywords_id as $value){
				if(!isset($data[$value])){
					$data[$value]['day'] = '' ;
				}
			}

		}else{
			$data['result'] = false;
			$data['msg'] 	= '关键字不存在或未启用！';
		}

		return json_encode($data);

	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		//return view('hangqing.index.create');
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 *
	 * 添加关键字数据信息
	 */
	public function store(Request $request,$company_id)
	{

		$user_token = $request->header('user_token');	//获取user_token

		if($user_token == 'grout'){

			if($company_id){

				$post_data_array = json_decode(Input::get('data'));

				//$post_data = json_decode(file_get_contents("php://input"))->data;

				$result_false = 0; //操作失败次数

				foreach ($post_data_array as $post_data){

					//判断数据是否存在
					$hasone = Index::where(['company_uuid' => $company_id,'keyword' => $post_data->keyword,'day' => $post_data->day])->first();

					if(!empty($hasone)){
						//更新数据
						$hasone->id = $hasone->id;

						if(property_exists($post_data,'sina')){
							$hasone->sina = $post_data->sina;
						}

						if(property_exists($post_data,'baidu')){
							$hasone->baidu = $post_data->baidu;
						}

						if(property_exists($post_data,'data_360')){
							$hasone->data_360 = $post_data->data_360;
						}

						if(property_exists($post_data,'youku')){
							$hasone->youku = $post_data->youku;
						}

						$hasone->create_at = date('Y-m-d H:i:s',time());
						if (!$hasone->save()) {

							$result_false ++;

							$data['result'] = false;
							$data['msg'] 	= $post_data->keyword.' 更新失败！';

							echo json_decode($data);

						}

					}else{

						//插入数据
						$index = new Index;
						$index->keyword = $post_data->keyword;
						$index->company_uuid = $company_id;
						$index->day = $post_data->day;

						if(property_exists($post_data,'sina')){
							$index->sina = $post_data->sina;
						}

						if(property_exists($post_data,'baidu')){
							$index->baidu = $post_data->baidu;
						}

						if(property_exists($post_data,'data_360')){
							$index->data_360 = $post_data->data_360;
						}

						if(property_exists($post_data,'youku')){
							$index->youku = $post_data->youku;
						}

						$index->create_at = date('Y-m-d H:i:s',time());

						if (!$index->save()) {

							$result_false ++;

							$data['result'] = false;
							$data['msg'] 	= $post_data->keyword.' 添加失败！';

							echo json_decode($data);

						}
					}


				}

				if($result_false == 0){

					unset($data);
					$data['result'] = true;
					return json_encode($data);

				}else{

					$data['result'] = false;
					$data['msg'] 	= $result_false.' 条数据操作失败！';
					return json_encode($data);

				}

			}else{

				$data['result'] = false;
				$data['msg'] 	= '获取不到公司信息！';

				return json_encode($data);

			}

		}else{
			
			$data['result'] = false;
			$data['msg'] 	= '无权限操作！';

			return json_encode($data);
		}

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		//
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//

	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}

	public function reportIndex(Request $request)
	{
		$code = Input::get('code');
		if(empty($code)){
			$data['result'] = false;
			$data['msg'] 	= '获取不到信息';
			return json_encode($data);
		}
		$user = Api::getInfoByCode($code);
		$company_uuid = $user['companyUuid'];			//公司id

		$keywords_id = Input::get('k');		//查询关键字，数组或字符串
		$from = Input::get('from')?Input::get('from'):date('Y-m-d',strtotime("-1 day"));	//数据起始时间
		$days = Input::get('days')?intval(Input::get('days')):7;					//查询天数

		if(!preg_match("/^\d{4}-\d{2}-\d{2}$/s", $from)){
			$data['result'] = false;
			$data['msg'] 	= '起始日期数据格式不正确！';
			return json_encode($data);
		}

		if(!empty($keywords_id)){
			if(is_array($keywords_id)){
				$keywords_id = implode(',',$keywords_id);
			}
			$keywords = Keywords::whereRaw("company_uuid = '".$company_uuid."' AND status = 1 AND id IN (".$keywords_id.")")->get();	//获取关键字信息

		}else{
			$data['result'] = false;
			$data['msg'] 	= '获取不到关键字！';
			return json_encode($data);
		}

		if($keywords->count() != 0){

			$data = Array();

			foreach ($keywords as $keyword) {

				$keywords_data = Index::whereRaw("company_uuid='" . $company_uuid . "' AND keyword='" . $keyword->keyword . "' AND day>DATE_SUB('" . $from . "', INTERVAL " . $days . " DAY)")->orderBy('day', 'ASC')->get();

				if(count($keywords_data) > 0) {
					//数据格式转换
					unset($trans_data);
					foreach ($keywords_data as $value) {
						$trans_data[$value->day]['day'] = $value->day;
						//指数小于0时暂时返回空，-1表示抓取不到；-2表示抓取错误
						$trans_data[$value->day]['sina'] = ($value->sina < 0) ? null:$value->sina;
						$trans_data[$value->day]['baidu'] = ($value->baidu < 0) ? null:$value->baidu;
						$trans_data[$value->day]['data_360'] = ($value->data_360 < 0) ? null:$value->data_360;
						$trans_data[$value->day]['youku'] = ($value->youku < 0) ? null:$value->youku;
					}

					$first_data = false;        //起始数据
					$data_day = array();		//近一周每天的数据
					//数据处理
					for ($d = $days - 1; $d >= 0; $d--) {

						unset($days_d);
						$days_d = date('Y-m-d', (strtotime($from)) - 3600 * 24 * $d);	//近一周日期

						if (isset($trans_data[$days_d])) {
							if(!$first_data){
								if( !is_null($trans_data[$days_d]['sina']) || !is_null($trans_data[$days_d]['baidu']) || !is_null($trans_data[$days_d]['data_360']) || !is_null($trans_data[$days_d]['youku']) ){
									$first_data = true;
									$data_day[$keyword->id][$days_d] = $trans_data[$days_d];	//近一周各关键字每天的数据
								}
							}else{
								$data_day[$keyword->id][$days_d] = $trans_data[$days_d];	//近一周各关键字每天的数据
							}
						} elseif ($first_data) {
							//无数据时返回空
							$data_day[$keyword->id][$days_d]['day'] = $days_d;
							$data_day[$keyword->id][$days_d]['sina'] = null;
							$data_day[$keyword->id][$days_d]['baidu'] = null;
							$data_day[$keyword->id][$days_d]['data_360'] = null;
							$data_day[$keyword->id][$days_d]['youku'] = null;

						}

					}

					unset($days_data);
					unset($sina_data);
					unset($baidu_data);
					unset($data_360_data);
					unset($youku_data);

					if(!empty($data_day)){
						//数据转换
						foreach ($data_day[$keyword->id] as $keyword_d) {

							$days_data[] = $keyword_d['day'];
							$sina_data[] = $keyword_d['sina'];
							$baidu_data[] = $keyword_d['baidu'];
							$data_360_data[] = $keyword_d['data_360'];
							$youku_data[] = $keyword_d['youku'];
						}

						$data[$keyword->id]['day'] = $days_data;
						$data[$keyword->id]['sina'] = $sina_data;
						$data[$keyword->id]['baidu'] = $baidu_data;
						$data[$keyword->id]['data_360'] = $data_360_data;
						$data[$keyword->id]['youku'] = $youku_data;
					}

				}

			}

			$keywords_id = explode(',',$keywords_id);
			foreach ($keywords_id as $value){
				if(!isset($data[$value])){
					$data[$value]['day'] = '' ;
				}
			}

		}else{
			$data['result'] = false;
			$data['msg'] 	= '关键字不存在或未启用！';
		}

		return json_encode($data);

	}

}
