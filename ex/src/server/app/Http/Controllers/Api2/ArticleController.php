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

class ArticleController extends Controller
{
    //获取查询的聚合信息
    public function getAgg($uniq_precision=40000){

        $result = Input::get('result') ? Input::get('result') : 'all';
        $result_array = array('industry','product_form','platform','media','event','emotion','warn','production','medium','level');    //默认返回值
        if($result != 'all'){
            $result_array = explode(',',$result);
        }
        
        $body_params = self::handleInputData($uniq_precision);

        $es_params['index'] = Api::getCompanyIndex() ? Api::getCompanyIndex() : 'articles';
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
        $result_data['data'] = Spread::articleAggDataHandle($es_data,$result_array);
        
        //处理没有from.product_form字段的文章归入门户
        if(in_array('product_form',$result_array)){
            $noProductArtCount = Spread::noProductArtCount($body_params);
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

//        //处理没有情感面的文章，归为中立
//        if(isset($result_data['data']['emotion'])){
//            $no_emo_count = Spread::NoEmotionArticleCount($body_params);
//            if ($no_emo_count > 0) {
//                foreach ($result_data['data']['emotion'] as $key => $value){
//                    if($value['name'] == '中立'){
//                        $result_data['data']['emotion'][$key]['count'] += $no_emo_count;
//                    }
//                }
//            }
//
//        }

        //处理没有预警的文章
        $param_warn   = Input::get('warn');
        if(isset($result_data['data']['warn']) && $param_warn != 'all'){
            $no_warn_count = Spread::NoWarnArticleCount($body_params);
            if ($no_warn_count > 0) {
                $no_warn['name'] = '非预警';
                $no_warn['param'] = 'no';
                $no_warn['count'] = $no_warn_count;
                array_push($result_data['data']['warn'],$no_warn);
            }

        }

        return response()->json($result_data);
        
    }


    //获取查询数据的纪录个数
    public function getCount(){

        $uniq   = Input::get('uniq') ? Input::get('uniq') : false;  //是否排重，针对字段title_sign
        
        $body_params = self::handleInputData();

        $es_params['index'] = Api::getCompanyIndex() ? Api::getCompanyIndex() : 'articles';
        $es_params['type'] = 'article';
        if (!empty($body_params['query_match'])) {
            $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
        }
        if (!empty($body_params['filter_and'])) {
            $es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];
        }

        $hosts = [config('app.esUrl')];
        $client = ClientBuilder::create()->setHosts($hosts)->build();

        try {
            $data_count = $client->count($es_params);
            //var_dump($data_count);
            //记录Es日志
            Spread::saveEsLog('info','count',$es_params);

        }catch (Exception $e){
            //记录Es日志
            Spread::saveEsLog('error','count',$es_params,$e);
            //抛出异常
            throw $e;
        }

        $result_data['result'] = true;
        $result_data['count'] = $data_count['count'];

        //排重
        if ($uniq == 'true') {

            $es_params['body']['aggs'] = array(
                'uniq' => [
                    'terms' => [
                        'field' => 'title_sign',
                        'size'  => 0
                    ]
                ]
            );
            $es_params['size'] = 0;

            $data_uniq = Spread::searchEsData($es_params);
            $result_data['uniq_count'] = count($data_uniq['aggregations']['uniq']['buckets']);
            
        }

        return response()->json($result_data);

    }

    //获取查询的数据
    public function getData(){

        $wd     = Input::get('wd');
        $app    = Input::get('app') ? Input::get('app') : 'text';   //搜索类型：news | goods | title | text
        $m = Input::get('m') ? Input::get('m') : 20;   //结果数量
        $beg = Input::get('beg') ? Input::get('beg') : 0;  //起始数据
        $sort = Input::get('sort') ? Input::get('sort') : 'publish_at_desc';
        $uniq   = Input::get('uniq') ? Input::get('uniq') : false;  //是否排重，针对字段title_sign

        //数据大于99页返回空
        if(($beg/$m) > 99){
            $result_data['result'] = true;
            $result_data['data'] = array();
            return response()->json($result_data);
        }

        $sort_array = array();
        if(!empty($wd)){
            array_push($sort_array, '_score:desc');
        }
        if (!empty($sort)) {
            $sort_field = substr($sort, 0, strrpos($sort, '_'));
            $order = substr($sort, (strrpos($sort, '_') + 1));

            if ($sort_field == 'warn') {
                $sort_script = array(
                    '_script' => [
                        'script' => "'_warn_manual' in doc['result_tags'].values?1 :('_warn_' in doc['result_tags'].values? 2 :3)",
                        'type' => 'string',
                        'order' => $order
                    ]
                );
                array_push($sort_array, $sort_script);
            }elseif($sort_field == 'medium'){
                array_push($sort_array, 'from.media:' . $order);
            }elseif($sort_field != 'heat'){
                array_push($sort_array, $sort_field . ':' . $order);
            }
        }
        array_push($sort_array, 'crawler_at:desc');

        $body_params = self::handleInputData();

        $es_params['index'] = Api::getCompanyIndex();
        $es_params['type'] = 'article';
        $es_params['sort'] = $sort_array;
        $es_params['from'] = $beg;
        $es_params['size'] = $m;


        if (!empty($body_params['query_match'])) {
            $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
        }
        if (!empty($body_params['filter_and'])) {
            $es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];
        }
        if(!empty($wd)){
            //$search_fields = array();
            $search_fields = array('link_title');
            if($app == 'text'){
                array_push($search_fields,'content');
            }
            foreach ($search_fields as $field){
                $light_fields[$field] = (object)[
                    "pre_tags" => ['<em class="search">'],
                    "post_tags" => ['</em>']
                ];
            }

            $es_params['body']['highlight'] = array(
                'fields' => $light_fields
            );
        }

        $hosts = [config('app.esUrl')];
        $client = ClientBuilder::create()->setHosts($hosts)->build();

        //排重
        if ($uniq == 'true') {
            $uniq_sign = Spread::getSimilarTitleSign($es_params,$size=$beg+$m,$beg,$order);
            if(count($uniq_sign) > 0) {
                $uniq_and = array(
                    'terms' => [
                        'title_sign' => $uniq_sign
                    ],
                );
                if(!empty($es_params['body']['query']['filtered']['filter']['and'])){
                    array_push($es_params['body']['query']['filtered']['filter']['and'],$uniq_and);
                }else{
                    $es_params['body']['query']['filtered']['filter'] = $uniq_and;
                }
            }else{
                $result_data['result'] = true;
                $result_data['data'] = array();

                return response()->json($result_data);
            }

            unset($es_params['from']);
            $es_params['size'] = '50';
            $es_params['scroll'] = '30s';

        }

//        try {
//            $es_data = $client->search($es_params);
//            //记录Es日志
//            Spread::saveEsLog('info','search',$es_params);
//
//        }catch (Exception $e){
//            //记录Es日志
//            Spread::saveEsLog('error','search',$es_params,$e);
//            //抛出异常
//            throw $e;
//        }

        $es_data = Spread::searchEsData($es_params,true,false,true);

        $data = array();
        if (!empty($es_data)) {

            foreach ($es_data as $art) {
                if (!isset($art['_source']['link_title']))
                    continue;

                $rtObj = Api::formatArticle($art,true);
                $rtObj['content'] = strip_tags($rtObj['content']);  //清除html标签

                if(isset($art['highlight'])){
                    foreach ($search_fields as $field){
                        if(isset($art['highlight'][$field][0])){
                            $rtObj[$field] = strip_tags($art['highlight'][$field][0],'<em>');   //清除html标签 保留<em>标签
                            //$rtObj[$field] = $art['highlight'][$field][0];
                        }
                    }
                }

                //限制字数
                if(!empty($rtObj['link_title'])){
                    $title_em_count = substr_count($rtObj['link_title'],'</em>');
                    $title_limit_count = $title_em_count*24 + 25;
                    $rtObj['title'] = Api::msubstr($rtObj['link_title'],0,$title_limit_count);
                    $rtObj['title'] = Api::cleartags($rtObj['title']);  //清除未闭合标签
                }
                //限制字数
                if(!empty($rtObj['content'])){
                    $content_em_count = substr_count($rtObj['content'],'</em>');
                    $content_limit_count = $content_em_count*24 + 75;
                    $rtObj['content'] = Api::msubstr($rtObj['content'],0,$content_limit_count);
                    $rtObj['content'] = Api::cleartags($rtObj['content']);  //清除未闭合标签
                }

                array_push($data, $rtObj);
            }

        }

        //统计相似文章数
        if(!empty($data) && $uniq == 'true'){
            $title_signs_array = array();
            foreach ($data as $value){
                array_push($title_signs_array,$value['title_sign']);
            }
            if(!empty($title_signs_array)){
                $similar_count = Spread::similarArcitleCount($title_signs_array);
                foreach ($data as $key => $value){
                    if(isset($similar_count[$value['title_sign']])){
                        $data[$key]['similar_count'] = $similar_count[$value['title_sign']];
                    }else{
                        $data[$key]['similar_count'] = 0;
                    }
                }
            }

            //过滤重复文章
            $title_signs = array();
            $uniq_data = array();
            foreach ($data as $key => $value){
                if(!in_array($value['title_sign'],$title_signs)){
                    $uniq_data[] = $value;
                }
                array_push($title_signs,$value['title_sign']);
            }
            
            $data = $uniq_data;
        }

        $result_data['result'] = true;
        $result_data['data'] = $data;

        return response()->json($result_data);
            
    }

    public static function handleInputData($uniq_precision=2000){

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

        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
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

//        if($emotion != 'all'){
//            $emotion_array = explode(',',$emotion);
//            $emo_array = array();
//            foreach ($emotion_array as $emo){
//                array_push($emo_array,'_emo_'.$emo);
//            }
//            $emo_terms = array(
//                'terms' => [
//                    'result_tags' => $emo_array
//                ],
//            );
//            array_push($filter_and,$emo_terms);
//        }
        if($emotion != 'all'){
            $emotion_array = explode(',',$emotion);
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

//    //概览页面，获取公司文章情感，预警数量列表
//    public function getEmoWarnCount(){
//
//        $default_days = array('today','yesterday','7','30');    //默认返回今天、昨天、近7天、近30天数据
//        $days = Input::get('days') ? Input::get('days'): $default_days;
//        if(!is_array($days)){
//            $days = explode(',',$days);
//        }
//        foreach ($days as $day){
//            if($day == 'today'){
//                $from_day['today'] = Carbon::now()->startOfDay()->toDateTimeString();
//                $range[] = array(
//                    'from' => $from_day['today'],
//                    'to' => Carbon::now()->toDateTimeString()
//                );
//            }elseif($day == 'yesterday'){
//                $from_day['yesterday'] = Carbon::now()->subDay(1)->startOfDay()->toDateTimeString();
//                $range[] = array(
//                    'from' => $from_day['yesterday'],
//                    'to' => Carbon::now()->subDay(1)->endOfDay()->toDateTimeString()
//                );
//            }else{
//                if(strtotime($day)){
//                    $from_day[$day] = date('Y-m-d 00:00:00',strtotime($day));
//                    $range[] = array(
//                        'from' => $from_day[$day],
//                        'to' => date('Y-m-d 23:59:59',strtotime($day))
//                    );
//                }else{
//                    $from_day[$day] = Carbon::now()->subDay($day)->startOfDay()->toDateTimeString();
//                    $range[] = array(
//                        'from' => $from_day[$day],
//                        'to' => Carbon::now()->toDateTimeString()
//                    );
//                }
//            }
//        }
//
//        $params = [
//            'index' => Api::getCompanyIndex(),
//            'type'  => 'article',
//            'size'  => 0,
//            'body'  => [
//                'query' => [
//                    'range' => [
//                        'crawler_at' => [
//                            'lte' => Api::getUpdateAt()
//                        ]
//                    ]
//                ],
//                'aggs' => [
//                    'emotionCounts' => [
//                        'terms' => [
//                            'field' => 'result_tags',
//                            'include' => '_emo_.*'
//                        ],
//                        'aggs' => [
//                            'emoRange' => [
//                                'date_range' => [
//                                    'field' => 'publish_at',
//                                    'ranges' => $range
//                                ]
//                            ]
//                        ]
//                    ],
//                    'warnCounts' => [
//                        'terms' => [
//                            'field' => 'result_tags',
//                            'include' => '_warn_.*'
//                        ],
//                        'aggs' => [
//                            'warnRange' => [
//                                'date_range' => [
//                                    'field' => 'publish_at',
//                                    'ranges' => $range
//                                ]
//                            ]
//                        ]
//                    ]
//                ]
//            ]
//        ];
//
//        $es_data = Spread::searchEsData($params);
//
//        $data = array();
//        foreach ($days as $day){
//            $data[$day]['negative'] = 0;
//            $data[$day]['positive'] = 0;
//            $data[$day]['neutral'] = 0;
//            $data[$day]['warn'] = 0;
//        }
//        if (!empty($es_data['aggregations']['emotionCounts']['buckets'])) {
//            foreach ($es_data['aggregations']['emotionCounts']['buckets'] as $emo) {
//                if(!in_array($emo['key'],array('_emo_manual_negative','_emo_manual_positive','_emo_manual_neutral'))) {
//                    $emotion = substr($emo['key'], (strripos($emo['key'], '_') + 1));
//                    if (!empty($emo['emoRange']['buckets'])) {
//                        foreach ($emo['emoRange']['buckets'] as $emoRange) {
//                            if ($key = array_search($emoRange['from_as_string'], $from_day)) {
//                                $data[$key][$emotion] = $emoRange['doc_count'];
//                            }
//                        }
//                    }
//                }
//            }
//        }
//
//        if (!empty($es_data['aggregations']['warnCounts']['buckets'])) {
//            foreach ($es_data['aggregations']['warnCounts']['buckets'] as $warn) {
//                if (!empty($warn['warnRange']['buckets'])) {
//                    foreach ($warn['warnRange']['buckets'] as $warnRange){
//                        if($key = array_search($warnRange['from_as_string'],$from_day)){
//                            if(!isset($data[$key]['warn'])){
//                                $data[$key]['warn'] = 0;
//                            }
//                            $data[$key]['warn'] += $warnRange['doc_count'];
//                        }
//                    }
//                }
//            }
//        }
//
//        //处理没有情感面的文章，归为中立
//        $no_emo_params = [
//            'index' => Api::getCompanyIndex(),
//            'type'  => 'article',
//            'size'  => 0,
//            'body'  => [
//                'query' => [
//                    'filtered' => [
//                        'filter' => [
//                            'bool' => [
//                                'must_not' => [
//                                    array(
//                                        'term' => [
//                                            'result_tags' => '_emo_negative'
//                                        ]
//                                    ),
//                                    array(
//                                        'term' => [
//                                            'result_tags' => '_emo_positive'
//                                        ]
//                                    ),
//                                    array(
//                                        'term' => [
//                                            'result_tags' => '_emo_neutral'
//                                        ]
//                                    )
//                                ],
//                                'must' => [
//                                    'range' => [
//                                        'crawler_at' => [
//                                            'lte' => Api::getUpdateAt()
//                                        ]
//                                    ]
//                                ]
//                            ]
//                        ]
//                    ]
//                ],
//                'aggs' => [
//                    'virtualRange' => [
//                        'date_range' => [
//                            'field' => 'crawler_at',
//                            'ranges' => $range
//                        ]
//                    ]
//                ]
//            ]
//        ];
//
//        $no_emo_data = Spread::searchEsData($no_emo_params);
//        if (!empty($no_emo_data['aggregations']['virtualRange']['buckets'])) {
//            foreach ($no_emo_data['aggregations']['virtualRange']['buckets'] as $virtual) {
//                if($key = array_search($virtual['from_as_string'],$from_day)){
//                    $data[$key]['neutral'] += $virtual['doc_count'];
//                }
//            }
//        }
//
//        return response()->json($data);
//
//    }

    //人工审计
    public function getAuditData(){

        $beg    = Input::get('beg') ? Input::get('beg') : 0;;  //起始数据
        $m      = Input::get('m') ? Input::get('m') : 10;   //结果数量
        $date   = Input::get('date') ? Input::get('date') : 'all';   //数据范围，all | today | yesterday | last_week | last_month | xxxx-xx-xx,yyyy-yy-yy 自定义时间段
        $audit   = Input::get('audit') ? Input::get('audit') : false;  //是否研判
        $count   = Input::get('count') ? Input::get('count') : false;  //是否计数

        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Carbon::now()->subDay(1)->endOfDay()->toDateTimeString()
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
            if(strpos($date,',')){
                $date_array = explode(',',$date);
                $date_begin = $date_array[0].' 00:00:00';
                if(!empty($date_array[1]) && ( $date_array[1] != Carbon::now()->format('Y-m-d') )){
                    $date_end = $date_array[1] . ' 23:59:59';
                }else {
                    $date_end = Carbon::now()->subDay(1)->endOfDay()->toDateTimeString();
                }
                $d_range = ["from"=>$date_begin,"to"=>$date_end];
            }else{
                if($date == 'yesterday'){
                    $date_begin = Carbon::now()->subDay(1)->startOfDay()->toDateTimeString();
                    $d_range = ["from"=>$date_begin];
                }
                elseif($date == 'last_week'){
                    $date_begin = Carbon::yesterday()->subDay(6)->startOfDay()->toDateTimeString();   //近7天到昨天
                    $d_range = ["from"=>$date_begin];
                }elseif($date == 'last_month'){
                    $date_begin = Carbon::yesterday()->subDay(29)->startOfDay()->toDateTimeString();  //近30天到昨天
                    $d_range = ["from"=>$date_begin];
                }
            }

            if(isset($d_range)){
                $data_range = array(
                    'range' => [
                        'crawler_at' => $d_range
                    ]
                );
                array_push($filter_and,$data_range);
            }


        }

        if($audit == 'true'){
            $emo_terms = array(
                'term' => [
                    'result_tags' => '_emo_manual'
                ]
            );
        }else{
            $emo_terms = array(
                'bool' => [
                    'must_not' => [
                        array(
                            'term' => [
                                'result_tags' => '_emo_manual'
                            ]
                        )
                    ]
                ]
            );
            //过滤掉已研判文章
            $emo_title_sign = Spread::getRedisTitleSign(config('const.redis_pr.emo'));

            if(!empty($emo_title_sign)){
                $emo_article = array(
                    'terms' => [
                        'title_sign' => $emo_title_sign
                    ]
                );
                array_push($emo_terms['bool']['must_not'],$emo_article);
            }

        }

        array_push($filter_and,$emo_terms);

        //数据大于99页返回空
        if(($beg/$m) > 99){
            $result_data['result'] = true;
            $result_data['data'] = array();
            return response()->json($result_data);
        }

        $es_params['index'] = Api::getCompanyIndex();
        $es_params['type'] = 'article';
        
        $es_params['body']['query']['filtered']['filter']['and'] = $filter_and;

        if($count == 'true'){

            $data_uniq = Spread::searchEsData($es_params,false,true);

            $result_data['result'] = true;
            $result_data['count'] = $data_uniq['count'];

            $es_params['size'] = 0;
            $es_params['body']['aggs'] = array(
                'uniq' => [
                    'terms' => [
                        'field' => 'title_sign',
                        'size'  => 0
                    ]
                ]
            );

            $data_uniq = Spread::searchEsData($es_params);
            $result_data['uniq_count'] = count($data_uniq['aggregations']['uniq']['buckets']);

            return response()->json($result_data);

        }

        $es_params['sort'] = 'publish_at:desc';
        //$es_params['from'] = $beg;
        //$es_params['size'] = $m;
        $es_params['size'] = '50';
        $es_params['scroll'] = '30s';

        //获取相同文章title_sign
        $uniq_sign = Spread::getSimilarTitleSign($es_params,$size=$beg+$m,$beg);
        if(count($uniq_sign) == 0) {
            $result_data['result'] = true;
            $result_data['data'] = array();
            return response()->json($result_data);
        }

        $uniq_and = array(
            'terms' => [
                'title_sign' => $uniq_sign
            ],
        );

        array_push($es_params['body']['query']['filtered']['filter']['and'],$uniq_and);

        $es_data = Spread::searchEsData($es_params,true);

        $data = array();
        $uniq_data = array();
        if (!empty($es_data)) {

            foreach ($es_data as $art) {
                if (!isset($art['link_title']))
                    continue;

                $art['_source'] = $art;
                $rtObj = Api::formatArticle($art,true);
                $rtObj['content'] = strip_tags($rtObj['content']);  //清除html标签
                
                //限制字数
                if(!empty($rtObj['link_title'])){
                    $rtObj['title'] = Api::msubstr($rtObj['link_title'],0,25);
                }
                //限制字数
                if(!empty($rtObj['content'])){
                    $rtObj['content'] = Api::msubstr($rtObj['content'],0,75);
                }

                array_push($data, $rtObj);
            }

            //统计相似文章数
            $title_signs_array = array();
            foreach ($data as $value){
                array_push($title_signs_array,$value['title_sign']);
            }
            if(!empty($title_signs_array)){
                $similar_count = Spread::similarArcitleCount($title_signs_array);
                foreach ($data as $key => $value){
                    if(isset($similar_count[$value['title_sign']])){
                        $data[$key]['similar_count'] = $similar_count[$value['title_sign']];
                    }else{
                        $data[$key]['similar_count'] = 0;
                    }
                }
            }

            //过滤重复文章
            $title_signs = array();
            foreach ($data as $key => $value){
                if(!in_array($value['title_sign'],$title_signs)){
                    $uniq_data[] = $value;
                }
                array_push($title_signs,$value['title_sign']);
            }

        }

        $result_data['result'] = true;
        //$result_data['data'] = $data;
        $result_data['data'] = $uniq_data;

        return response()->json($result_data);

    }

    public function getSameData(){

        $title_sign = Input::get('title_sign');
        $beg = Input::get('beg') ? Input::get('beg') : 0;
        $m = Input::get('m') ? Input::get('m') : 20;
        $count = Input::get('count') ? Input::get('count') : false;

        $data = array();

        if(!empty($title_sign)){

            $es_params['index'] = Api::getCompanyIndex();
            $es_params['type'] = 'article';
            $es_params['body'] = array(
                "query" => [
                    "filtered" => [
                        'filter' => [
                            'term' => [
                                'title_sign' => $title_sign
                            ]
                        ]
                    ]
                ]
            );
            
            if($count=='true'){

                $es_count = Spread::searchEsData($es_params,false,true);
                $result['result'] = true;
                $result['count'] = $es_count['count'];

                return response()->json($result);
                
            }

            $es_params['from'] = $beg;
            $es_params['size'] = $m;
            $es_params['sort'] = 'publish_at:desc';

            $es_data = Spread::searchEsData($es_params,true);

            if (!empty($es_data)) {
                foreach ($es_data as $art) {
                    if (!isset($art['link_title']))
                        continue;
                    $art['_source'] = $art;
                    $rtObj = Api::formatArticle($art,true);
                    $rtObj['content'] = strip_tags($rtObj['content']);  //清除html标签

                    //限制字数
                    if(!empty($rtObj['link_title'])){
                        $rtObj['title'] = Api::msubstr($rtObj['link_title'],0,25);
                    }
                    //限制字数
                    if(!empty($rtObj['content'])){
                        $rtObj['content'] = Api::msubstr($rtObj['content'],0,75);
                    }

                    array_push($data, $rtObj);
                }
            }

        }

        $result['result'] = true;
        $result['data'] = $data;

        return response()->json($result);

    }

}
