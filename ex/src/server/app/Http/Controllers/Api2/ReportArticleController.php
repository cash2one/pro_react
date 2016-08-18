<?php

namespace App\Http\Controllers\Api2;

use App\Http\Spread;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Input;
use Elasticsearch\ClientBuilder;
use Carbon\Carbon;
use App\Http\Api;

use Exception;
use Elasticsearch\Common\Exceptions\ServerErrorResponseException;
use Illuminate\Support\Facades\Log;

class ReportArticleController extends Controller
{
    //报表分享页面获取查询的聚合信息
    public function getReportAgg($uniq_precision=40000){

        $code = Input::get('code');
        if(empty($code)){
            return response()->json(array(
                'result' => false
            ));
        }

        $userInfo = Api::getInfoByCode($code);
        $companyIndex = $userInfo['companyIndex'];
        $reportUuid = $userInfo['uuid'];

        $result = Input::get('result') ? Input::get('result') : 'all';
        $result_array = array('industry','product_form','platform','media','event','emotion','warn','production','medium','level');    //默认返回值
        if($result != 'all'){
            $result_array = explode(',',$result);
        }

        $body_params = self::reportHandleInputData($uniq_precision);

        $es_params['index'] = $companyIndex;
        $es_params['type'] = 'article';
        $es_params['size'] = 0;
        if (!empty($body_params['query_match'])) {
            $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
        }
        if (!empty($body_params['filter_and'])) {
            $es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];
        }
        if (!empty($body_params['aggs_result'])) {
            $es_params['body']['aggs'] = $body_params['aggs_result'];
        }

        $hosts = [config('app.esUrl')];
        $client = ClientBuilder::create()->setHosts($hosts)->build();

        try {
            $es_data = $client->search($es_params);
            //记录Es日志
            Spread::saveEsLog('info','search',$es_params);

        }catch (ServerErrorResponseException $e) {
            //记录Es日志
            Spread::saveEsLog('error','search',$es_params,$e);

            $uniq_precision = $uniq_precision/2;
            if($uniq_precision >= 2000){
                $result = $this->getAgg($uniq_precision);
                return $result;
            }else{
                throw $e;
            }
        }catch (Exception $e){
            //记录Es日志
            Spread::saveEsLog('error','search',$es_params,$e);
            //抛出异常
            throw $e;
        }

        $result_data['result'] = true;
        $result_data['data'] = self::reportArticleAggDataHandle($es_data,$result_array);

        //处理没有from.product_form字段的文章归入门户
        if(in_array('product_form',$result_array)){

            $product_es_params['index'] = $companyIndex;
            $product_es_params['type']  = 'article';
            if(!empty($body_params)){

                $product_filter_and = array(
                    'missing' => [
                        'field' => 'from.product_form'
                    ]
                );

                if (!empty($body_params['query_match'])) {
                    $product_es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
                }
                if (!empty($body_params['filter_and'])) {
                    $product_es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];

                    array_push($product_es_params['body']['query']['filtered']['filter']['and'],$product_filter_and);

                }else{
                    $product_es_params['body']['query']['filtered']['filter'] = $product_filter_and;
                }

            }else{
                $product_es_params['body']  = array(
                    'query' => [
                        'filtered' => [
                            'filter' => [
                                'and' => [
                                    array(
                                        'range' => [
                                            'crawler_at' => [
                                                'lte' => Api::getReportAt($reportUuid)
                                            ]
                                        ]
                                    ),
                                    array(
                                        'missing' => [
                                            'field' => 'from.product_form'
                                        ]
                                    )
                                ]
                            ]
                        ]
                    ]
                );
            }

            $product_es_data = Spread::searchEsData($product_es_params,'',1);
            $noProductArtCount = $product_es_data['count'];

            if($noProductArtCount > 0 ){
                if(isset($result_data['data']['product_form'])){
                    $menhu = false;
                    foreach ($result_data['data']['product_form'] as $key=>$value){
                        if($value['name'] == '门户'){
                            $result_data['data']['product_form'][$key]['count'] += $noProductArtCount;
                            $menhu = true;
                        }
                    }
                    if($menhu == false){
                        $menhu['name'] = '门户';
                        $menhu['count'] = $noProductArtCount;
                        array_push($result_data['data']['product_form'],$menhu);
                    }
                }
            }
        }

        //处理没有预警的文章
        $param_warn   = Input::get('warn');
        if(isset($result_data['data']['warn']) && $param_warn != 'all'){

            $warn_es_params = [
                'index' => $companyIndex,
                'type'  => 'article',
                'body'  => [
                    'query' => [
                        'filtered' => [
                            'filter' => [
                                'bool' => [
                                    'must_not' => [
                                        array(
                                            'term' => [
                                                'result_tags' => '_warn_'
                                            ]
                                        ),
                                        array(
                                            'term' => [
                                                'result_tags' => '_warn_manual'
                                            ]
                                        )
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ];

            $warn_must = array(
                array(
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getReportAt($reportUuid)
                        ]
                    ]
                )
            );
            if(!empty($body_params)){

                if (!empty($body_params['query_match'])) {
                    $warn_es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
                }
                if (!empty($body_params['filter_and'])) {
                    array_push($warn_must,$body_params['filter_and']);
                }

            }
            $warn_es_params['body']['query']['filtered']['filter']['bool']['must'] = $warn_must;

            $warn_es_data = Spread::searchEsData($warn_es_params,'',1);

            $no_warn_count = $warn_es_data['count'];
            if ($no_warn_count > 0) {
                $no_warn['name'] = '非预警';
                $no_warn['param'] = 'no';
                $no_warn['count'] = $no_warn_count;
                array_push($result_data['data']['warn'],$no_warn);
            }

        }

        return response()->json($result_data);

    }


    public static function reportHandleInputData($uniq_precision=2000){

        $app    = Input::get('app') ? Input::get('app') : 'text';   //搜索类型：news | goods | title | text
        $wd     = Input::get('wd');     //搜索关键词
        $ct     = Input::get('ct') ? Input::get('ct') : 1;  //语言 1：简体中文；2：繁体中文；3：其他
        $m      = Input::get('m') ? Input::get('m') : 20;   //结果数量
        $beg    = Input::get('beg') ? Input::get('beg') : 0;;  //起始数据
        $uniq   = Input::get('uniq') ? Input::get('uniq') : false;  //是否排重，针对字段title_sign
        $date   = Input::get('date') ? Input::get('date') : 'all';   //数据范围，all | today | yesterday | last_week | last_month | xxxx-xx-xx,yyyy-yy-yy 自定义时间段
        $spm    = Input::get('spm');    //文章id，最多5个
        $reship = Input::get('reship');     //文章转载数，指文章转载数是几的文章
        $emotion = Input::get('emotion') ? Input::get('emotion') : 'all';  //情感，all | positive | neutral | negative | manual_positive | manual_neutral | manual_negative
        $level  = Input::get('level') ? Input::get('level') : 'all';        //媒体等级，all | a | b | c | d
        $production = Input::get('production') ? Input::get('production') : 'all';   //production 生产方式，此参数对就article表中的create_way字段。all | ogc | ugc
        $medium = Input::get('medium') ? Input::get('medium') : '全部';   // 媒体分类
        $product = Input::get('product') ? Input::get('product') : '全部';   //产品分类
        $platform = Input::get('platform') ? Input::get('platform') : 'all';    // 托管平台
        $cat    = Input::get('cat');
        $med    = Input::get('med');    //媒体ID，最多5个,传多个值时，值之间是OR的关系
        $inc    = Input::get('inc');    //事件ID，最多5个,传多个值时，值之间是OR的关系
        $warn   = Input::get('warn') ? Input::get('warn') : 'ignore';  //预警状态，ignore | all | auto | manual | no
        $heat   = Input::get('heat');   //文章热度
        $result = Input::get('result') ? Input::get('result') : 'all';     //要获得哪几个聚类的值，可多个组合，industry | product_form | platform | media | event
        $sort   = Input::get('sort');   //排序

        $return = array();

        if(!empty($wd)){

            if( (substr($wd,0,1)=='"' || substr($wd,0,3)=='“') &&  (substr($wd,-1)=='"' || substr($wd,-3)=='”')){   //带双引号不分词
                $query_match['or'] = array(
                    array(
                        'match_phrase' => [
                            'link_title' => [
                                'query' => $wd
                            ]
                        ]
                    )
                );
                if($app == 'text'){
                    $content_match = array(
                        'match_phrase' => [
                            'content' => [
                                'query' => $wd
                            ]
                        ]
                    );
                    array_push($query_match['or'],$content_match);
                }
            }else{
                $match_fields = array('link_title');
                if($app == 'text'){
                    array_push($match_fields,'content');
                }
                $query_match = array(
                    'multi_match' => [
                        'query'  => $wd,
                        'fields' => $match_fields
                    ]
                );
            }

            $return['query_match'] = $query_match;
        }

//        if($uniq == 'true'){
//            $agg_uniq = array(
//                'uniq' => [
//                    'cardinality' => [
//                        'field' => 'title_sign',
//                        'precision_threshold' => $uniq_precision
//                    ]
//                ]
//            );
//
//            $return['agg_uniq'] = $agg_uniq;
//        }

        $code = Input::get('code');
        if(empty($code)){
            return response()->json(array(
                'result' => false
            ));
        }
        $userInfo = Api::getInfoByCode($code);
        $reportUuid = $userInfo['uuid'];

        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getReportAt($reportUuid)
                    ]
                ]
            )
        );

        //过滤掉已删除文章
        $del_title_sign = Spread::getRedisTitleSign(config('const.redis_pr.del_art'));
        if(!empty($del_title_sign)){
            $del_article = array(
                'bool' => [
                    'must_not' => [
                        'terms' => [
                            'title_sign' => $del_title_sign
                        ]
                    ]
                ]
            );
            array_push($filter_and,$del_article);
        }

        if($date != 'all'){
            $pos = strpos($date,',');
            if($pos){
                $date_array = explode(',',$date);
                $date_begin = $date_array[0].' 00:00:00';
                if(!empty($date_array[1]) && ( $date_array[1] != Carbon::now()->format('Y-m-d') )){
                    $date_end = $date_array[1] . ' 23:59:59';
                }else {
                    $date_end = Carbon::now()->toDateTimeString();
                }
                $d_range = ["from"=>$date_begin,"to"=>$date_end];
            }else{
                if($date == 'today'){
                    $date_begin = Carbon::now()->startOfDay()->toDateTimeString();
                    $date_end = Carbon::now()->toDateTimeString();
                    $d_range = ["from"=>$date_begin,"to"=>$date_end];
                }
                elseif($date == 'yesterday'){
                    $date_begin = Carbon::now()->subDay(1)->startOfDay()->toDateTimeString();
                    $date_end = Carbon::now()->subDay(1)->endOfDay()->toDateTimeString();
                    $d_range = ["from"=>$date_begin,"to"=>$date_end];
                }
                elseif($date == 'last_week'){
                    $date_begin = Carbon::now()->subDay(6)->startOfDay()->toDateTimeString();   //近7天
                    $date_end = Carbon::now()->toDateTimeString();
                    $d_range = ["from"=>$date_begin,"to"=>$date_end];
                }elseif($date == 'last_month'){
                    $date_begin = Carbon::now()->subDay(29)->startOfDay()->toDateTimeString();  //近30天
                    $date_end = Carbon::now()->toDateTimeString();
                    $d_range = ["from"=>$date_begin,"to"=>$date_end];
                }
            }

            if(isset($d_range)){
                $data_range = array(
                    'range' => [
                        'publish_at' => $d_range
                    ]
                );

                array_push($filter_and,$data_range);
            }

        }

        if(!empty($spm)){
            $spm_array = explode(',',$spm);
            $spm_terms = array(
                'terms' => [
                    'uuid' => $spm_array
                ],
            );
            array_push($filter_and,$spm_terms);
        }

        if($reship != ''){
            if($reship == 0){
                $reship_terms = array(
                    'or' => array(
                        array(
                            'term' => [
                                'reship' => $reship
                            ]
                        ),
                        array(
                            'missing' => [
                                'field' => 'reship'
                            ]
                        )
                    )
                );
            }else{
                $reship_terms = array(
                    'terms' => [
                        'reship' => $reship
                    ],
                );
            }
            array_push($filter_and,$reship_terms);
        }

        if($emotion != 'all'){
            $emotion_array = explode(',',$emotion);
            $emo_array = array();
            $emo_terms_or = array();
            foreach ($emotion_array as $emo){
                if(strstr($emo, 'manual')){
                    $emo_term = array(
                        'and' => [
                            array(
                                'term' => [
                                    'result_tags' => '_emo_'.substr($emo,7)
                                ]
                            ),
                            array(
                                'term' => [
                                    'result_tags' => '_emo_manual'
                                ]
                            )
                        ]
                        
                    );
                }else{
                    $emo_term = array(
                        'term' => [
                            'result_tags' => '_emo_'.$emo
                        ]
                    );
                }
                array_push($emo_terms_or,$emo_term);
            }
            $emo_terms = array(
                'or' => $emo_terms_or
            );
            array_push($filter_and,$emo_terms);
        }

        if($level != 'all'){
            $level_array = explode(',',$level);
            $level_range_array=array();
            foreach ($level_array as $lev){
                $level_terms=array();
                if($lev == 'a'){
                    $level_terms = array(
                        'range' => [
                            'from.influence' => ['gte' => 20000]
                        ]
                    );
                }elseif($lev == 'b'){
                    $level_terms = array(
                        'range' => [
                            'from.influence' => [
                                'gte' => 10000,
                                'lt' => 20000
                            ]
                        ]
                    );
                }elseif($lev == 'c'){
                    $level_terms = array(
                        'range' => [
                            'from.influence' => [
                                'gte' => 1000,
                                'lt' => 10000
                            ]
                        ]
                    );
                }elseif($lev == 'd'){
                    $level_terms = array(
                        'range' => [
                            'from.influence' => ['lt' => 1000]
                        ]
                    );
                }
                if(!empty($level_terms)){
                    array_push($level_range_array,$level_terms);
                }
            }


            if(!empty($level_range_array)){
                $level_or = array(
                    'or' => $level_range_array
                );
                array_push($filter_and,$level_or);
            }

        }

        if($production != 'all'){
            if($production == 'ogc'){
                $create_way = '职业媒体';
            }
            if($production == 'ugc'){
                $create_way = '自媒体';
            }
            if(isset($create_way)){
                $production_terms = array(
                    'term' => [
                        'from.create_way' => $create_way
                    ]
                );
                array_push($filter_and,$production_terms);
            }
        }

        if($medium != '全部'){
            $medium_array = explode(',',$medium);
            $medium_terms = array(
                'terms' => [
                    'from.circulation_medium' => $medium_array
                ]
            );
            array_push($filter_and,$medium_terms);
        }

        if($product != '全部'){
            $product_array = explode(',',$product);
            if(in_array('门户',$product_array)){
                $product_terms = array(
                    'or' => [
                        array(
                            'terms' => [
                                'from.product_form' => $product_array
                            ],
                        ),
                        array(
                            'missing' => [
                                'field' => 'from.product_form'
                            ]
                        )
                    ]

                );
            }else{
                $product_terms = array(
                    'terms' => [
                        'from.product_form' => $product_array
                    ]
                );
            }
            array_push($filter_and,$product_terms);
        }

        if($platform != 'all'){
            $platform_array = explode(',',$platform);
            $platform_terms = array(
                'terms' => [
                    'from.platform.name' => $platform_array
                ]
            );
            array_push($filter_and,$platform_terms);
        }

        if(!empty($med)){
            $med_array = explode(',',$med);
            $med_terms = array(
                'terms' => [
                    'from.mid' => $med_array
                ]
            );
            array_push($filter_and,$med_terms);
        }

        if(!empty($inc)){
            $event_array = explode(',',$inc);
            $inc_array = array();
            foreach ($event_array as $evt){
                array_push($inc_array,'_evt_'.$evt);
            }
            $inc_terms = array(
                'terms' => [
                    'result_tags' => $inc_array
                ]
            );
            array_push($filter_and,$inc_terms);
        }

        if($warn != 'ignore'){
            if($warn == 'all'){
                $warn_terms = array(
                    'or' => [
                        array(
                            'term' => [
                                'result_tags' => '_warn_'
                            ]
                        ),
                        array(
                            'term' => [
                                'result_tags' => '_warn_manual'
                            ]
                        )
                    ]
                );
            }else{
                $warn_array = explode(',',$warn);
                $warn_or_array = array();
                foreach ($warn_array as $warn){
                    if($warn == 'auto'){
                        $warn_or = array(
                            'term' => [
                                'result_tags' => '_warn_'
                            ]
                        );
                    }elseif($warn == 'manual'){
                        $warn_or = array(
                            'term' => [
                                'result_tags' => '_warn_manual'
                            ]
                        );
                    }elseif($warn == 'no'){
                        $warn_or = array(
                            'bool' => [
                                'must_not' => [
                                    array(
                                        'term' => [
                                            'result_tags' => '_warn_'
                                        ]
                                    ),
                                    array(
                                        'term' => [
                                            'result_tags' => '_warn_manual'
                                        ]
                                    )
                                ]
                            ]
                        );
                    }
                    if(isset($warn_or)){
                        array_push($warn_or_array,$warn_or);
                    }
                }

                if(!empty($warn_or_array)){
                    $warn_terms = array(
                        'or' => $warn_or_array
                    );
                }

            }

            if(isset($warn_terms)){
                array_push($filter_and,$warn_terms);
            }

        }

        if(!empty($filter_and)){
            $return['filter_and'] = $filter_and;
        }

        $result_array = array('industry','product_form','platform','media','event','emotion','warn','production','medium','level');    //默认返回值
        if($result != 'all'){
            $result_array = explode(',',$result);
        }

        $aggs_result = array();
        foreach ($result_array as $key => $value){

            if($key<5){    //最多5个聚合数据

                switch ($value){
                    case 'media':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'from.mid',
                            'size' => $m
                        );
                        break;
                    case 'event':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'result_tags',
                            'include' => '_evt_.*',
                            'size' => $m
                        );
                        break;
                    case 'platform':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'from.platform.name',
                            'size' => $m
                        );
                        break;
                    case 'emotion':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'result_tags',
                            'include' => '_emo_.*',
                            'size' => $m,
                            'order' => [
                                '_term' => 'desc'
                            ]
                        );
                        break;
                    case 'warn':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'result_tags',
                            'include' => '_warn_.*',
                            'size' => $m,
                            'order' => [
                                '_term' => 'asc'
                            ]
                        );
                        break;
                    case 'production':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'from.create_way',
                            'size' => $m
                        );
                        break;
                    case 'medium':
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'from.circulation_medium',
                            'size' => $m
                        );
                        break;
                    case 'level':
                        $level_range = array(
                            array(
                                'from' => 20000
                            ),
                            array(
                                'from' => 10000,
                                'to'   => 20000
                            ),
                            array(
                                'from' => 1000,
                                'to'   => 10000
                            ),
                            array(
                                'to' => 1000
                            ),
                        );
                        $aggs_result[$value]['range'] = array(
                            'field' => 'from.influence',
                            'ranges' => $level_range,
                        );
                        break;
                    default:
                        $aggs_result[$value]['terms'] = array(
                            'field' => 'from.'.$value,
                            'size' => $m
                        );
                }

                if(!empty($agg_uniq)){
                    $aggs_result[$value]['aggs'] = $agg_uniq;
                }
            }
        }

        if(!empty($aggs_result)){
            $return['aggs_result'] = $aggs_result;
        }

        return $return;

    }


    //处理文章聚合数据
    public static function reportArticleAggDataHandle($es_data,$result_array=array()){

        foreach ($result_array as $key=>$value){
            if($key<5) {    //最多5个聚合数据
                $retult[$value] = array();
            }
        }

        if(!empty($es_data['aggregations']['industry']['buckets'])){

        }

        if(!empty($es_data['aggregations']['product_form']['buckets'])){
            $product_form = array();
            foreach ($es_data['aggregations']['product_form']['buckets'] as $product){
                $res = array();
                $res['name'] = $product['key'];
                if(isset($product['uniq'])){
                    $res['count'] = $product['uniq']['value'];
                }else {
                    $res['count'] = $product['doc_count'];
                }
                array_push($product_form,$res);

            }
            $retult['product_form'] = $product_form;
        }

        if(!empty($es_data['aggregations']['platform']['buckets'])){
            $platform = array();
            foreach ($es_data['aggregations']['platform']['buckets'] as $plat){
                if(!empty(trim($plat['key']))) {
                    $res = array();
                    $res['name'] = $plat['key'];
                    if(isset($plat['uniq'])){
                        $res['count'] = $plat['uniq']['value'];
                    }else{
                        $res['count'] = $plat['doc_count'];
                    }
                    array_push($platform,$res);
                }

            }
            $retult['platform'] = $platform;
        }

        if(!empty($es_data['aggregations']['media']['buckets'])){
            $media = array();
            foreach ($es_data['aggregations']['media']['buckets'] as $med){
                $res = array();
                $media_info = Spread::getMediaInfo($med['key']);
                $res['name'] = !empty($media_info['name']) ? $media_info['name']:'';
                $res['mid'] = $med['key'];
                if(isset($med['uniq'])){
                    $res['count'] = $med['uniq']['value'];
                }else {
                    $res['count'] = $med['doc_count'];
                }
                array_push($media,$res);

            }
            $retult['media'] = $media;
        }

        if(!empty($es_data['aggregations']['event']['buckets'])){
            $event = array();
            foreach ($es_data['aggregations']['event']['buckets'] as $evt){
                $res = array();
                $event_id = substr($evt['key'],(strrpos($evt['key'],'_')+1));
                $res['name'] = Spread::getEventName($event_id);
                $res['id'] = $event_id;
                if(isset($evt['uniq'])){
                    $res['count'] = $evt['uniq']['value'];
                }else {
                    $res['count'] = $evt['doc_count'];
                }
                if(!empty($res['name'])){
                    array_push($event,$res);
                }
            }
            $retult['event'] = $event;
        }

        if(!empty($es_data['aggregations']['emotion']['buckets'])){
            $emotion = array();
            foreach ($es_data['aggregations']['emotion']['buckets'] as $emo){
                $res = array();
                if(isset($emo['uniq'])){
                    $count = $emo['uniq']['value'];
                }else {
                    $count = $emo['doc_count'];
                }
                if($emo['key'] == '_emo_negative'){
                    $res['name'] = '负面';
                    $res['param'] = 'negative';
                    $res['count'] = $count;
                }elseif($emo['key'] == '_emo_positive'){
                    $res['name'] = '正面';
                    $res['param'] = 'positive';
                    $res['count'] = $count;
                }
                elseif($emo['key'] == '_emo_neutral'){
                    $res['name'] = '中立';
                    $res['param'] = 'neutral';
                    $res['count'] = $count;
                }
                if(!empty($res)){
                    array_push($emotion,$res);
                }

//                //临时处理手动情感面相同文章统计
//                if(isset($emo['uniq'])) {
//                    if ($emo['key'] == '_emo_manual_negative') {
//                        $similar_count['negative'] = self::reportSimilarEmotionCount($emo['key']);
//                    } elseif ($emo['key'] == '_emo_manual_positive') {
//                        $similar_count['positive'] = self::reportSimilarEmotionCount($emo['key']);
//                    } elseif ($emo['key'] == '_emo_manual_neutral') {
//                        $similar_count['neutral'] = self::reportSimilarEmotionCount($emo['key']);
//                    }
//                }

            }

//            //临时处理手动情感面相同文章统计
//            if(!empty($similar_count)){
//                foreach ($emotion as $key=>$emo){
//                    if(isset($similar_count[$emo['param']])){
//                        $emotion[$key]['count'] += $similar_count[$emo['param']];
//                    }
//                }
//            }

            $retult['emotion'] = $emotion;

        }

        if(!empty($es_data['aggregations']['warn']['buckets'])){
            $warns = array();
            foreach ($es_data['aggregations']['warn']['buckets'] as $warn){
                $res = array();
                if($warn['key'] == '_warn_'){
                    $res['name'] = '自动预警';
                    $res['param'] = 'auto';
                }elseif($warn['key'] == '_warn_manual'){
                    $res['name'] = '手动预警';
                    $res['param'] = 'manual';
                }
                if(isset($warn['uniq'])){
                    $res['count'] = $warn['uniq']['value'];
                }else {
                    $res['count'] = $warn['doc_count'];
                }
                array_push($warns,$res);
            }
            $retult['warn'] = $warns;
        }

        if(!empty($es_data['aggregations']['production']['buckets'])){
            $production = array();
            foreach ($es_data['aggregations']['production']['buckets'] as $pro){
                $res = array();
                $res['name'] = $pro['key'];
                if($pro['key'] == '职业媒体'){
                    $res['param'] = 'ogc';
                }elseif($pro['key'] == '自媒体'){
                    $res['param'] = 'ugc';
                }
                if(isset($pro['uniq'])){
                    $res['count'] = $pro['uniq']['value'];
                }else {
                    $res['count'] = $pro['doc_count'];
                }

                array_push($production,$res);
            }
            $retult['production'] = $production;
        }

        if(!empty($es_data['aggregations']['medium']['buckets'])){
            $medium = array();
            foreach ($es_data['aggregations']['medium']['buckets'] as $med){
                $res = array();
                $res['name'] = $med['key'];
                if(isset($med['uniq'])){
                    $res['count'] = $med['uniq']['value'];
                }else {
                    $res['count'] = $med['doc_count'];
                }
                array_push($medium,$res);
            }
            $retult['medium'] = $medium;
        }

        if(!empty($es_data['aggregations']['level']['buckets'])){
            $med_level = array();
            foreach ($es_data['aggregations']['level']['buckets'] as $level){
                $res = array();
                if($level['key'] == '20000.0-*'){
                    $res['name'] = '甲';
                    $res['param'] = 'a';
                }elseif($level['key'] == '10000.0-20000.0'){
                    $res['name'] = '乙';
                    $res['param'] = 'b';
                }elseif($level['key'] == '1000.0-10000.0'){
                    $res['name'] = '丙';
                    $res['param'] = 'c';
                }else{
                    $res['name'] = '丁';
                    $res['param'] = 'd';
                }
                if(isset($level['uniq'])){
                    $res['count'] = $level['uniq']['value'];
                }else {
                    $res['count'] = $level['doc_count'];
                }
                if($res['count'] != 0){
                    array_push($med_level,$res);
                }
            }

            rsort($med_level);  //逆向排序
            $retult['level'] = $med_level;
        }

        return $retult;

    }

//    //统计相似文章数
//    public static function reportSimilarArcitleCount($title_signs){
//
//        $code = Input::get('code');
//        $userInfo = Api::getInfoByCode($code);
//        $companyIndex = $userInfo['companyIndex'];
//        $reportUuid = $userInfo['uuid'];
//
//        $es_params = [
//            'index' => $companyIndex,
//            'type'  => 'article',
//            'size'  => 0,
//            'body'  => [
//                'query' =>[
//                    'range' => [
//                        'crawler_at' => [
//                            'lte' => Api::getReportAt($reportUuid)
//                        ]
//                    ]
//                ],
//                'aggs' => [
//                    'similarCount' => [
//                        'terms' => [
//                            'field' => 'title_sign',
//                            'include' => $title_signs,
//                            'size'  => 0
//                        ]
//                    ]
//                ]
//            ]
//        ];
//
//        $es_data = Spread::searchEsData($es_params);
//        $data = array();
//        if(!empty($es_data['aggregations']['similarCount']['buckets'])){
//            foreach ($es_data['aggregations']['similarCount']['buckets'] as $title_sign){
//                $key = $title_sign['key'];
//                $data[$key] = $title_sign['doc_count']-1;
//            }
//        }
//
//        return $data;
//
//    }

//    //临时修复相似文章手动情感面统计
//    public static function reportSimilarEmotionCount($manualEmo){
//
//        $body_params = self::reportHandleInputData();
//
//        $code = Input::get('code');
//        if(empty($code)){
//            return response()->json(array(
//                'result' => false
//            ));
//        }
//        $userInfo = Api::getInfoByCode($code);
//        $companyIndex = $userInfo['companyIndex'];
//
//        $es_params['index'] = $companyIndex;
//        $es_params['type'] = 'article';
//        $es_params['size'] = 50;
//        $es_params['scroll'] = '30s';
//
//        $manualEmo_and = array(
//            'term' => [
//                'result_tags' => $manualEmo
//            ],
//        );
//        if (!empty($body_params['filter_and'])) {
//            array_push($body_params['filter_and'],$manualEmo_and);
//        }
//
//        if (!empty($body_params['query_match'])) {
//            $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
//        }
//        if (!empty($body_params['filter_and'])) {
//            $es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];
//        }else{
//            $es_params['body']['query']['filtered']['filter'] = $manualEmo_and;
//        }
//
//        $uniq_params = $es_params;
//        $uniq_params['size'] = 0;
//        $uniq_params['body']['aggs'] = array(
//            'uniq' => [
//                'terms' => [
//                    'field' => 'title_sign',
//                    'size'  => 0
//                ]
//            ]
//        );
//
//        $uniq_data = Spread::searchEsData($uniq_params);
//
//        $title_signs = $uniq_data['aggregations']['uniq']['buckets'];
//        $count = 0;
//        if(count($title_signs) > 0) {
//            foreach ($title_signs as $sign) {
//                if($sign['doc_count'] > 1){
//                    $count += $sign['doc_count']-1;
//                }
//            }
//        }
//
//        return $count;
//
//    }



}
