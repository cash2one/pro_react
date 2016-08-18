<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Api;
use App\Model\CompanyMedias;
use App\Model\UserMedias;
use Illuminate\Support\Facades\Input;
use GuzzleHttp;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
class UserMediaController extends Controller
{
    //
    public function getTags() {
        //获取公司id
        $companyId = Api::getCompanyId();

        //根据company_id获取标签集
        $results = CompanyMedias::where('company_uuid','=',$companyId)->get();

        //生成分类对应标签集合数组
        $catTags = Api::setKeyAry($results,'mid_category','media_tag');

        $dataAry = array();
        foreach($catTags as $cat => $tags){
            //api返回格式
            array_push($dataAry,CompanyMedias::formatToApi($cat,$tags));
        }

        return response()->json(
            $dataAry
        );
    }

    //更新用户选择的媒体标签集
    public function putTags() {
        $mediaTags = Input::get('tags');
        $companyUuid = Api::getCompanyId();
        $creatorId = Api::getCreatorId();

        $hbData = array();
        foreach($mediaTags as $tags){
            $cat = $tags->category;
            //删除分类标签
            $delRow = CompanyMedias::where('mid_category', $cat)
                                    ->where('company_uuid',$companyUuid)
                                    ->delete();

            $hbData[$cat] = $tags;
            //增加分类标签
            foreach($tags as $tag){
                CompanyMedias::create(array(
                    'media_tag' => $tag,
                    'mid_category' => $cat,
                    'company_uuid' => $companyUuid,
                    'creator_id'   => $creatorId,
                    'create_at'    => Carbon::now()
                 ));
            }
        }

        //调用接口
        $cwUrl = config('app.cwUrl');
        $client = new GuzzleHttp\Client(['base_uri' => $cwUrl]);

        $postData = array(
            'http_errors' => false,
            'form_params' =>[
                'data'=> json_encode($hbData)
            ],
        );

        $response = $client->request('POST', '/company/'.$companyUuid.'/media/category',$postData);

        Log::info('设置某个公司关注的媒体类型');
        Log::info($response->getBody());

        return response()->json(array('result' => true));

    }


    //用户设置某个媒体的关注等级
    public function putRank(Request $request) {
        $mid = $request->input('mid');
        $rank = $request->input('rank');

        $companyUuid = Api::getCompanyId();

        $upRow = UserMedias::where('mid', $mid)
                        ->where('company_uuid',$companyUuid)
                        ->update(['rank' => $rank]);


        if(!$upRow){
            $upRow = UserMedias::create(array(
                'mid' => $mid,
                'rank' => $rank,
                'company_uuid' => $companyUuid,
                'status'=>1
            ));
        }

        $rankRes = UserMedias::where('company_uuid',$companyUuid)->get();
        $hbData = array();
        foreach($rankRes as $ret){
            $rk['mid'] = $ret->mid;
            $rk['rank'] = $ret->rank;

            array_push($hbData,$rk);
        }
        //调用接口
        $cwUrl = config('app.cwUrl');
        $client = new GuzzleHttp\Client(['base_uri' => $cwUrl]);

        $postData = array(
            'http_errors' => false,
            'form_params' =>[
                'data'=> json_encode($hbData)
            ],
        );

        $response = $client->request('POST', '/company/'.$companyUuid.'/media/special',$postData);

        Log::info('设置公司关注的媒体等级。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [mid:'.$mid.'] [rank:'.$rank.'] [createResult:'.$upRow.'] [cwUrlResult:'.$response->getBody().']');
        //Log::info($response->getBody());

        return response()->json(
            array(
                'result' => $upRow ? true : false,
            )
        );
    }

    //获取近20条
    public function getLast() {
        $companyUuid = Api::getCompanyId();
        $results = UserMedias::where('company_uuid',$companyUuid)
                            ->orderBy('updated_at','desc')->take(20)->get();

        $midIds = array();
        foreach($results as $ret){
            array_push($midIds,$ret->mid);
        }

        $mdRanks = Api::setKeyVal($results,'mid','rank');

        $url = 'medias/media/_search?pretty';
        $data = array(
            'http_errors' => false,
            'json'=>[
                "filter"=>[
                        "terms"=>[
                            'mid' => $midIds,
                        ]
                ]
            ]
        );
        $resp = Api::execEsApi("GET",$url,$data);

        $medias = array();
        $returns = array();
        if(count($resp->hits->hits)){
//            return response()->json($resp);
            $medias = $this->formatMediaData($resp,$mdRanks,true);
            foreach($midIds as $mid){
                if(isset($medias[$mid])) {
                    $ret = $medias[$mid];
                    foreach ($results as $result){
                        if($ret['mid'] == $result['mid']){
                            $ret['rank'] = $result['rank'];
                        }
                    }
                    array_push($returns, $ret);
                }
            }
        }

        return response()->json(
            $returns
        );
    }

    /**
     * 媒体搜索
     */
    public function search(){
        $companyUuid = Api::getCompanyId();
        $count = Input::get('count');
        $esUrl = config('app.esUrl');
        $client = new GuzzleHttp\Client(['base_uri' => $esUrl]);

        $query = Input::get('query');

        if($count){
            $getData = array(
                'json'=>[
                    "query"=>[
                        "and" => [
                            array(
                                "multi_match"=>[
                                    "query"=>$query,
                                    "fields"=>["name","tags","desc","auth","url"]
                                ]
                            ),
                            array(
                                "bool" => [
                                    "must_not" => [
                                        "term" => [
                                            "tags" => "_virtual_"
                                        ]
                                    ]
                                ]
                            )
                        ]
                    ]
                ]
            );

            $response = $client->request('GET','medias/media/_count?pretty',$getData);

            $res = json_decode($response->getBody());
            return response()->json(
                array('count' => $res->count)
            );
        }

        $page = Input::get('page');
        //高亮标签
        $highFields = ["name","desc"];
        foreach ($highFields as $field){
            $light_fields[$field] = (object)[
                "pre_tags" => ['<em class="search">'],
                "post_tags" => ['</em>']
            ];
        }
        $postData = array(
            'json'=>[
                "query"=>[
                    "and" => [
                        array(
                            "multi_match"=>[
                                "query"=>$query,
                                "fields"=>["name","tags","desc","auth","url"]
                            ]
                        ),
                        array(
                            "bool" => [
                                "must_not" => [
                                    "term" => [
                                        "tags" => "_virtual_"
                                    ]
                                ]
                            ]
                        )
                    ]
                ],
                "highlight" => [
                    "fields" => $light_fields
                ],
                "sort"=> [
                    ["_score" => "desc"],
                    ["name"=>"asc"],
                ],
                "from"=> $page*20,
                "size"=> 20
            ]
        );

        $response = $client->request('POST','medias/media/_search?pretty',$postData);

        $srhData = json_decode($response->getBody());
        $medias = array();
        if(count($srhData->hits->hits)){
            $midIds = array();
            foreach($srhData->hits->hits as $res){
                array_push($midIds,$res->_source->mid);
            }
            $results = UserMedias::where('company_uuid',$companyUuid)
                                ->whereIn('mid',$midIds)
                                ->get();
            $mdRanks = Api::setKeyVal($results,'mid','rank');
            $medias = $this->formatMediaData($srhData,$mdRanks);

        }

        return response()->json(
//            json_decode($response->getBody())
            $medias
        );
    }


    //格式化媒体搜索数据
    public function formatMediaData($data,$mdRanks,$last = false){
        $medias = array();
        $const = config('const');
        foreach($data->hits->hits as $res){
            $medObj = array();
            $item = $res->_source;
            foreach($item as $key=>$val){
                $medObj[$key] = $val;
            }

            if(isset($mdRanks[$item->mid])){
                $medObj['rank'] = $mdRanks[$item->mid];
            }else{
                $medObj['rank'] = Api::getRank($medObj['influence']);
            }
//            $medObj['rank'] = isset($mdRanks[$item->mid]) ? $mdRanks[$item->mid] : $item->rank;
//            $medObj['name'] = $res->_source->name;
//            $medObj['mid'] = $res->_source->mid;
//            $medObj['tags'] = $res->_source->tags;
//            $medObj['desc'] = $res->_source->desc;
//            $medObj['auth'] = $res->_source->auth;
//            $medObj['avater'] = $res->_source->avater;
            if(isset($medObj['tags']) && count($medObj['tags'])>0) {
                foreach ($medObj['tags'] as $key => $tag) {
                    if (strstr($tag, "_")) {
                        unset($medObj['tags'][$key]);
                        if (isset($const['medias'][$tag])) {
                            $medObj['media'] = $const['medias'][$tag];
                        }
                    }
                }
                $medObj['tags'] = array_values($medObj['tags']);
            }

            if($last){
                $medias[$res->_source->mid] = $medObj;
            }else{

                //高亮标签
                if(isset($res->highlight)){
                    $highFields = ["name","desc"];
                    foreach ($highFields as $field){
                        if(isset($res->highlight->$field[0])){
                            $medObj[$field] = $res->highlight->$field[0];
                        }
                    }
                }

                array_push($medias,$medObj);
            }


        }

        return $medias;
    }

    public function articleMedias(){
        $uuid = Input::get('company_uuid');
        $companyUuid = Api::getCompanyId();
        if($uuid != $companyUuid){
            return response()->json(array('result' => false));
        }
        
        $index = Api::getCompanyIndex();
        $url = $index.'/article/_search?search_type=count&pretty';

        $query = array(
            'bool' => [
                'must' => [
                    array(
                        'range' => [
                            'crawler_at' => [
                                'lte' => Api::getUpdateAt()
                            ]
                        ]
                    )
                ]
            ]
        );
        $from = Input::get('from');
        $to = Input::get('to');
        if(!empty($from)){
            $range_from = $from.' 00:00:00';
            if(!empty($to) && ( $to != Carbon::now()->format('Y-m-d') )){
                $range_to = $to.' 23:59:59';
            }else{
                $range_to = Carbon::now()->toDateTimeString();
            }
            $range = array(
                'range' => [
                    'publish_at' => [
                        'gte' => $range_from,
                        'lte' => $range_to
                    ]
                ]
            );
            array_push($query['bool']['must'],$range);
        }
        $data = array(
            'http_errors' => false,
            'json'=>[
                "query" => $query,
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
        $count = 0;
        if(isset($resp->aggregations->mid_count->value)){
            $count = $resp->aggregations->mid_count->value;
        }

        return response()->json(array(
            'count' => $count
        ));
    }

    public function eventMedias(){
        $uuid = Input::get('company_uuid');
        $companyUuid = Api::getCompanyId();
        if($uuid != $companyUuid){
            return response()->json(array('result' => false));
        }
        $index = Api::getCompanyIndex();
        $evtId = Input::get('event_id');
        $url = $index.'/article/_search?search_type=count&pretty';

        $query = array(
            'bool' => [
                'must' => [
                    array(
                        'range' => [
                            'crawler_at' => [
                                'lte' => Api::getUpdateAt()
                            ]
                        ]
                    ),
                    array(
                        'term'=> [
                            "result_tags" => '_evt_'.$evtId
                        ]
                    )
                ]
            ]
        );

        $from = Input::get('from');
        $to = Input::get('to');
        if(!empty($from)){
            $range_from = $from.' 00:00:00';
            if(!empty($to) && ( $to != Carbon::now()->format('Y-m-d') )){
                $range_to = $to.' 23:59:59';
            }else{
                $range_to = Carbon::now()->toDateTimeString();
            }
            $range = array(
                'range' => [
                    'publish_at' => [
                        'gte' => $range_from,
                        'lte' => $range_to
                    ]
                ]
            );
            array_push($query['bool']['must'],$range);
        }
        $data = array(
            'http_errors' => false,
            'json'=>[
                "query" =>  $query,
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

        $count = 0;
        if(isset($resp->aggregations->mid_count->value)){
            $count = $resp->aggregations->mid_count->value;
        }

        return response()->json(array(
            'count' => $count
        ));
    }
}


