<?php namespace App\Http\Controllers\Brand;

use App\Http\Api;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\Input;
use GraphAware\Neo4j\Client\ClientBuilder;

class ListController extends Controller {


	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 * 获取榜单名称列表信息
	 */
	public function getNav($nav=null)
	{
		$category = Input::get('category') ? Input::get('category') : 'all';

		$data = array();
		$category_list = array(
			'category'=>'手机',
			'data' => $this->getCategoryList()
		);

		array_push($data,$category_list);

		return $data;

	}

	/**
	 * 获取榜单列表 type: brand|product
	 */
	public function getList($nav,$category=null)
	{
		$type = Input::get('type');
		$count = Input::get('count') ? Input::get('count') : 'all';
		$trend = Input::get('trend') ? Input::get('trend') : 'true';
		$from = Input::get('from');
		$to = Input::get('to') ? Input::get('to') : date('Y-m-d');
		if(empty($from)){
			$data['result'] = '参数错误';
			return response()->json($data);
		}
		$from_format = Carbon::createFromFormat('Y-m-d',$from)->startOfDay();
		$to_format = Carbon::createFromFormat('Y-m-d',$to)->endOfDay();

		if($count == 'all'){
			$limit = '';
		}else{
			$limit = ' limit '.$count;
		}

		if($trend == 'true') {
			$startdate = strtotime($from);
			$enddate = strtotime($to);
			$days = round(($enddate - $startdate) / 86400) + 1;
			$last_form_format = Carbon::createFromFormat('Y-m-d', $from)->subDay($days)->startOfDay();
			$last_to_format = Carbon::createFromFormat('Y-m-d', $to)->subDay($days)->startOfDay();
		}

		if(!empty($category)){

			$data['category'] = $category;
			$data['data'] = array();
			if($type == 'brand'){
				$data['data'] = $this->getBrandList($category,$from_format,$to_format,$limit);
			}elseif($type == 'product'){
				$data['data'] = $this->getProductList($category,$from_format,$to_format,$limit);
			}


			//计算趋势
			if($trend == 'true'){
				if($type == 'brand'){
					$last_data = $this->getBrandList($category,$last_form_format,$last_to_format,$limit);
				}elseif($type == 'product'){
					$last_data = $this->getProductList($category,$last_form_format,$last_to_format,$limit);
				}
				foreach ($data['data'] as $key=>$value){
					foreach ($last_data as $k=>$v){
						if($value['name'] == $v['name']){
							if($value['rank'] > $v['rank']){
								$data['data'][$key]['trend'] = 1;
							}elseif($value['rank'] == $v['rank']){
								$data['data'][$key]['trend'] = 0;
							}elseif($value['rank'] < $v['rank']){
								$data['data'][$key]['trend'] = -1;
							}
						}
					}
					if(!isset($data['data'][$key]['trend'])){
						$data['data'][$key]['trend'] = 1;
					}
				}
			}

		}else{

			$category_list = $this->getCategoryList($nav);

			$data = array();
			foreach ($category_list as $category){
				$data_list['category'] = $category;
				$data_list['data'] = array();
				if($category['type'] == 'brand'){
					$data_list['data'] = $this->getBrandList($category['name'],$from_format,$to_format,$limit);
				}elseif($category['type'] == 'product'){
					$data_list['data'] = $this->getProductList($category['name'],$from_format,$to_format,$limit);
				}
				//计算趋势
				if($trend == 'true'){
					if($category['type'] == 'brand'){
						$last_data = $this->getBrandList($category['name'],$last_form_format,$last_to_format,$limit);
					}elseif($category['type'] == 'product'){
						$last_data = $this->getProductList($category['name'],$last_form_format,$last_to_format,$limit);
					}
					foreach ($data_list['data'] as $key=>$value){
						foreach ($last_data as $k=>$v){
							if($value['name'] == $v['name']){
								if($value['rank'] > $v['rank']){
									$data_list['data'][$key]['trend'] = 1;
								}elseif($value['rank'] == $v['rank']){
									$data_list['data'][$key]['trend'] = 0;
								}elseif($value['rank'] < $v['rank']){
									$data_list['data'][$key]['trend'] = -1;
								}
							}
						}
					}
					
				}
				array_push($data,$data_list);
			}

		}


		return $data;

	}

	/**
	 * 获取关键词关系图
	 */
	public function getRelation($nav,$keyword)
	{
		$type = Input::get('type');
		$count = Input::get('count') ? Input::get('count') : 20;
		if(empty($type) || empty($keyword)){
			$data['result'] = '参数错误';
			return response()->json($data);
		}

		if(!empty($count)){
			$limit = ' limit '.$count;
		}

		if($type == 'brand'){

			$query = 'Match (b:Brand {name:"'.$keyword.'"})<-[:useBrand]-(ia:Commodity)-[:AliasOf]->(ik:Alias)<-[r:TitleHasWords]-(art:Article),(art:Article)-[nr:TitleHasWords]->(nk:Alias),
(nk)<-[:AliasOf]-(na)
return na,sum(nr.count) as count order by count desc '. $limit;

		}elseif($type == 'product'){

			$query = 'Match (ia:Commodity {name:"'.$keyword.'"})-[:AliasOf]->(ik:Alias)<-[r:TitleHasWords]-(art:Article)-[nr:TitleHasWords]->(nk:Alias),
(nk)<-[:AliasOf]-(na) 
return na,sum(nr.count) as count order by count desc '. $limit;

		}

		$records = Api::queryNeo4jApi($query);

		$data = array(
			array(
				'name' => $keyword,
				'type' => $type,
				'rank' => 0
			)
		);
		foreach ($records as $record){
			$res = $record->values();
			$list['name'] = $res[0]->value('name');
			$list['type'] = 'Product';	//默认类型
			$types = $res[0]->labels();
			if(in_array('Brand',$types)){
				$list['type'] = 'Brand';
			}elseif(in_array('Company',$types)){
				$list['type'] = 'Company';
			}elseif(in_array('Commodity',$types)){
				$list['type'] = 'Commodity';
			}
			$list['rank'] = $res[1];
			array_push($data, $list);
		}

//		//模拟数据
//		$count = intval($count) != 0 ? $count : 10;
//		$data = array();
//		$list= array();
//		for ($i = 0; $i < $count; $i++) {
//			$list['name'] = $keyword.$i;
//			$list['rank'] = $i + 1;
//			if($i>6){
//				$list['type'] = 'Brand';
//			}elseif($i>3){
//				$list['type'] = 'Company';
//			}else{
//				$list['type'] = 'Product';
//			}
//			array_push($data,$list);
//		}

		return $data;

	}

	/**
	 * 获取分布详情
	 */
	public function getSpread($nav,$category)
	{
		$keywords = Input::get('keywords');
		if(!is_array($keywords)){
			$keywords = explode(',',$keywords);
		}
		$keywords = array_slice($keywords,0,5);	//最多5个

		$type = Input::get('type');
		$count = Input::get('count') ? Input::get('count') : 10;
		$from = Input::get('from');
		$to = Input::get('to') ? Input::get('to') : date('Y-m-d');
		if(!is_array($keywords) || empty($keywords) || empty($from)){
			$data['result'] = false;
			return response()->json($data);
		}
		$from_format = Carbon::createFromFormat('Y-m-d',$from)->startOfDay();
		$to_format = Carbon::createFromFormat('Y-m-d',$to)->endOfDay();

		if(!empty($count)){
			$limit = ' limit '.$count;
		}

		$data = array();
		foreach ($keywords as $keyword){
			if($type == 'brand'){

				$query = 'Match (b:Brand {name:"'.$keyword.'"})<-[:useBrand]-(ia:Commodity)-[:belongToProductType]->(:Product {name:"手机"}),
(ia)-[:AliasOf]->(ik:Alias)<-[r:ContHasWords|TitleHasWords]-(art:Article)
where art.publish_at>="' . $from_format . '" and art.publish_at <= "' . $to_format . '"
return ia,sum(r.count) as count order by count desc '. $limit;

			}elseif($type == 'product'){

				$query = 'Match (ia:Commodity {name:"'.$keyword.'"})-[:AliasOf]->(ik:Alias)<-[r:ContHasWords|TitleHasWords]-(art:Article)
where art.publish_at>="' . $from_format . '" and art.publish_at <= "' . $to_format . '"
return ik,sum(r.count) as count order by count desc '. $limit;

			}

			$records = Api::queryNeo4jApi($query);

			$list['keyword'] = $keyword;
			$list['data'] = array();
			$rank_count = 0;
			foreach ($records as $record){
				$values = $record->values();
				$res['name'] = $values[0]->value('name');
				$res['rank'] = $values[1];
				array_push($list['data'], $res);
				$rank_count += $res['rank'];
			}
			$list['rank'] = $rank_count;

			array_push($data,$list);

		}

//		//模拟数据
//		$count = intval($count) != 0 ? $count : 10;
//		$data = array();
//		$list= array();
//		foreach ($keywords as $keyword) {
//			$list['keyword'] = $keyword;
//			$list['data'] = array();
//			$rank_count = 0;
//			for ($i = 0; $i < $count; $i++) {
//				$res['name'] = $keyword.$i;
//				$res['rank'] = $i + 1;
//				array_push($list['data'], $res);
//				$rank_count += $res['rank'];
//			}
//			$list['rank'] = $rank_count;
//			array_push($data,$list);
//		}

		return $data;

	}

	//获取榜单名称
	public function getCategoryList($nav=null){
		$names = array(
			array(
				'name' => '手机品牌',
				'type' => 'brand'
			),
			array(
				'name' => '热门手机',
				'type' => 'product'
			)
		);
		return $names;
	}
	
	//获取所有品牌列表
	public function getBrandList($category,$from,$to,$limit){

		$query = 'Match (mobil:Product {name:"手机"}),(mobil)<-[:belongToProductType]-(ia:Commodity)-[:AliasOf]->(ik:Alias)<-[r:ContHasWords|TitleHasWords]-(art:Article)
where art.publish_at>="'.$from.'" and art.publish_at <= "'.$to.'"
with ik,sum(r.count) as ik_count 
match (ik)<-[:AliasOf]-(is)-[:useBrand]->(b:Brand)
return b,sum(ik_count) as count order by count desc '.$limit;

		$records = Api::queryNeo4jApi($query);

		$data = array();
		foreach ($records as $record) {
			$res = $record->values();
			$list['name'] = $res[0]->value('name');
			$list['rank'] = $res[1];
			array_push($data, $list);
		}

//		//模拟数据
//		$count = intval($limit)!=0 ? $limit:10;
//		$data = array();
//		for($i=0;$i<$count;$i++){
//			$list['name'] = $category.'品牌'.$i;
//			$list['rank'] = $i+1;
//			array_push($data, $list);
//		}
		
		return $data;
	}
	

	//获取商品列表
	public function getProductList($category,$from,$to,$limit){

		$query = 'Match (mobil:Product {name:"手机"}),(mobil)<-[:belongToProductType]-(ia:Commodity)-[:AliasOf]->(ik:Alias)<-[r:ContHasWords|TitleHasWords]-(a:Article)
where a.publish_at>="' . $from . '" and a.publish_at <= "' . $to . '"
with ik,sum(r.count) as ik_count 
match (ik)<-[:AliasOf]-(is)
return is,sum(ik_count) as count order by count desc ' . $limit;

		$records = Api::queryNeo4jApi($query);
		
		$data = array();
		foreach ($records as $record) {
			$res = $record->values();
			$list['name'] = $res[0]->value('name');
			$list['rank'] = $res[1];
			array_push($data, $list);
		}

//		//模拟数据
//		$count = intval($limit)!=0 ? $limit:10;
//		$data = array();
//		for($i=0;$i<$count;$i++){
//			$list['name'] = $category.'商品'.$i;
//			$list['rank'] = $i+1;
//			array_push($data, $list);
//		}

		return $data;

	}



}
