<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Model\Category;
use App\Model\Keywords;
use App\Model\KeywordsCategory;
use App\Model\CompanyKeywords;
use App\Http\Api;
use Carbon\Carbon;
use Overtrue\Pinyin\Pinyin;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redis;
use GuzzleHttp;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
class CategoryController extends Controller
{
    //获取关键字分类列表
    public function index()
    {
        $begin = Input::get('begin');
        $count = Input::get('count');
        $companyUuid = Api::getCompanyId();
        $returnAry = array();
        foreach (Category::with(['keywords' => function($query){
            //关键字拼音正序
            $query->orderBy('py', 'asc');

        }]) ->skip($begin)
            ->take($count)
            ->where('company_uuid',$companyUuid)
            ->orderBy('py','asc')->get() as $cat) {
            array_push($returnAry,$cat->formatToApi());
        }

//        //获取分类,根据分类py排序
//        $cats = Category::orderBy('py','asc')
//                        ->skip($begin)
//                        ->take($count)
//                        ->get();
//
//        $catLastAt = Api::setKeyVal($cats,'id','updated_at');
//
//        //获取分类对应关键字,根据关键字拼音排序
//        $results = KeywordsCategory::leftJoin('keywords','keywords_category.keyword_id','=','keywords.id')
//                                ->orderBy('py','asc')
//                                ->get();
//        $catKeywords = Api::setKeyAry($results,'category_id','keyword_id');
////        $lastAt = KeywordsCategory::select('category_id','create_at')->orderBy('create_at','asc')->get();
////        $catLastAt = Api::setKeyVal($lastAt,'category_id','create_at');
//
//        //获取分类对应名称
//
//        $catNames = Api::setKeyVal($cats,'id','name');
//
//
//        //获取关键字对应名称
//        $keywords = Keywords::orderBy('py','asc')->get();
//        $keywordNames = Api::setKeyVal($keywords,'id','name');
//
//        //
////        $cpKeywords = CompanyKeywords::where('company_id',$companyId)->get();
////        $keywordStatus = Api::setKeyVal($cpKeywords,'keyword_id','status');
//
//
//        foreach($cats as $cat){
//            $rtItem = array();
//            $rtItem['id'] = $cat->id;                         //分类id
//            $rtItem['name'] = $cat->name;                     //分类名
//            $rtItem['last_at'] = $catLastAt[$cat->id]->toDateTimeString();        //最后更新时间
//
//            $rtItem['keywords'] = array();
//            if(isset($catKeywords[$cat->id])) {
//                foreach ($catKeywords[$cat->id] as $keyId) {
//                    $keyItem = array();
//                    $keyItem['id'] = $keyId;
//                    $keyItem['name'] = $keywordNames[$keyId];
////                $keyItem['status'] = $keywordStatus[$keyId];
//
//                    array_push($rtItem['keywords'], $keyItem);
//                }
//            }
//
//            array_push($returnAry,$rtItem);
//        }
        return response()->json(
            $returnAry
        );
    }

    //增加关键字分类
    public function store(Request $request)
    {
        $companyUuid = Api::getCompanyId();
        $creatorId = Api::getCreatorId();
        $name = $request->input('name');

        $catObj = Category::where('name',$name)
                        ->where('company_uuid',$companyUuid)
                        ->first();
        if($catObj){
            return response()->json(
                array(
                    'result' => false,
                    'msg'   => '分类已存在'
                )
            );
        }
        //分类不存在新建
        $catObj = Category::create(array(
            'name' => $name,
            'company_uuid' => $companyUuid,
            'creator_id' => $creatorId,
            'py' => Pinyin::trans($name)
        ));
        
        $keywords = $request->input('keywords');
        if(isset($keywords) && count($keywords) > 0) {
            //删除分类id的关键字
            $delKyCat = KeywordsCategory::where('category_id', $catObj->id)->delete();

            foreach($keywords as $keyId){
                KeywordsCategory::create(array(
                    'category_id' => $catObj->id,
                    'keyword_id' => $keyId,
                    'creator_id' => Api::getCreatorId(),
                    'create_at' => Carbon::now(),
                ));
            }
        }

        Log::info('添加关键字分类。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [categoryName:'.$name.'] [result:'.$catObj.'] ');

        return response()->json(
            array(
                'result' =>  true,
                'id'     =>  $catObj->id,
                'create_at' => $catObj->created_at->toDateTimeString()
            )
        );
    }

    /**
     * 修改关键字分类所关联的关键字
     * @param $id
     * @return true or false
     */
    public function update($id)
    {
        $dataAry = input::get('keywords');
//        $companyUuid = Api::getCompanyId();

        //删除分类id的关键字
        $delKyCat = KeywordsCategory::where('category_id', $id)->delete();
        if(isset($dataAry) && count($dataAry) > 0) {
            foreach ($dataAry as $key) {
                KeywordsCategory::create(array(
                    'category_id' => $id,
                    'keyword_id' => $key['id'],
                    'creator_id' => Api::getCreatorId(),
                    'create_at' => Carbon::now(),
                ));
            }
        }

        Log::info('修改关键字分类所关联的关键字。[companyUuid:'.Api::getCompanyId().'] [uuid:'.Api::getCreatorId().'] [categoryId:'.$id.'] [keywords:'.implode(',',$dataAry).'] ');
        
        return response()->json(
            array(
                'result' => true,
            )
        );
    }

    /**
     * 删除分类,并调用底层接口
     * @param $id
     * @return true|false
     */
    public function destroy($id)
    {
        //删除分类
        $delCat = Category::where('id', $id)->delete();

        //获取分类对应关键字
        $cats = Category::with('keywords')->where('id',$id)->first();

        //分类有对应关键字,操作底层接口
        if(count($cats['keywords']) > 0) {
            $companyUuid = Api::getCompanyId();
            $hbData = array();
            foreach ($cats['keywords'] as $key){
                $catObj['key'] = $key->name;
                $catObj['type'] = 'category';
                $catObj['tag'] = '_cat_'.$cats->id;

                array_push($hbData,$catObj);
            }

            $postData = array(
                'http_errors' => false,
                'form_params' =>[
                    'data'=> json_encode($hbData)
                ],
            );

            $response = Api::execGroutApi("PUT",'company/'.$companyUuid.'/tag_rules',$postData);
        }

        //删除关键字分类关联
        $delKyCat = KeywordsCategory::where('category_id', $id)->delete();

        //通知redis
        $channel = config('app.channel');
        $data['company_uuid'] = Api::getCompanyId();
        $data['action'] = 'delete';
        $data['object'] = 'category';
        $data['value'] = $id;

        Redis::publish($channel,json_encode($data));

        Log::info('删除分类。[companyUuid:'.Api::getCompanyId().'] [uuid:'.Api::getCreatorId().'] [categoryId:'.$id.'] ');
        
        return response()->json(
            array(
                'result' => $delCat || $delKyCat ? true : false
            )
        );
    }

    public function count()
    {
        return response()->json(
            array(
                'count' => Category::count()
            )
        );
    }

    public function test()
    {
//        for($i=1;$i<30;$i++) {
//            \App\model\StatisDay::create(array(
//                'type' => 5,
//                'st_id' => 'co_mi_xiaomitv',
//                'name' => 'bbs_cnt',
//                'value' => $i+10,
//                'record_at' => Carbon::now()->subDay($i)
//            ));
//        }

//        for($i=1;$i<100;$i++) {
//            \App\model\StatisMin::create(array(
//                'company_uuid' => 'co_mi_xiaomitv',
//                'weixin_cnt' => $i+50,
//                'weibo_cnt' => $i+150,
//                'bbs_cnt' => $i+250,
////                'value' => $i+10,
//                'create_at' => Carbon::now()->subMinute($i+3)
//            ));
//        }
        $returnAry = array();
//        foreach (Category::with('keywords')->where('id',$id)->get() as $cat) {
//            array_push($returnAry,$cat);
//        }
        $url = 'co_mi_xiaomitv/article/_search?search_type=count&pretty';
        $data = array(
            'http_errors' => false,
            'json'=>[
                "aggs"=>[
                    "mid_count"=>[
                        'cardinality' => [
                            "field" => "from.mid",
				            "precision_threshold" => 40000
                        ]
                    ]
                ]
            ]
        );
        $resp = Api::execEsApi("GET",$url,$data);
        return response()->json($resp);
    }
}
