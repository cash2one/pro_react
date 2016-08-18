<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use GuzzleHttp;
use App\Model\ArticleTags;
use Carbon\Carbon;
use App\Http\Api;
use App\Model\StatisDay;
use App\Model\Event;
use App\Model\Report;
use App\Model\StatisMin;
use App\Http\Spread;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class ArticleController extends Controller
{
    public function getIndex()
    {
        $mid = Input::get('mids');         //媒体分类
        $time = Input::get('time');         //时间范围
        $cate = Input::get('cate');
        $emotion = Input::get('emotion');
        $warn = Input::get('warn');
        $count = Input::get('count');
        $search = Input::get('search');
        $title = Input::get('title');
        $beg = Input::get('begin');
        $limit = Input::get('limit');
        $evtId = Input::get('event_id');
        $order = Input::get('order');

        $cpIndex = Api::getCompanyIndex();
        $url  = $cpIndex.'/article/_search/?pretty -d';

        if($count){
            $url  = $cpIndex.'/article/_count/?pretty -d';
        }

        $sort = [
            ["_score" => "desc"],
            ["crawler_at" => "desc"],
        ];

        if(isset($order) && $order == 'publish_at'){
            $sort = [
                ["publish_at" => "desc"],
            ];
        }

        //过滤条件
        //$terms = array();
        $terms = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            )
        );
        $todaySt = Carbon::now()->startOfDay()->toDateTimeString();
        //$todayEnd = Carbon::now()->endOfDay()->toDateTimeString();
        $todayEnd = Carbon::now()->toDateTimeString();
        $yesterdaySt = Carbon::now()->subDay(1)->startOfDay()->toDateTimeString();
        $yesterdayEnd = Carbon::now()->subDay(1)->endOfDay()->toDateTimeString();
        //时间范围过滤
        $range = ["from"=>"now-1M"];        //默认一个月
        if(isset($time)){
            if($time == 'today'){
                $range = ["from"=>$todaySt,"to"=>$todayEnd];
            }
            else if($time == 'yesterday'){
                $range = ["from"=>$yesterdaySt,"to"=>$yesterdayEnd];
            }
            else if($time == 'last_week'){
                $range = ["from"=>"now-7d"];
            }
            else if($time == 'all'){
                $range = ["to"=>"now"];
            }
        }

        $rangeTerm['range'] = ["crawler_at" => $range];
        array_push($terms,$rangeTerm);

        //媒体过滤
        if(isset($mid)){
            if($mid != 'all') {
                $midTerm['term'] = ["from.tags" => '_cat_'.$mid];
                array_push($terms, $midTerm);
            }
        }

        //分类过滤
        if(isset($cate)){
            if($cate != 'all') {
                $cateTerm['term'] = ["result_tags" => $cate];
                array_push($terms, $cateTerm);
            }
        }

        //情感面过滤
        if(isset($emotion)){
            switch ($emotion){
                case 'positive':
                    $emotion = '_emo_positive';
                    break;
                case 'negative':
                    $emotion = '_emo_negative';
                    break;
                case 'neutral':
                    $emotion = '_emo_neutral';
                    break;
            }

            if($emotion != 'all') {
                $emTerm['term'] = ["result_tags" => $emotion];
                array_push($terms, $emTerm);
            }
        }

        //预警过滤
        if(isset($warn)){
            switch ($warn){
                case 'manual':
                    $warn = '_warn_manual';
                    break;
                case 'auto':
                    $warn = '_warn_';
                    break;
            }

            if($warn != 'ignore' && $warn != 'all') {
                $wnTerm['term'] = ["result_tags" => $warn];
                array_push($terms, $wnTerm);
            }

            if($warn == 'all') {
//                $term1['term']["result_tags"] = '_warn_manual';
//                $term2['term']["result_tags"] = '_warn_';
//                $wnTerm['should'] = array();
                $wnTerm['terms'] = ["result_tags" => array('_warn_','_warn_manual')];
//                array_push($wnTerm['should'],$term1,$term2);


                array_push($terms, $wnTerm);
            }
        }

        //事件
        if(isset($evtId)){
            if($evtId != 'all') {
                $evtTerm['term'] = ["result_tags" => '_evt_'.$evtId];
                array_push($terms, $evtTerm);
            }
        }


        $matchCon = array();
        //搜索文章
        if($search){
//            $matchCon = array(
//                "multi_match"=>[
//                    "query"=>$search,
//                    "fields"=>["link_title","content"]
//                ]);
            $matchCon = array(
                "bool"=> [
                    "should" => [
                        [
                            "match" => [
                            "link_title"=> [
                                "query" => $search,
                                "boost"=> 66
                            ]
                          ]
                        ],
                        [
                            "match"=> [
                            "content"=> $search
                          ]
                        ]
                    ]
                ]
            );
        }else{
            $matchCon = array('match_all'=>[]);
        }

        $postData = array();

        if($search){
            $postData = array(
                'http_errors' => true,
                'json' => [
                    "sort" => $sort,
                    "query" =>  [
                        "filtered" => [
                            "query" => $matchCon,
                            "filter" => [
                                "and" => $terms
                            ],
                        ]
                    ],

//                    "min_score" => 0.01,
                    "from" => $beg,
                    "size" => $limit
                ]

            );
        }else {
            $postData = array(
                'http_errors' => true,
                'json' => [
                    "sort" => $sort,
                    "min_score" => 0.05,
                    "query" => $matchCon,
                    "filter" => [
                        "and" => $terms
                    ],
                    "from" => $beg,
                    "size" => $limit

                ]
            );
        }
        //不看重复标题的
        if($title == 'false'){
            $con = [
                "group_by_state"=>[
                    "terms"=> [
                        "field"=> "title_sign"
                    ]
                ]
            ];

            $postData['json']['aggs'] = $con;
        }
//        $js = json_encode($postData);

        //传入beg大于990,返回空数组
        if($beg >= 990){
            return response()->json(array());
        }

        $response = Api::execEsApi('POST',$url,$postData);
        //返回文章数
        if($count) {
            $artCnt = isset($response->count) ? $response->count : 0;
//            if($artCnt > 1000 && isset($mid)){
//                $artCnt = 990;
//            }
            return response()->json(array(
                'count'=>$artCnt
            ));
        }

        //标题不重复
        if($title == 'false'){
            //有查询结果
            if(isset($response->aggregations->group_by_state->buckets)) {
                $titleSigns = $response->aggregations->group_by_state->buckets;
                if(count($titleSigns) > 0) {
                    $tSigns = array();
                    foreach ($titleSigns as $res) {
                        array_push($tSigns, $res->key);
                    }

                    $postData = array(
                        'http_errors' => true,
                        'json'=>[
                            "sort"=> [
                                ["_score" => "desc"],
                                ["crawler_at"=>"desc"],
                            ],
                            "min_score" => 0.05,
                            "filter" => [
                                "terms"=>[
                                    "title_sign"=>$tSigns,
                                ]
                            ],
                        ]
                    );
                }
                //查询title_sign对应文章
                $resp = Api::execEsApi('GET',$url,$postData);

                $arts = $resp->hits->hits;
                $disArts = array();
                foreach ($arts as $art) {
                    if (!isset($art->_source->link_title))
                        continue;
                    $disArts[$art->_source->title_sign] = $art;
                }

                $returns = array();
                foreach ($disArts as $key=>$art) {
                    $rtObj = Api::formatArticle($art);
                    array_push($returns, $rtObj);
                }

                return response()->json($returns);
            }
        }

        $returns = array();
        if(isset($response->hits->hits)) {
            $arts = $response->hits->hits;
            foreach ($arts as $art) {
                if (!isset($art->_source->link_title))
                    continue;

                $rtObj = Api::formatArticle($art);
                array_push($returns, $rtObj);
            }

            return response()->json($returns);
        }

        return response()->json($returns);


    }

//    public function getArticleCount()
//    {
//        $warn = Input::get('warn');
//        $cpIndex = Api::getCompanyIndex();
//        $url  = $cpIndex.'/article/_count/?pretty -d';
//
//        $todayBeg = Carbon::now()->startOfDay()->toDateTimeString();
//        $todayEnd = Carbon::now()->endOfDay()->toDateTimeString();
//
//        $cons = array();
////        array_push($cons,array(
////            "range"=>[
////                "crawler_at"=>[
////                    "lt"=> $todayBeg
////                ]
////            ]
////        ));
//
//        if(isset($warn)){
//            $wnTerm['terms'] = ["result_tags" => array('_warn_','_warn_manual')];
//            array_push($cons,$wnTerm);
//
//            $postData = array(
//                'http_errors' => false,
//                'json'=>[
//                    "filter"=>[
//                        "and"=>$cons
//                    ]
//                ]
//            );
//            $resp = Api::execEsApi('GET',$url,$postData);
//        }else{
//            $resp = Api::execEsApi('GET',$url);
//        }
//
//
//        $artCnt = $resp->count;
////        $tdRow = StatisMin::where('company_uuid',$cpIndex)
////                        ->where('create_at','<=',$todayEnd)
////                        ->where('create_at','>',$todayBeg)
////                        ->orderBy('id','desc')
////                        ->first();
//
////        $tdCnt = 0;
////        if($tdRow) {
////            $tdCnt = $tdRow->positive_cnt + $tdRow->negative_cnt + $tdRow->neutral_cnt;
////        }
////        $artCnt = 0;
////        if(isset($warn)){
////            $artCnt = $resp->count + $tdRow ? $tdRow->warn_cnt : 0;
////        }else{
////            $artCnt = $resp->count + $tdCnt;
////        }
//
//        return response()->json(array(
//            'count'=>$artCnt
//        ));
//
//    }

    public function detail()
    {
        $cpIndex = Api::getCompanyIndex();
        $uuid = Input::get('uuid');
        $url = $cpIndex.'/article/'.$uuid.'/?pretty -d';
        $resp = Api::execEsApi("GET",$url);

        if($resp=='450'){
            return response()->json(null, 450);
        }
        $returns = Api::formatArticle($resp);
        return response()->json($returns);
    }

//    public function formatArticle($art)
//    {
//        $companyUuid = Api::getCompanyId();
//        $rtObj = [];
//        $item = $art->_source;
//        $rtTags = $item->result_tags;
//
//        foreach($item as $key=>$val){
//            if($key == 'link_title'){
//                $rtObj['title'] = $val;
//            }
//            //过滤下划线
//            if($key == 'tags'){
//                foreach($val as $k=>$v){
//                    if(substr($v,0,1) == '_'){
//                        unset($val[$k]);
//                    }
//                }
//            }
//
//            $rtObj[$key] = $val;
//        }
//
//        $rtObj['dependent'] = true;
////            $rtObj['similar_articles'] = $item->similar_articles;
//
//        //返回文章报表
//        $artRes = ArticleTags::where('article_uuid',$item->uuid)
//                            ->where('company_uuid',$companyUuid)
//                            ->where('tag','report')
//                            ->get();
//        if(count($artRes)>0) {
//            $rptIds = array();
//            foreach ($artRes as $row) {
//                array_push($rptIds, $row->value);
//            }
//
//            $rptRows = Report::where('company_uuid',$companyUuid)
//                            ->whereIn('id',$rptIds)
//                            ->get();
//            $rptAry = array();
//            foreach ($rptRows as $row) {
//                $rptObj['id'] = $row->id;
//                $rptObj['title'] = $row->title;
//                $rptObj['title_at'] = $row->title_at;
//                array_push($rptAry,$rptObj);
//            }
//            $rtObj['reports'] = $rptAry;
//        }
//
//        $catIds = array();
//        $evtIds = array();      //事件id数组
//        $keys = array();
//        foreach ($rtTags as $tag) {
//            switch ($tag) {
//                case strstr($tag, '_cat_'):
//                    array_push($catIds, substr($tag, 5));
//                    break;
//                case strstr($tag, '_emo_'):
//                    $rtObj['emotion'] = substr($tag, 5);
//                    break;
//                case strstr($tag, '_warn_'):
//                    $rtObj['warn'] = substr($tag, 6);
//                    break;
//                case strstr($tag, '_evt_'):
//                    array_push($evtIds,substr($tag,5));
//                    break;
//                case strstr($tag, '_key_'):
//                    array_push($keys,substr($tag,5));
//                    break;
//                case strstr($tag, '_def_not_me'):
//                    $rtObj['dependent'] = false;
//                    break;
//            }
//        }
//
//        //事件标签
//        if(count($evtIds) > 0){
//            $evtNames = array();
//            $rows = Event::whereIn('id',$evtIds)->get();
//
//            foreach($rows as $row){
//                $evtObj['id'] = $row->id;
//                $evtObj['title'] = $row->title;
//                array_push($evtNames,$evtObj);
//            }
//
//            $rtObj['events'] = $evtNames;
//        }
//        //命中关键字
//        if(count($keys) > 0){
//            $rtObj['keys'] = $keys;
//        }
//
//        return $rtObj;
//    }
    /**
     * 将多篇文章加入到某报表、从某报表中取消
     * @return true
     */
    public function putReport()
    {
        $companyUuid = Api::getCompanyId();
        $uuids = Input::get('uuids');


        $reportId = Input::get('report');
        $action = Input::get('action');

        foreach($uuids as $artId){
            if($action == 'add') {
                ArticleTags::create(array(
                    'company_uuid' => $companyUuid,
                    'article_uuid' => $artId,
                    'tag' => 'report',
                    'value' => $reportId,
                    'create_at' => Carbon::now()
                ));
            }else{
                ArticleTags::where('company_uuid',$companyUuid)
                        ->where('article_uuid',$artId)
                        ->where('tag','report')
                        ->where('value',$reportId)
                        ->delete();
            }
        }

        return response()->json(
            ['result'=>true]
        );
    }

    //将一篇文章加入到多报表中、或从多个报表中取消
    public function reports()
    {
        $companyUuid = Api::getCompanyId();
        $articleUuid = Input::get('uuid');
        $reportIds = Input::get('reports');
        $action = Input::get('action');

        foreach($reportIds as $rptId){
            if($action == 'add') {
                ArticleTags::create(array(
                    'company_uuid' => $companyUuid,
                    'article_uuid' => $articleUuid,
                    'tag' => 'report',
                    'value' => $rptId,
                    'create_at' => Carbon::now()
                ));
            }else{
                    ArticleTags::where('company_uuid',$companyUuid)
                        ->where('article_uuid',$articleUuid)
                        ->where('tag','report')
                        ->where('value',$rptId)
                        ->delete();
            }
        }

        return response()->json(
            ['result'=>true]
        );

    }

    //修改文章的情感面
    public function putEmotion()
    {
        $uuids = Input::get('uuids');
        $titleSign = Input::get('title_sign');
        $emotion = Input::get('emotion');
        $cpIndex = Api::getCompanyIndex();
        $creator = Api::getCreatorId();
        $companyUuid = Api::getCompanyId();
        Redis::set(config('const.redis_pr.emo').$titleSign,true);
        Redis::expire(config('const.redis_pr.emo').$titleSign,120);
        foreach($uuids as $uuid){
            $postData = array(
                'http_errors' => true,
                'json'=>[
                    "script" => [
                        'inline' => 'ctx._source.result_tags -= tag1;ctx._source.result_tags -= tag2;ctx._source.result_tags += tag3;ctx._source.result_tags += tag4;',
                        "params"=>[
                            "tag1" => ["_emo_positive", "_emo_negative", "_emo_neutral"],
//                            "tag2" => ["_emo_manual_positive", "_emo_manual_negative", "_emo_manual_neutral"],
                            "tag2" => "_emo_manual",
                            "tag3" => '_emo_'.$emotion,
                            "tag4" => '_emo_manual'
                        ]
                    ]
                ]
            );


//            Spread::saveEsLog('info','update',$postData);
//            Log::info('user '.$creator.' update article '.$uuid.' emotion to '.$emotion);
            //调用es接口
            $response = Api::execEsApi('POST',$cpIndex.'/article/'.$uuid.'/_update?pretty -d',$postData);
            //$response = $client->request('POST',$cpIndex.'/article/'.$uuid.'/?pretty -d',$postData);

            $gtData = array(
                'http_errors' => false,
                'form_params' =>[
                        'simhash' => $titleSign,
                        'emo_tags' => '_emo_'.$emotion
                ],
            );

            $resp = Api::execGroutApi('POST','emotags/'.$companyUuid,$gtData);
        }

        Log::info('修改文章的情感面。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [articleId:'.implode(',',$uuids).'] [emotion:'.$emotion.'] ');

//        $srhData = json_decode($response->getBody());
//        return response()->json($srhData);
        return response()->json(
            ['result'=>true]
        );
    }

    //将文章置为预警
    public function warn()
    {
        $uuids = Input::get('uuids');
        $cpIndex = Api::getCompanyIndex();

        foreach($uuids as $uuid){
            $postData = array(
                'http_errors' => true,
                'json'=>[
                    "script" => [
                        'inline' => 'ctx._source.result_tags -= tag1;ctx._source.result_tags += tag2;',
                        "params"=>[
                            "tag1" => "_warn_",
                            "tag2" => "_warn_manual"
                        ]
                    ]
                ]
            );


            //调用es接口
            $response = Api::execEsApi('POST',$cpIndex.'/article/'.$uuid.'/_update?pretty -d',$postData);
        }

        Log::info('将文章置为预警。[companyUuid:'.Api::getCompanyId().'] [uuid:'.Api::getCreatorId().'] [articleId:'.implode(',',$uuids).']');

        return response()->json(
            ['result'=>true]
        );
    }

    //将文章取消预警
    public function noWarn()
    {
        $uuids = Input::get('uuids');
        $cpIndex = Api::getCompanyIndex();

        foreach($uuids as $uuid){
            $postData = array(
                'http_errors' => true,
                'json'=>[
                    "script" => [
                        'inline' => 'ctx._source.result_tags -= tag1;',
                        "params"=>[
                            "tag1" => ["_warn_", "_warn_manual"]
                        ]
                    ]
                ]
            );

            //调用es接口
            $response = Api::execEsApi('POST',$cpIndex.'/article/'.$uuid.'/_update?pretty -d',$postData);
        }

        Log::info('将文章取消预警。[companyUuid:'.Api::getCompanyId().'] [uuid:'.Api::getCreatorId().'] [articleId:'.implode(',',$uuids).']');

        return response()->json(
            ['result'=>true]
        );

    }

    //将文章置为与我无关
    public function putDepend()
    {
        $uuids = Input::get('uuids');
        $titleSign = Input::get('title_sign');
        $cpIndex = Api::getCompanyIndex();
        $companyUuid = Api::getCompanyId();

        Redis::set(config('const.redis_pr.del_art').$titleSign,true);
        Redis::expire(config('const.redis_pr.del_art').$titleSign,120);

        foreach($uuids as $uuid){
            //调用es接口
            $response = Api::execEsApi('DELETE',$cpIndex.'/article/'.$uuid.'/?pretty -d');
        }

        $gtData = array(
            'http_errors' => false,
            'form_params' =>[
                'simhash' => $titleSign
            ],
        );

        $resp = Api::execGroutApi('POST','delcompanyart/'.$companyUuid,$gtData);

        Log::info('将文章置为与我无关。[companyUuid:'.Api::getCompanyId().'] [uuid:'.Api::getCreatorId().'] [articleId:'.implode(',',$uuids).'] [titleSign:'.$titleSign.']');

        return response()->json(
            ['result'=>true]
        );
    }

    //将多篇文章加入到某一事件、或从某一事件中取消
    public function putEvent()
    {
        $errMsg = config('const.errMsg');
        $articles = Input::get('articles');
        if(count($articles) > 5){
            return response()->json(
                [
                    'result'=>false,
                    'msg' => $errMsg['overcount']
                ]
            );
        }

        $companyUuid = Api::getCompanyId();
        $cpIndex = Api::getCompanyIndex();
        $event = Input::get('event');
        $action = Input::get('action');

        $hbData = array();
        foreach($articles as $art){
            $artId = $art['uuid'];
            if(isset($art['title_sign'])) {
                $title_sign = $art['title_sign'];
                $tgObj['key'] = $title_sign;
                $tgObj['type'] = 'ref_event';
                $tgObj['tag'] = '_evt_' . $event;
                array_push($hbData, $tgObj);
            }

            if($action == 'add') {
                $postData = array(
                    'http_errors' => true,
                    'json'=>[
                        "script" => [
                            'inline' => 'ctx._source.result_tags -= tag1;ctx._source.result_tags += tag1;',
                            "params"=>[
                                "tag1" => '_evt_'.$event
                            ]
                        ]
                    ]
                );

                //调用es接口
                $response = Api::execEsApi('POST',$cpIndex.'/article/'.$artId.'/_update?pretty -d',$postData);
            }else{
                $postData = array(
                    'http_errors' => true,
                    'json'=>[
                        "script" => [
                            'inline' => 'ctx._source.result_tags -= tag1;',
                            "params"=>[
                                "tag1" => '_evt_'.$event
                            ]
                        ]
                    ]
                );
            }
        }

        if(count($hbData)) {
            if ($action == 'add') {
                $this->eventGrout($hbData, 'post');
            } else {
                $this->eventGrout($hbData, 'put');
            }
        }

        if ($action == 'add') {
            Log::info('将多篇文章加入到某一事件。[companyUuid:' . Api::getCompanyId() . '] [uuid:' . Api::getCreatorId() . '] [articleId:' . implode(',', $articles) . '] [eventId:' . $event . ']');
        }else{
            Log::info('将多篇文章从某一事件删除。[companyUuid:' . Api::getCompanyId() . '] [uuid:' . Api::getCreatorId() . '] [articleId:' . implode(',', $articles) . '] [eventId:' . $event . ']');
        }

        return response()->json(
            ['result'=>true]
        );
    }

    //将一篇文章加入到多个事件、或从多个事件中取消
    public function events()
    {
        $companyUuid = Api::getCompanyId();
        $cpIndex = Api::getCompanyIndex();
        $uuid = Input::get('uuid');
        $title_sign = Input::get('title_sign');
        $events = Input::get('events');
        $action = Input::get('action');
        $evtTags = array();

        $hbData = array();
        foreach($events as $evt){
            array_push($evtTags,'_evt_'.$evt);
            if(isset($title_sign)) {
                $tgObj['key'] = $title_sign;
                $tgObj['type'] = 'ref_event';
                $tgObj['tag'] = '_evt_' . $evt;
                array_push($hbData, $tgObj);
            }
        }



        if($action == 'add') {
            $postData = array(
                'http_errors' => true,
                'json' => [
                    "script" => [
                        'inline' => 'ctx._source.result_tags -= tag1;ctx._source.result_tags += tag1;',
                        "params" => [
                            "tag1" => $evtTags
                        ]
                    ]
                ]
            );

            $this->eventGrout($hbData,'post');
        }else{
            $postData = array(
                'http_errors' => true,
                'json' => [
                    "script" => [
                        'inline' => 'ctx._source.result_tags -= tag1;',
                        "params" => [
                            "tag1" => $evtTags
                        ]
                    ]
                ]
            );

            $this->eventGrout($hbData,'put');
        }

        //调用es接口
        $response = Api::execEsApi('POST',$cpIndex.'/article/'.$uuid.'/_update?pretty -d',$postData);

        if ($action == 'add') {
            Log::info('将一篇文章加入到多个事件。[companyUuid:' . Api::getCompanyId() . '] [uuid:' . Api::getCreatorId() . '] [articleId:' . $uuid . '] [title_sign:' . $title_sign . '] [eventId:' . implode(',',$events) . ']');
        }else{
            Log::info('将多篇文章从某一事件删除。[companyUuid:' . Api::getCompanyId() . '] [uuid:' . Api::getCreatorId() . '] [articleId:' . $uuid . '] [title_sign:' . $title_sign . '] [eventId:' . implode(',',$events) . ']');
        }


        return response()->json(
            ['result'=>true]
        );
    }

    public function eventGrout($data,$method)
    {
        $companyUuid = Api::getCompanyId();

        $postData = array(
            'http_errors' => false,
            'form_params' =>[
                'data'=> json_encode($data)
            ],
        );
        $response = Api::execGroutApi($method,'company/'.$companyUuid.'/tag_rules',$postData);
        return $response;
    }

    public function warnArticle()
    {
        return response()->json(
            ['count'=> 100]
        );
    }

    public function getArtCnt($res,$cnt){
        switch($res->name){
            case 'article_positive_cnt':
                $cnt['positive'] = isset($cnt['positive']) ? $cnt['positive']+$res->value : $res->value;
                break;
            case 'article_negative_cnt':
                $cnt['negative'] = isset($cnt['negative']) ? $cnt['negative']+$res->value : $res->value;
                break;
            case 'article_neutral_cnt':
                $cnt['neutral'] = isset($cnt['neutral']) ? $cnt['neutral']+$res->value : $res->value;
                break;
            case 'article_warn_cnt':
                $cnt['warn'] = isset($cnt['warn']) ? $cnt['warn']+$res->value : $res->value;
                break;
        }

        return $cnt;
    }

//    //概览页面，文章列表
//    public function articleList()
//    {
//        $companyUuid = Api::getCompanyId();
//        $companyIndex = Api::getCompanyIndex();
//        $returns = array();
//
//        $today = Carbon::now()->format('Y-m-d');
//        $yesterday = Carbon::now()->subDay(1)->format('Y-m-d');
//        $lastWeek = Carbon::now()->subDay(6)->format('Y-m-d');
//        $lastMonth = Carbon::now()->subDay(30)->format('Y-m-d');
//        $tdBeg = Carbon::now()->startOfDay();
//        $tdEnd = Carbon::now()->endOfDay();
//
//        //获取近30天
//        $rptRes = StatisDay::where('type',5)
//                        ->where('st_id',$companyIndex)
//                        ->where('record_at','<=',$today)
//                        ->where('record_at','>',$lastMonth)
//                        ->get();
//
//        $td = array();
//        $yd = array();
//        $wk = array();
//        $mn = array();
//        foreach($rptRes as $res){
////            if($res->record_at == $today){
////                $td = $this->getArtCnt($res,$td);
////            }
//            if($res->record_at == $yesterday){
//                $yd = $this->getArtCnt($res,$yd);
//            }
//
//            if($res->record_at <= $today && $res->record_at > $lastWeek)
//            {
//                $wk = $this->getArtCnt($res,$wk);
//            }
//
//            if($res->record_at <= $today && $res->record_at > $lastMonth)
//            {
//                $mn = $this->getArtCnt($res,$mn);
//            }
//        }
//
//
//            $tdRow = StatisMin::where('company_uuid',$companyIndex)
//                            ->where('create_at','<=',$tdEnd)
//                            ->where('create_at','>',$tdBeg)
//                            ->orderBy('id','desc')
//                            ->first();
//
//            $td['positive'] = $tdRow ? $tdRow->positive_cnt : 0;
//            $td['negative'] = $tdRow ? $tdRow->negative_cnt : 0;
//            $td['neutral'] = $tdRow ? $tdRow->neutral_cnt : 0;
//            $td['warn'] = $tdRow ? $tdRow->warn_cnt : 0;
//
//            $wk['positive'] = isset($wk['positive']) ? $wk['positive']+$td['positive'] : $td['positive'];
//            $wk['negative'] = isset($wk['negative']) ? $wk['negative']+$td['negative'] : $td['negative'];
//            $wk['neutral'] = isset($wk['neutral']) ? $wk['neutral']+$td['neutral'] : $td['neutral'];
//            $wk['warn'] = isset($wk['warn']) ? $wk['warn']+$td['warn'] : $td['warn'];
//
//            $mn['positive'] = isset($mn['positive']) ? $mn['positive']+$td['positive'] : $td['positive'];
//            $mn['negative'] = isset($mn['negative']) ? $mn['negative']+$td['negative'] : $td['negative'];
//            $mn['neutral'] = isset($mn['neutral']) ? $mn['neutral']+$td['neutral'] : $td['neutral'];
//            $mn['warn'] = isset($mn['warn']) ? $mn['warn']+$td['warn'] : $td['warn'];
//
////            $td = $this->getArtCnt($res,$td);
//
//        return response()->json([
//                'today'=>$td,
//                'yesterday'=>$yd,
//                'sevenDay' => $wk,
//                'thirtyDay' => $mn,
//            ]);
//    }
//
//
//
//
//    //最新文章 近7天
//    public function articlesLatest()
//    {
//        $cpIndex = Api::getCompanyIndex();
//        $url  = $cpIndex.'/article/_search/?pretty -d';
//
//        $days = date('Y-m-d H:i:s',(time()-7*24*3600));   //7天前日期
//        $postData = array(
//            'http_errors' => true,
//            'json'=>[
//                "query" => [
//                    "range" => [
//                        "crawler_at" => ["gte" => $days]
//                    ]
//                ],
//                "sort"=> [
//                    ["_score" => "desc"],
//                    ["crawler_at"=>"desc"],
//                ],
//                "min_score" => 0.05,
//                "from"=> 0,
//                "size"=> 7
//            ]
//        );
//
//        $response = Api::execEsApi('GET',$url,$postData);
//        $emotion = config('const.emotion');
//        $returns = array();
//        if(isset($response->hits->hits)) {
//            foreach($response->hits->hits as $art){
//                $artObj = Api::formatArticle($art);
//
//                array_push($returns,$artObj);
//            }
//        }
//
//        return response()->json($returns);
//    }


    public function articleCharts()
    {
        $companyUuid = Api::getCompanyId();
        $range = Input::get('time');
        $mid = Input::get('mid');
        $cpIndex = Api::getCompanyIndex();
        $url  = $cpIndex.'/article/_count/?pretty -d';

        $now = Carbon::now();
        $bef24 = Carbon::now()->subHour(24);
        $today = Carbon::now()->format('Y-m-d');
        $yesterday = Carbon::now()->subDay(1)->format('Y-m-d');

        $returnAry = array();
        $count = 0;
        if($range == 'today'){
            $dayRows = StatisMin::where('company_uuid',$cpIndex)
                                ->where('create_at','>',$bef24)
                                ->where('create_at','<',$now)
                                ->orderBy('id','asc')
                                ->get();

            $midCnt = config('const.medias_count');
            $lastVal = 0;
            $lastDate = "";
            $start = true;
            foreach($dayRows as $row){
                if($start){
                    $lastVal = $row[$midCnt[$mid]];
                    $lastDate = substr($row->create_at,0,10);
                    $start = false;
                }else{
                    $curDate = substr($row->create_at,0,10);
                    $rObj['date'] = $row->create_at;
                    $rObj['value'] = $curDate > $lastDate ? $row[$midCnt[$mid]] : $row[$midCnt[$mid]] - $lastVal;
//                    $rObj['value'] = $row[$midCnt[$mid]] - $lastVal;
                    array_push($returnAry,$rObj);
                    $lastVal = $row[$midCnt[$mid]];
                    $lastDate = substr($row->create_at,0,10);
                }
            }

            //数据处理，统计每半小时数据
            $returnAryHandle = array();
            $day = $bef24->format('Y-m-d');
            $hour = $bef24->hour;
            $minute = $bef24->minute < 30 ? '00' : '30';
            $second = '00';
            $lastHalfTime = $day.' '.$hour.':'.$minute.':'.$second;
            $begHalfTime = $lastHalfTime;
            for($i=1;$i<=48;$i++){
                $addMinute = $i*30;
                $halfTime = Carbon::parse($begHalfTime)->addMinute($addMinute)->toDateTimeString();
                $valueCount = 0;
                foreach ($returnAry as $value){
                    if( strtotime($value['date']) > strtotime($lastHalfTime) && strtotime($value['date']) <= strtotime($halfTime) ){
                        $valueCount += $value['value'];
                    }
                }
                $halfTimeData['date'] = $halfTime;
                $halfTimeData['value'] = $valueCount;
                array_push($returnAryHandle,$halfTimeData);

                $lastHalfTime = $halfTime;
            }

            return response()->json(
                $returnAryHandle
            );
        }else if($range == 'last_week'){
            $lastWeek = Carbon::now()->subDay(7)->format('Y-m-d');
            //获取近7天数据
            $rptRes = StatisDay::where('type',5)
                ->where('st_id',$cpIndex)
                ->where('name',$mid.'_cnt')
                ->where('record_at','<=',$today)
                ->where('record_at','>',$lastWeek)
                ->get();

            $rpts = array();
            foreach($rptRes as $res){
                if($res->name == $mid.'_cnt') {
                    $rpts[$res->record_at] = $res->value;
                    $rObj['date'] = $res->record_at;
                    $rObj['value'] = $res->value;
                    if(!Api::deep_in_array($rObj['date'],$returnAry)){
                        array_push($returnAry,$rObj);
                    }
                }
            }

            $lastWeekDate = Carbon::now()->subDay(7)->endOfDay();
            for($date = $now->endOfDay(); $date->gt($lastWeekDate); $date->subDay()) {
                $dt = $date->format('Y-m-d');
                if(!isset($rpts[$dt])){
                    $rObj['date'] = $dt;
                    $rObj['value'] = 0;
                    array_push($returnAry,$rObj);
                }
            }

        }else if($range == 'last_month'){
            $lastMonth = Carbon::now()->subDay(30)->format('Y-m-d');
            //获取近30天数据
            $rptRes = StatisDay::where('type',5)
                ->where('st_id',$cpIndex)
                ->where('name',$mid.'_cnt')
                ->where('record_at','<=',$today)
                ->where('record_at','>',$lastMonth)
                ->get();

            $rpts = array();
            foreach($rptRes as $res){
                if($res->name == $mid.'_cnt') {
                    $rpts[$res->record_at] = $res->value;
                    $rObj['date'] = $res->record_at;
                    $rObj['value'] = $res->value;
                    if(!Api::deep_in_array($rObj['date'],$returnAry)){
                        array_push($returnAry,$rObj);
                    }
                }

            }

            $lastMonthDate = Carbon::now()->subDay(30)->endOfDay();
            for($date = $now->endOfDay(); $date->gt($lastMonthDate); $date->subDay()) {
                $dt = $date->format('Y-m-d');
                if(!isset($rpts[$dt])){
                    $rObj['date'] = $dt;
                    $rObj['value'] = 0;
                    array_push($returnAry,$rObj);
                }
            }
        }else{
            $timeBeg = Carbon::createFromFormat('Y-m-d',$range)->startOfDay();
            $timeEnd = Carbon::createFromFormat('Y-m-d',$range)->endOfDay();

            $dayRows = StatisMin::where('company_uuid',$cpIndex)
                ->where('create_at','>',$timeBeg)
                ->where('create_at','<',$timeEnd)
                ->get();

            $midCnt = config('const.medias_count');
            foreach($dayRows as $row){
                $rObj['date'] = $row->create_at;
                $rObj['value'] = $row[$midCnt[$mid]];
                if(!Api::deep_in_array($rObj['date'],$returnAry)){
                    array_push($returnAry,$rObj);
                }
            }

        }

        return response()->json(
            $returnAry
        );
    }

    public function articleProductForm()
    {
        $from = Input::get('from');
        $to = Input::get('to');
        $halfhour = Input::get('halfhour');

        //判断格式
        if((!empty($from) && !preg_match("/^\d{4}-\d{2}-\d{2}$/s", $from)) || (!empty($to) && !preg_match("/^\d{4}-\d{2}-\d{2}$/s", $to))){
            return response()->json('日期格式不正确');
        }

        //日期范围
        $range = array();
        if(empty($from)) {  //近24小时
            $minute = Carbon::now()->minute < 30 ? '00' : '30';
            $halfTime = Carbon::now()->format('Y-m-d') . ' ' . Carbon::now()->hour . ':' . $minute . ':00';
            $lastHalfTime = Carbon::parse($halfTime)->subMinute(30)->toDateTimeString();
            $range[0] = array(
                'from' => $lastHalfTime,
                'to' => $halfTime,
            );
            for ($i = 1; $i < 48; $i++) {
                $range[] = array(
                    'from' => Carbon::parse($halfTime)->subMinute(30 * ($i + 1))->toDateTimeString(),
                    'to' => Carbon::parse($halfTime)->subMinute(30 * $i)->toDateTimeString()
                );
            }
        }else{
            if($halfhour == 'true'){    //统计每半个小时增量
                $dayStart = Carbon::createFromFormat('Y-m-d H:i:s', $from.' 00:00:00');
                if(empty($to)){
                    $minute = Carbon::now()->minute < 30 ? '00' : '30';
                    $nowHalfTime = Carbon::now()->format('Y-m-d') . ' ' . Carbon::now()->hour . ':' . $minute . ':00';
                    $dayEnd = Carbon::createFromFormat('Y-m-d H:i:s', $nowHalfTime);
                }else{
                    $dayEnd = Carbon::createFromFormat('Y-m-d H:i:s', $to.' 24:00:00');
                }
                $lastHalfHour = $dayStart->toDateTimeString();
                for ($date = $dayStart->addMinute(30); $date->lte($dayEnd); $date->addMinute(30)) {
                    $range[] = array(
                        'from' => $lastHalfHour,
                        'to' => $date->toDateTimeString()
                    );
                    $lastHalfHour = $date->toDateTimeString();
                }
            }else{
                $dayStart = Carbon::createFromFormat('Y-m-d', $from);
                if(!empty($to) && ( $to != Carbon::now()->format('Y-m-d') )){
                    $dayEnd = Carbon::createFromFormat('Y-m-d', $to);
                }else{
                    $range[0] = array(
                        'from' => Carbon::now()->startOfDay()->toDateTimeString(),
                        'to' => Carbon::now()->toDateTimeString(),
                    );
                    $dayEnd = Carbon::now()->subDay(1);
                }
                for ($date = $dayEnd; $date->gte($dayStart); $date->subDay()) {
                    $range[] = array(
                        'from' => $date->startOfDay()->toDateTimeString(),
                        'to' => $date->endOfDay()->toDateTimeString()
                    );
                }
            }
        }

        $params = [
            'index' => Api::getCompanyIndex(),
            'type'  => 'article',
            'size'  => 0,
            'body'  => [
                'query' => [
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getUpdateAt()
                        ]
                    ]
                ],
                'aggs' => [
                    'productFromCounts' => [
                        'terms' => [
                            'field' => 'from.product_form'
                        ],
                        'aggs' => [
                            'dayRange' => [
                                'date_range' => [
                                    'field' => 'publish_at',
                                    'ranges' => $range
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $es_data = Spread::searchEsData($params);

        $data=array();
        if (!empty($es_data['aggregations']['productFromCounts']['buckets'])) {
            foreach ($es_data['aggregations']['productFromCounts']['buckets'] as $pro) {
                if (!empty($pro['dayRange']['buckets'])) {
                    foreach ($pro['dayRange']['buckets'] as $key => $count){
                        if(empty($from) || $halfhour=='true') {
                            $data[$pro['key']][$key]['date'] = $count['to_as_string'];
                        }else{
                            $data[$pro['key']][$key]['date'] = substr($count['from_as_string'],0,10);
                        }
                        $data[$pro['key']][$key]['value'] = $count['doc_count'];
                    }
                }
            }
        }

        return response()->json($data);

    }

}
