<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Model\Keywords;
use App\Model\Category;
use App\Model\CompanyKeywords;
use App\Model\KeywordsCategory;
use App\Http\Api;
use Carbon\Carbon;
use Overtrue\Pinyin\Pinyin;
use Illuminate\Support\Facades\Input;
use GuzzleHttp;
use Illuminate\Support\Facades\Log;
class KeywordController extends Controller
{
    //
    public function get()
    {
        $companyUuid = Api::getCompanyId();
        $begin = Input::get('begin');
        $count = Input::get('count');
        $search = Input::get('search');
        

        //获取企业id对应关键字
        $cpKeys = CompanyKeywords::where('company_uuid',$companyUuid)->get();
        $keywordIds = array();
        $keywordInfo = array();
        foreach($cpKeys as $ret){
            array_push($keywordIds,$ret->keyword_id);       //关键字id数组
            $keywordInfo[$ret->keyword_id] = $ret->formatToApi();       //keyword_id=>result

        }
        $keywords = array();
        if(count($keywordIds)) {
            //查关键字表,拼音正序
            if(is_null($search)) {
                $keywords = Keywords::whereIn('id', $keywordIds)
                    ->orderBy('py', 'asc')
                    ->skip($begin)
                    ->take($count)
                    ->get();
            }else{
                $keywords = Keywords::whereIn('id', $keywordIds)
                    ->where('name','like',"%$search%")
                    ->orderBy('py', 'asc')
                    ->skip($begin)
                    ->take($count)
                    ->get();
            }
        }
//        $keywordNames = Api::setKeyVal($keywords,'id','name');

        $returnAry = array();

        foreach($keywords as $keyword){
            $rtItem = $keywordInfo[$keyword->id];
            $rtItem['name'] = $keyword->name;

            array_push($returnAry, $rtItem);
        }


        ///category为true,查询分类
        $category = Input::get('category');
        $ctKeyRes = array();
        $returnCat = array();
        if($category){
            foreach (Keywords::with(['category' => function($query){
                //拼音正序
                $query->orderBy('py', 'asc');

            }])->whereIn('id',$keywordIds)->get() as $kw) {
//                array_push($abc,$kw->formatToApi());
                $returnCat[$kw->id] = $kw->formatToCategory();
            }


            foreach($returnAry as $index => $rtItem){
                if(isset($returnCat[$rtItem['id']])) {
                    $rtItem['category'] = $returnCat[$rtItem['id']];
                    $returnAry[$index] = $rtItem;
                }
            }
//            //查关键字分类关联表
//            $ctKeyRes = KeywordsCategory::whereIn('keyword_id', $keywordIds)->get();
//            //获取分类id集合
//            $catIds = array();
//            foreach($ctKeyRes as $ret){
//                array_push($catIds,$ret->category_id);
//            }
//            $catIds = array_unique($catIds);
//
//            //根据id集合查分类,获取分类名
//            $catRes = Category::whereIn('id',$catIds)->get();
//            $catIdNames = Api::setKeyVal($catRes,'id','name');
//
//            $keyCat = Api::setKeyAry($ctKeyRes,'keyword_id','category_id');
//
//            $returnCat = array();
//            //遍历关键字对应分类数组keyword=>[cat1,cat2]
//            foreach($keyCat as $keyId => $ids){
//                $catAry = array();
//               foreach($ids as $catId){
//                    $catObj['id'] = $catId;
//                    $catObj['name'] = $catIdNames[$catId];
//
//                   array_push($catAry,$catObj);
//               }
//
//                $returnCat[$keyId] = $catAry;
//            }
//
//            foreach($returnAry as $index => $rtItem){
//                if(isset($returnCat[$rtItem['id']])) {
//                    $rtItem['category'] = $returnCat[$rtItem['id']];
//                    $returnAry[$index] = $rtItem;
//                }
//            }

        }

        return response()->json(
            $returnAry
        );
    }

    /**
     * 新加关键字
     * @param Request $request
     * @return bool
     */
    public function store(Request $request)
    {
        $companyUuid = Api::getCompanyId();
        //关键字名称
        $keyword = $request->get('name');

        $keywordObj = Keywords::where('name',$keyword)->first();
        //关键已存在
        if($keywordObj){
            //公司关键字是否存在
            $cpKeywordObj = CompanyKeywords::where([
                'company_uuid' => $companyUuid,
                'keyword_id' => $keywordObj->id
            ])->first();


            if ($cpKeywordObj) {
                return response()->json(
                    array(
                        'result' => false,
                        'msg' => config('const.errMsg.keywordExist')
                    )
                );
            }
        }else {
            $keywordObj = Keywords::create(array(
                'name' => $keyword,
                'py' => Pinyin::trans($keyword),
                'creator_id' => Api::getCreatorId(),
                'create_at' => Carbon::now(),
                'crawler' => 1
            ));

            Log::info('添加关键字。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [keyword:'.$keyword.'] [createResult:'.$keywordObj.'] ');

        }

        $keywordId = $keywordObj->id;
        //插入公司关键字关联表
        $emotion = $request->input('emotion');
        $related = $request->input('depend');
        $warn = $request->input('warn');

        $cpKeywordObj = CompanyKeywords::create(array(
            'company_uuid' => $companyUuid,
            'keyword_id' => $keywordId,
            'emotion' => $emotion,
            'related' => $related,
            'warn' => $warn,
            'status' => 1,
            'create_at' => Carbon::now()
        ));

        Log::info('插入公司关键字关联表。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [keyword:'.$keyword.'] [keywordId:'.$keywordId.'] [emotion:'.$emotion.'] [related:'.$related.'] [warn:'.$warn.'] [status:1] [createResult:'.$cpKeywordObj.'] ');

        //获取分类数组
        $category = $request->input('category');
        if(isset($category) && count($category) > 0) {
            //删除分类id的关键字
            $delKyCat = KeywordsCategory::where('keyword_id', $keywordId)->delete();
            Log::info('删除关键字的分类。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [keyword:'.$keyword.'] [keywordId:'.$keywordId.'] [deleteResult:'.$delKyCat.'] ');

            $catNames = array();
            //增加关键字对应分类
            foreach($category as $cat){
                $KeywordCgObj = KeywordsCategory::create(array(
                    'category_id' => $cat['id'],
                    'keyword_id' => $keywordId,
                    'creator_id' => Api::getCreatorId(),
                    'create_at' => Carbon::now(),
                ));

                array_push($catNames,$cat['name']);

                Log::info('增加关键字对应分类。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [keyword:'.$keyword.'] [keywordId:'.$keywordId.'] [categoryId:'.$cat['id'].'] [categoryName:'.$cat['name'].'] [createResult:'.$KeywordCgObj.'] ');

            }

//            $cats = $catNames;
//            $catObj['key'] = $keyword;
//            $catObj['type'] = 'category';
//            $catObj['tag'] = $cats;
//            array_push($hbData,$catObj);s
        }

        return response()->json(
            array(
                'result' => true,
                'id' =>$keywordObj->id
            )
        );

    }


    //格鲁特关键字标签操作
    public function keyFromGrout($method,$keyName,$row,$catKeyRows,$status=false)
    {
        $companyUuid = Api::getCompanyId();
        $const = config('const');
        $tags = $const['tags'];
        $hbData = array();
        foreach($tags as $tag){
            //增加关键字,无情感面
            if($method == 'POST' && $tag == 'emotion' && $row->emotion == 0) {
                continue;
            }
            //增加关键字,无预警
            if($method == 'POST' && $tag == 'warn' && $row->warn == 0) {
                continue;
            }

            $tgObj['key'] = $keyName;
            $tgObj['type'] = $tag;
            $tgObj['tag'] = $const[$tag][$row->$tag];

            array_push($hbData, $tgObj);

        }

        //分类
        if(count($catKeyRows) > 0) {
            $catIds = array();
            foreach ($catKeyRows as $cat) {
                array_push($catIds, $cat->category_id);
            }

            if (count($catIds) > 0) {
                $catRes = Category::where('company_uuid', $companyUuid)
                    ->whereIn('id', $catIds)->get();
                if (count($catRes) > 0) {
                    foreach ($catRes as $cat) {
                        $catObj['key'] = $keyName;
                        $catObj['type'] = 'category';
                        $catObj['tag'] = '_cat_' . $cat->id;
                        array_push($hbData, $catObj);
                    }
                }
            }
        }
        $postData = array(
            'http_errors' => false,
            'form_params' =>[
                'data'=> json_encode($hbData)
            ],
        );

        $url = 'company/'.$companyUuid.'/tag_rules';
        if($status){
            $url = 'company/'.$companyUuid.'/tag_rules?delflag=true';
        }
        $response = Api::execGroutApi($method,$url,$postData);

        Log::info('格鲁特关键字标签操作。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [method:'.$method.'] [data:'.$postData.'] [result:'.$response.'] ');
//        Log::info('del company keywords');
//        Log::info(json_encode($response->getBody()));

        return $response;
    }

    public function update($id)
    {
        $creatorId = Api::getCreatorId();
        $companyUuid = Api::getCompanyId();
        $const = config('const');
        $status = Input::get('status');
        $emotion = Input::get('emotion');
        $related = Input::get('depend');
        $warn = Input::get('warn');

        //更新公司关键字对应表
        $upRow = CompanyKeywords::where('keyword_id',$id)
            ->where('company_uuid',$companyUuid)
            ->first();
        //分类
        $catKeyRes = KeywordsCategory::where('keyword_id',$id)->get();
        $keyRes = Keywords::find($id);
        $keyName = $keyRes->name;
        $orgStatus = $upRow->status;
        $delKeys = array();

        //启用|停用
        if($status !== null) {
            $upRow->status = $status;

            $method = 'POST';
            if($status == 0){
                $method = 'PUT';
            }
            //调用接口
            $res = $this->keyFromGrout($method,$keyName,$upRow,$catKeyRes);
        }else{
            //启用状态修改
            if($orgStatus == 1){
                $this->keyFromGrout('PUT',$keyName,$upRow,$catKeyRes);
            }

            //修改关键字
            $upRow->emotion = $emotion;
            $upRow->related = $related;
            $upRow->warn = $warn;

            //更新关键字分类对应表(先删后加)
            $cats = Input::get('category');
            //获取关键字对应分类
            $catIds = array();
            foreach($catKeyRes as $row){
                array_push($catIds,$row->category_id);
            }

            if(count($catIds) > 0){
                $catRows = Category::where('company_uuid',$companyUuid)
                    ->whereIn('id',$catIds)
                    ->get();
                if(count($catRows) > 0) {
                    foreach ($catRows as $row) {
                        //删除keywords_category
                        $delKeywordCat = KeywordsCategory::where('category_id', $row->id)->delete();
                    }
                }
            }
            if(isset($cats) && is_array($cats) && count($cats) > 0){
                foreach($cats as $cat){
                    $keywordCatObj = KeywordsCategory::create(array(
                        'category_id' => $cat['id'],
                        'keyword_id'  => $id,
                        'create_at'   => Carbon::now(),
                        'creator_id'  => $creatorId
                    ));
                }
            }

            if($orgStatus == 1){
                $catKeyRows = KeywordsCategory::where('keyword_id',$id)->get();
                $this->keyFromGrout('POST',$keyName,$upRow,$catKeyRows);
            }
        }

        $res = $upRow->save();

        Log::info('修改关键字。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [keywordId:'.$id.'] [emotion:'.$emotion.'] [related:'.$related.'] [warn:'.$warn.'] [status:'.$status.'] [result:'.$res.'] ');

        return response()->json(
            array(
                'result' => true,
            )
        );
    }


    public function destroy($id)
    {
        $status = Input::get('del_article');
        $companyUuid = Api::getCompanyId();
        $cpKws = CompanyKeywords::where('keyword_id',$id)
                                ->where('company_uuid',$companyUuid)->first();

        $catRows = KeywordsCategory::where('keyword_id',$id)->get();

        //删除company_keywords
        $delCpKeyword = CompanyKeywords::where('keyword_id',$id)
                                        ->where('company_uuid',$companyUuid)
                                        ->delete();

        //删除keywords表,crawler改为0
        $kwdObj = Keywords::find($id);//where('id',$id)->update(['crawler' => 0]);
        $kwdObj->crawler = 0;
        $kwdObj->save();

        //删除keywords_category
//        $delKeywordCat = KeywordsCategory::where('keyword_id',$id)->delete();
        //删除关键字分类
        $catKeyRows = KeywordsCategory::where('keyword_id',$id)->get();
        $catIds = array();
        foreach($catKeyRows as $row){
            array_push($catIds,$row->category_id);
        }

        if(count($catIds) > 0){
            $catRows = Category::where('company_uuid',$companyUuid)
                            ->whereIn('id',$catIds)
                            ->get();
            if(count($catRows) > 0) {
                foreach ($catRows as $row) {
                    //删除keywords_category
                    $delKeywordCat = KeywordsCategory::where('category_id', $row->id)->delete();
                }
            }
        }

        //调用接口
        $res = $this->keyFromGrout('PUT',$kwdObj->name,$cpKws,$catRows,$status);

        Log::info('删除关键字。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [keywordId:'.$id.'] [result:'.$delCpKeyword.'] ');

        return response()->json(
            array(
                'result' => $kwdObj || $delCpKeyword || $delKeywordCat ? true : false
            )
        );
    }

    public function count()
    {
        $companyUuid = Api::getCompanyId();
        $search = Input::get('search');

        if($search){
            $rows = CompanyKeywords::where('company_uuid',$companyUuid)->get();
            $keyIds = array();

            foreach($rows as $row){
                array_push($keyIds,$row->keyword_id);
            }

            $cnt = Keywords::whereIn('id',$keyIds)
                            ->where('name','like',"%$search%")
                            ->count();

            return response()->json(
                array(
                    'count' => $cnt
                )
            );

        }

        return response()->json(
            array(
                'count' => CompanyKeywords::where('company_uuid',$companyUuid)->count()
            )
        );
    }

    public function index()
    {
        return response()->json(
            array(
             "sina"=>['data'=>[
                    [
                        "date"=>"2016-04-05",
                        "value" =>22
                    ],
                     [
                         "date"=>"2016-04-04",
                         "value" =>33
                     ],
                ]
             ],
             "baidu"=>['data'=>[
                     [
                         "date"=>"2016-04-04",
                         "value" =>11
                     ],
                     [
                         "date"=>"2016-04-05",
                         "value" =>22
                     ],
                 ]
             ],
             "360" => ['data'=>[
                 [
                     "date"=>"2016-04-04",
                     "value" =>44
                 ],
                 [
                     "date"=>"2016-04-05",
                     "value" =>55
                 ],
                ]
             ],
            )
        );
    }

}
