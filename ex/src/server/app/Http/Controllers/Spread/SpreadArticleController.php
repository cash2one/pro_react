<?php

namespace App\Http\Controllers\Spread;

use App\Http\Api;
use App\Http\Mylog;
use App\Http\Spread;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redis;
use GuzzleHttp;
use Carbon\Carbon;

class SpreadArticleController extends Controller
{
    //获取公司转载次数最多的文章列表
    public function getReship(Request $request){


            $count = Input::get('count')?Input::get('count'):200;   //获取的文章个数，默认200

            $hosts = [config('app.esUrl')];

            $es_index = Api::getCompanyIndex();
            $es_type  = 'article';

            $params = [

                'index' => $es_index,
                'type'  => $es_type,
                'size'  => $count,
                "sort"  => ['reship:desc','crawler_at:desc','publish_at:desc'],
                'body'  => [
                    'query' => [
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
                                    'range' => [
                                        'reship' => ['gt'=> 0]
                                    ]
                                )
                            ]
                        ]
                    ]
                ]

            ];

            //过滤掉已删除文章
            $del_title_sign = Spread::getRedisTitleSign(config('const.redis_pr.del_art'));
            if(!empty($del_title_sign)){
                $params['body']['query']['bool']['must_not'] = array(
                    'terms' => [
                        'title_sign' => $del_title_sign
                    ]
                );
            }

            $articles = Spread::searchEsData($params);

            $data = array();
            if(isset($articles['hits']['hits'])) {

                foreach ($articles['hits']['hits'] as $art){

                    if (!isset($art['_source']['link_title']))
                        continue;

                    $rtObj = Api::formatArticle($art,true);
                    $rtObj['_id'] = $art['_id'];
                    array_push($data, $rtObj);

                }

            }

            return response()->json($data);

    }
    
    
    //获取某传播分析中的传播路径
    public function getRout(){

        $from       = Input::get('from');
        $company    = Input::get('company');
        $event      = Input::get('event');
        $article    = Input::get('article');
        
        if( ( !empty($company) && !empty($event) ) || ( !empty($company) && !empty($article) ) || ( !empty($event) && !empty($article) ) || ( empty($company) && empty($event) && empty($article) ) ){
            $data['result'] = false;
            $data['msg']    = '参数错误';
            return response()->json($data,406);
        }

        //第一次获取
        if(empty($from)){

            //获取公司文章列表，默认近一个月最多200
            if(!empty($company)){
                $data = Spread::getFirstArticles('company',$company);
                return response()->json($data);
            }

            if(!empty($event)){
                $data = Spread::getFirstArticles('event',$event);
                return response()->json($data);
            }

            if(!empty($article)){
                $from_uuid = $article;
                return '';
            }

        }else{
            if(is_array($from)){
                $from_uuid = $from;
            }else{
                $from_uuid = explode(',',$from);    //转换为数组
            }
        }

        $spread_uuid = !empty($company)?$company:(!empty($event)?$event:$article);  //统计对象

        //分割数组，每组不超过45条数据
        if(count($from_uuid) > 45){

            $from_uuid_array = Spread::arr_split($from_uuid,45);    //拆分数组

            $data=array();
            foreach ($from_uuid_array as $f_uuid){
                $es_data = Spread::getSpreadRoute($spread_uuid,$f_uuid);
                if(!empty($es_data)){
                    if(empty($data)){
                        $data = $es_data;
                    }else{
                        $data = array_merge($data,$es_data);    //合并数组
                    }
                }
            }

        }else{
            $data = Spread::getSpreadRoute($spread_uuid,$from_uuid);
        }

        return response()->json($data);

    }

    //获取传播对象的统计数据,
    public function getStatis($uuid){

        $usr = Api::getCreatorId();     //用户id

        $spread_uuid = $uuid.'_'.$usr;

        $data = array();
        $data['reships']         = intval(Redis::hget('spread.'.$spread_uuid.'.stat','reship'));        //转载数
        $data['articles']        = intval(Redis::hget('spread.'.$spread_uuid.'.stat','articles'));       //文章数
        $data['spread_length']   = intval(Redis::hget('spread.'.$spread_uuid.'.stat','spread_length'));  //累计转载时间
        $data['mids']            = intval(Redis::scard('spread.'.$spread_uuid.'.mids'));                 //媒体数

        if($data['mids'] == 0){
            $data['mid_reship_average']      = 0;           //媒体转发数平均值
            $data['mid_article_average']     = 0;           //媒体平均文章数
            $data['spread_time_average']     = 0;           //媒体转发数平均值
        }else{
            $data['mid_reship_average']      = round($data['reships']/$data['mids']);          //媒体转发数平均值
            $data['mid_article_average']     = round($data['articles']/$data['mids']);         //媒体平均文章数
            $data['spread_time_average']     = round($data['spread_length']/$data['mids']);    //媒体转发时间平均值
        }
        
        $data['mid_distributed'] = array();
        $mid_category = Redis::keys('spread.'.$spread_uuid.'.*.articles');
        foreach ($mid_category as $k=>$cat){

            $mid_cate = explode('.',$cat);
            $data['mid_distributed'][$k]['mid_cate'] = config('const.medias.' . '_cat_'.$mid_cate[2]);
            $data['mid_distributed'][$k]['articles'] = intval(Redis::get('spread.'.$spread_uuid.'.'.$mid_cate[2].'.articles'));

        }

        $data['level_distributed'] = array();
        for($i=1;$i<=4;$i++){       //当前最多4级
            if(Redis::exists('spread.'.$spread_uuid.'.midlevel.'.$i)){
                $data['level_distributed'][] = Redis::scard('spread.'.$spread_uuid.'.midlevel.'.$i);
            }
        }

        $data['mid_reship_distributed'] = array();
        $data['mid_article_distributed'] = array();
        $data['spread_time_distributed'] = array();

        $mids = Redis::keys('spread.'.$spread_uuid.'.mids.*');

        foreach ($mids as $k => $mid){

            $mid_reship_distributed = array();
            $mid_article_distributed = array();
            $spread_time_distributed = array();

            if($k < 20){
                $mid_arr = explode('.',$mid);
                $mid_id = $mid_arr[3];
                $params = [
                    'index' => 'medias',
                    'type'  => 'media',
                    'body'  => [
                        'query' => [
                            'filtered' => [
                                'filter' => [
                                    'term' => [ 'mid' => $mid_id ]
                                ]
                            ]
                        ]
                    ]
                ];

                //媒体信息
                $mid_info = Spread::searchEsData($params);
                $mid_info = current($mid_info['hits']['hits']);

                $mid_name = $mid_info['_source']['name'];

                if(Redis::hget('spread.'.$spread_uuid.'.mids.'.$mid_id,'reship')){
                    $mid_reship_distributed['mid_name'] = $mid_name;
                    $mid_reship_distributed['reships'] = Redis::hget('spread.'.$spread_uuid.'.mids.'.$mid_id,'reship');
                    array_push($data['mid_reship_distributed'],$mid_reship_distributed);
                }
                
                $mid_article_distributed['mid_name'] = $mid_name;
                $mid_article_distributed['articles'] = Redis::hget('spread.'.$spread_uuid.'.mids.'.$mid_id,'articles');
                array_push($data['mid_article_distributed'],$mid_article_distributed);

                if(Redis::hget('spread.'.$spread_uuid.'.mids.'.$mid_id,'time')){
                    $spread_time_distributed['mid_name'] = $mid_name;
                    $spread_time_distributed['time'] = Redis::hget('spread.'.$spread_uuid.'.mids.'.$mid_id,'time');
                    array_push($data['spread_time_distributed'],$spread_time_distributed);
                }
                
            }
        }

        $result_data['data'] = $data;

        //清空radis数据
        $redis_keys = Redis::keys('spread.'.$spread_uuid.'.*');
        if(!empty($redis_keys)){
            Spread::handleRedis('del',$redis_keys);
        }

//        $result_data['from'] = 123;
//        $result_data['last_update'] = 123;
//        $result_data['last_article'] = 123;
//        $result_data['version'] = 1;

        return response()->json($result_data);

    }

    //获取公司文章在媒体分类中的分布情况
    public function getCompanyMediaCategoryDist($uuid){

        $body_params['query_match'] = array(
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

        //过滤掉已删除文章
        $del_title_sign = Spread::getRedisTitleSign(config('const.redis_pr.del_art'));
        if(!empty($del_title_sign)){
            $body_params['query_match']['bool']['must_not'] = array(
                'terms' => [
                    'title_sign' => $del_title_sign
                ]
            );
        }
        
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
            array_push($body_params['query_match']['bool']['must'],$range);
        }
        
        $es_params['index'] = 'co_mi_'.$uuid;
        $es_params['type']  = 'article';
        $es_params['size']  = 0;
        $es_params['body']  = array(
            'query' => $body_params['query_match'],
            'aggs' => [
                'tagCounts' => [
                    'terms' => [
                        'field' => 'from.product_form'
                    ],
                    'aggs' => [
                        'emotionCounts' => [
                            'terms' => [
                                'field' => 'result_tags',
                                'include' => '_emo_.*'
                            ]
                        ]
                    ]
                ]
            ]
        );

        $es_data = Spread::searchEsData($es_params);

        $data = array();
        if(!empty($es_data['aggregations']['tagCounts']['buckets'])){
            foreach ($es_data['aggregations']['tagCounts']['buckets'] as $dists){

                $dist = array();
                //$dist['category'] = substr($dists['key'],(strripos($dists['key'],'_')+1));
                $dist['category'] = $dists['key'];
                $dist['category_name'] = $dists['key'];

                //if(!empty($dist['category_name'])){

                    if(!empty($dists['emotionCounts']['buckets'])){

                        foreach ($dists['emotionCounts']['buckets'] as $emotion){
                            if($emotion['key'] != '_emo_manual'){
                                $key = substr($emotion['key'],(strripos($emotion['key'],'_')+1));
                                $dist[$key] = $emotion['doc_count'];
                            }
                        }

                    }
                    if(!isset($dist['neutral'])){
                        $dist['neutral'] = 0;
                    }
                    if(!isset($dist['negative'])){
                        $dist['negative'] = 0;
                    }
                    if(!isset($dist['positive'])){
                        $dist['positive'] = 0;
                    }
                    array_push($data,$dist);

                //}

            }
        }


        //处理没有from.product_form字段的文章归入门户
        $noProductEmotionArt = Spread::noProductEmotionArt($es_params['index'],$body_params);
        if(!empty($noProductEmotionArt)){
            $menhu = false;
            foreach ($data as $key=>$value){
                if($value['category'] == '门户'){
                    $data[$key]['negative'] += $noProductEmotionArt['negative'];
                    $data[$key]['positive'] += $noProductEmotionArt['positive'];
                    $data[$key]['neutral'] += $noProductEmotionArt['neutral'];
                    $menhu = true;
                }
            }
            if($menhu == false){
                $menhu_info = $noProductEmotionArt;
                $menhu_info['category'] = '门户';
                $menhu_info['category_name'] = '门户';
                array_push($data,$menhu_info);
            }
        }

        return response()->json($data);

    }

    //获取事件文章在媒体分类中的分布情况
    public function getEventMediaCategoryDist($uuid){

        $from = Input::get('from');
        $to = Input::get('to');
        if(!empty($from)){
            $range_from = $from.' 00:00:00';
            if(!empty($to) && ( $to != Carbon::now()->format('Y-m-d') )){
                $range_to = $to.' 23:59:59';
            }else{
                $range_to = Carbon::now()->toDateTimeString();
            }
            $query_and = array(
                'range' => [
                    'publish_at' => [
                        'gte' => $range_from,
                        'lte' => $range_to
                    ]
                ]
            );
        }

        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            ),
            array(
                'term' => [ 'result_tags' => '_evt_'.$uuid ]
            )
        );
        if(isset($query_and)){
            array_push($filter_and,$query_and);
        }

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

        $es_params['index'] = Api::getCompanyIndex();
        $es_params['type']  = 'article';
        $es_params['size']  = 0;
        $es_params['body']  = array(
            'query' => [
                'filtered' => [
                    'filter' => [
                        'and' => $filter_and
                    ]
                ]
            ],
            'aggs' => [
                'tagCounts' => [
                    'terms' => [
                        'field' => 'from.product_form'
                    ],
                    'aggs' => [
                        'emotionCounts' => [
                            'terms' => [
                                'field' => 'result_tags',
                                'include' => '_emo_.*'
                            ]
                        ]
                    ]
                ]
            ]

        );

        $es_data = Spread::searchEsData($es_params);

        $data = array();
        if(!empty($es_data['aggregations']['tagCounts']['buckets'])){
            foreach ($es_data['aggregations']['tagCounts']['buckets'] as $dists){

                $dist = array();
                //$dist['category'] = substr($dists['key'],(strripos($dists['key'],'_')+1));
                $dist['category'] = $dists['key'];
                $dist['category_name'] = $dists['key'];

                //if(!empty($dist['category_name'])) {

                    if (!empty($dists['emotionCounts']['buckets'])) {

                        foreach ($dists['emotionCounts']['buckets'] as $emotion) {
                            if($emotion['key'] != '_emo_manual'){
                                $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                                $dist[$key] = $emotion['doc_count'];
                            }

                        }

                    }
                    if (!isset($dist['neutral'])) {
                        $dist['neutral'] = 0;
                    }
                    if (!isset($dist['negative'])) {
                        $dist['negative'] = 0;
                    }
                    if (!isset($dist['positive'])) {
                        $dist['positive'] = 0;
                    }
                    array_push($data, $dist);

               // }

            }
        }

        //由于事件源没有product_from字段，临时处理 begin
        //情感文章
        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            ),
            array(
                'missing' => [ 'field' => 'from.product_form' ]
            ),
            array(
                'term' => [ 'result_tags' => '_evt_'.$uuid ]
            )
        );
        if(isset($query_and)){
            array_push($filter_and,$query_and);
        }

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
        
        $noProduct_params['index'] = Api::getCompanyIndex();
        $noProduct_params['type']  = 'article';
        $noProduct_params['size']  = 0;
        $noProduct_params['body']  = array(
            'query' => [
                'filtered' => [
                    'filter' => [
                        'and' => $filter_and
                    ]
                ]
            ],
            'aggs' => [
                'emotionCounts' => [
                    'terms' => [
                        'field' => 'result_tags',
                        'include' => '_emo_.*'
                    ]
                ]
            ]

        );
        $noProduct_data = Spread::searchEsData($noProduct_params);
        $menhu = false;
        if(!empty($noProduct_data['aggregations']['emotionCounts']['buckets'])){
            foreach ($noProduct_data['aggregations']['emotionCounts']['buckets'] as $emotion){
                if($emotion['key'] != '_emo_manual'){
                    $menhu_emo = array();
                    $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                    foreach ($data as $k => $v) {
                        if ($v['category_name'] == '门户') {
                            $data[$k][$key] += $emotion['doc_count'];
                            $menhu = true;
                        }
                    }
                    if ($menhu == false) {
                        $menhu_emo[$key] = $emotion['doc_count'];
                    }
                    if ($menhu == false) {
                        $menhu_info = $menhu_emo;
                        $menhu_info['category'] = '门户';
                        $menhu_info['category_name'] = '门户';
                        if (!isset($menhu_info['neutral'])) {
                            $menhu_info['neutral'] = 0;
                        }
                        if (!isset($menhu_info['negative'])) {
                            $menhu_info['negative'] = 0;
                        }
                        if (!isset($menhu_info['positive'])) {
                            $menhu_info['positive'] = 0;
                        }
                        array_push($data, $menhu_info);
                    }
                }
            }

        }

        //无情感文章数
        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            ),
            array(
                'missing' => [ 'field' => 'from.product_form' ]
            ),
            array(
                'term' => [ 'result_tags' => '_evt_'.$uuid ]
            ),
            array(
                'bool' => [
                    'must_not' => [
                        array(
                            'term' => [
                                'result_tags' => '_emo_negative'
                            ]
                        ),
                        array(
                            'term' => [
                                'result_tags' => '_emo_positive'
                            ]
                        ),
                        array(
                            'term' => [
                                'result_tags' => '_emo_neutral'
                            ]
                        )
                    ]
                ]
            )
        );
        if(isset($query_and)){
            array_push($filter_and,$query_and);
        }

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
        
        $noProductNoEmo_params['index'] = Api::getCompanyIndex();
        $noProductNoEmo_params['type']  = 'article';
        $noProductNoEmo_params['body']  = array(
            'query' => [
                'filtered' => [
                    'filter' => [
                        'and' => $filter_and
                    ]
                ]
            ]

        );
        $noProductNoEmo_data = Spread::searchEsData($noProductNoEmo_params,'',1);
        if($noProductNoEmo_data['count']>0){
            $menhu = false;
            foreach ($data as $k=>$v){
                if($v['category_name'] == '门户'){
                    $data[$k]['neutral'] += $noProductNoEmo_data['count'];
                    $menhu = true;
                }
            }
            if($menhu == false){
                $menhu_info['category'] = '门户';
                $menhu_info['category_name'] = '门户';
                $menhu_info['negative'] = 0;
                $menhu_info['positive'] = 0;
                $menhu_info['neutral'] = $emotion['doc_count'];
                array_push($data,$menhu_info);
            }
        }

        //由于事件源没有product_from字段，临时处理 end

        return response()->json($data);

    }

    //获取公司某个顶级分类中文章的在各个媒体中的分布情况
    public function getCompanyMediaDist($uuid){

        $data = array();
        $category = Input::get('category');
        $count = Input::get('count')?Input::get('count'):20;
        if(empty($category)){
            return response()->json($data);
        }

        $from = Input::get('from');
        $to = Input::get('to');
        if(!empty($from)){
            $range_from = $from.' 00:00:00';
            if(!empty($to) && ( $to != Carbon::now()->format('Y-m-d') )){
                $range_to = $to.' 23:59:59';
            }else{
                $range_to = Carbon::now()->toDateTimeString();
            }
            $query_and = array(
                'range' => [
                    'publish_at' => [
                        'gte' => $range_from,
                        'lte' => $range_to
                    ]
                ]
            );
        }

        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            ),
            array(
                'term' => [ 'from.product_form' => $category ]
            )
        );
        if(isset($query_and)){
            array_push($filter_and,$query_and);
        }

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

        $es_params['index'] = 'co_mi_'.$uuid;
        $es_params['type']  = 'article';
        $es_params['size']  = 0;
        $es_params['body']  = array(
            'query' => [
                'filtered' => [
                    'filter' => [
                        'and' => $filter_and
                    ]
                ]
            ],
            'aggs' => [
                'midCounts' => [
                    'terms' => [
                        'field' => 'from.mid',
                        'size' => $count
                    ],
                    'aggs' => [
                        'emotionCounts' => [
                            'terms' => [
                                'field' => 'result_tags',
                                'include' => '_emo_.*'
                            ]
                        ]
                    ]
                ]
            ]
        );

        $es_data = Spread::searchEsData($es_params);

        if(!empty($es_data['aggregations']['midCounts']['buckets'])){
            
            $un_mid = array();  //不存在的媒体id
            foreach ($es_data['aggregations']['midCounts']['buckets'] as $dists){

                $dist = array();
                $dist['mid'] = sprintf("%012d",$dists['key']);
                $params = [
                    'index' => 'medias',
                    'type'  => 'media',
                    'body'  => [
                        'query' => [
                            'filtered' => [
                                'filter' => [
                                    'term' => [ 'mid' => $dist['mid'] ]
                                ]
                            ]
                        ]
                    ]
                ];
                //媒体信息
                $mid_info = Spread::searchEsData($params);

                $dist['mid_name'] = '';
                if(count($mid_info['hits']['hits']) > 0){
                    $mid_info = current($mid_info['hits']['hits']);
                    $dist['mid_name'] = $mid_info['_source']['name'];
                }else{  //记录不存在的媒体id
                    array_push($un_mid,$dist['mid']);
                }

                if(!empty($dists['emotionCounts']['buckets'])){

                    foreach ($dists['emotionCounts']['buckets'] as $emotion){
                        if($emotion['key'] != '_emo_manual'){
                            $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                            $dist[$key] = $emotion['doc_count'];
                        }
                    }

                }
                if(!isset($dist['neutral'])){
                    $dist['neutral'] = 0;
                }
                if(!isset($dist['negative'])){
                    $dist['negative'] = 0;
                }
                if(!isset($dist['positive'])){
                    $dist['positive'] = 0;
                }

                array_push($data,$dist);

            }
            
            if(!empty($un_mid)){
                $file = storage_path().'/logs/myLog.log';
                Mylog::saveMylog('media',$file,'媒体不存在',$un_mid);    //写入日志
            }
            
        }

        //由于事件源没有product_from字段，临时处理 begin
        if($category == '门户'){

            $filter_and = array(
                array(
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getUpdateAt()
                        ]
                    ]
                ),
                array(
                    'missing' => [ 'field' => 'from.product_form' ]
                )
            );
            if(isset($query_and)){
                array_push($filter_and,$query_and);
            }

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

            //情感文章
            $noProduct_params['index'] = Api::getCompanyIndex();
            $noProduct_params['type']  = 'article';
            $noProduct_params['size']  = 0;
            $noProduct_params['body']  = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => $filter_and
                        ]
                    ]
                ],
                'aggs' => [
                    'midCounts' => [
                        'terms' => [
                            'field' => 'from.mid',
                            'size' => 0
                        ],
                        'aggs' => [
                            'emotionCounts' => [
                                'terms' => [
                                    'field' => 'result_tags',
                                    'include' => '_emo_.*'
                                ]
                            ]
                        ]
                    ]
                ]

            );
            $noProduct_data = Spread::searchEsData($noProduct_params);
            if(!empty($noProduct_data['aggregations']['midCounts']['buckets'])){

                foreach ($noProduct_data['aggregations']['midCounts']['buckets'] as $dists){

                    $dist = array();
                    $dist['mid'] = sprintf("%012d",$dists['key']);
                    $params = [
                        'index' => 'medias',
                        'type'  => 'media',
                        'body'  => [
                            'query' => [
                                'filtered' => [
                                    'filter' => [
                                        'term' => [ 'mid' => $dist['mid'] ]
                                    ]
                                ]
                            ]
                        ]
                    ];
                    //媒体信息
                    $mid_info = Spread::searchEsData($params);

                    $dist['mid_name'] = '';
                    if(count($mid_info['hits']['hits']) > 0) {
                        $mid_info = current($mid_info['hits']['hits']);
                        $dist['mid_name'] = $mid_info['_source']['name'];
                    }

                    if (!empty($dists['emotionCounts']['buckets'])) {
                        $menhu = false;
                        $menhu_emo = array();
                        foreach ($dists['emotionCounts']['buckets'] as $emotion) {
                            if($emotion['key'] != '_emo_manual'){
                                $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                                foreach ($data as $k => $v) {
                                    if ($v['mid'] == $dist['mid']) {
                                        $data[$k][$key] += $emotion['doc_count'];
                                        $menhu = true;
                                    }
                                }
                                if ($menhu == false) {
                                    $menhu_emo[$key] = $emotion['doc_count'];
                                }
                            }
                        }
                        if($menhu == false){
                            $menhu_info = $menhu_emo;
                            $menhu_info['mid'] = $dist['mid'];
                            $menhu_info['mid_name'] = isset($dist['mid_name']) ? $dist['mid_name'] : '';
                            if (!isset($menhu_info['neutral'])) {
                                $menhu_info['neutral'] = 0;
                            }
                            if (!isset($menhu_info['negative'])) {
                                $menhu_info['negative'] = 0;
                            }
                            if (!isset($menhu_info['positive'])) {
                                $menhu_info['positive'] = 0;
                            }
                            array_push($data,$menhu_info);
                        }

                    }

                }


            }

            //无情感文章数
            $filter_and = array(
                array(
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getUpdateAt()
                        ]
                    ]
                ),
                array(
                    'missing' => [ 'field' => 'from.product_form' ]
                ),
                array(
                    'bool' => [
                        'must_not' => [
                            array(
                                'term' => [
                                    'result_tags' => '_emo_negative'
                                ]
                            ),
                            array(
                                'term' => [
                                    'result_tags' => '_emo_positive'
                                ]
                            ),
                            array(
                                'term' => [
                                    'result_tags' => '_emo_neutral'
                                ]
                            )
                        ]
                    ]
                )
            );
            if(isset($query_and)){
                array_push($filter_and,$query_and);
            }
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
            
            $noProductNoEmo_params['index'] = Api::getCompanyIndex();
            $noProductNoEmo_params['type']  = 'article';
            $noProductNoEmo_params['size']  = 0;
            $noProductNoEmo_params['body']  = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => $filter_and
                        ]
                    ]
                ],
                'aggs' => [
                    'midCounts' => [
                        'terms' => [
                            'field' => 'from.mid',
                            'size' => 0
                        ]
                    ]
                ]

            );
            $noProductNoEmo_data = Spread::searchEsData($noProductNoEmo_params);

            if(!empty($noProductNoEmo_data['aggregations']['midCounts']['buckets'])){
                foreach ($noProductNoEmo_data['aggregations']['midCounts']['buckets'] as $value){
                    $menhu = false;
                    $mid = $value['key'];
                    foreach ($data as $k=>$v){
                        if($v['mid'] == $mid){
                            $data[$k]['neutral'] += $value['doc_count'];
                            $menhu = true;
                        }
                    }
                    if($menhu == false){
                        $menhu_info['mid'] = $mid;
                        $params = [
                            'index' => 'medias',
                            'type'  => 'media',
                            'body'  => [
                                'query' => [
                                    'filtered' => [
                                        'filter' => [
                                            'term' => [ 'mid' => $mid ]
                                        ]
                                    ]
                                ]
                            ]
                        ];
                        //媒体信息
                        $mid_info = Spread::searchEsData($params);

                        $menhu_info['mid_name'] = '';
                        if(count($mid_info['hits']['hits']) > 0) {
                            $mid_info = current($mid_info['hits']['hits']);
                            $menhu_info['mid_name'] = $mid_info['_source']['name'];
                        }
                        $menhu_info['negative'] = 0;
                        $menhu_info['positive'] = 0;
                        $menhu_info['neutral'] = $value['doc_count'];
                        array_push($data,$menhu_info);
                    }
                }

            }

        }

        //重新排序
        if(!empty($data)){
            $data_count = count($data);
            for($i=1;$i<$data_count;$i++){
                for($k=0;$k<($data_count-$i);$k++){
                    $count = $data[$k]['negative'] + $data[$k]['positive'] + $data[$k]['neutral'];
                    $count_next = $data[$k+1]['negative'] + $data[$k+1]['positive'] + $data[$k+1]['neutral'];
                    if($count_next > $count){
                        $temp = $data[$k+1];
                        $data[$k+1] = $data[$k];
                        $data[$k] = $temp;
                    }
                }
            }
        }

        //由于事件源没有product_from字段，临时处理 end

        return response()->json($data);

    }

    //获取某个顶级分类中文章的在各个媒体中的分布情况
    public function getEventMediaDist($uuid){

        $data = array();
        $category = Input::get('category');
        $count = Input::get('count')?Input::get('count'):20;
        if(empty($category)){
            return response()->json($data);
        }

        $from = Input::get('from');
        $to = Input::get('to');
        if(!empty($from)){
            $range_from = $from.' 00:00:00';
            if(!empty($to) && ( $to != Carbon::now()->format('Y-m-d') )){
                $range_to = $to.' 23:59:59';
            }else{
                $range_to = Carbon::now()->toDateTimeString();
            }
            $query_and = array(
                'range' => [
                    'publish_at' => [
                        'gte' => $range_from,
                        'lte' => $range_to
                    ]
                ]
            );
        }

        $filter_and = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            ),
            array(
                'term' => ['from.product_form' => $category]
            ),
            array(
                'term' => [ 'result_tags' => '_evt_'.$uuid ]
            )
        );
        if(isset($query_and)){
            array_push($filter_and,$query_and);
        }

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
        
        $es_params['index'] = Api::getCompanyIndex();
        $es_params['type']  = 'article';
        $es_params['size']  = 0;
        $es_params['body']  = array(
            'query' => [
                'filtered' => [
                    'filter' => [
                        'and' => $filter_and
                    ]
                ]
            ],
            'aggs' => [
                'midCounts' => [
                    'terms' => [
                        'field' => 'from.mid',
                        'size' => $count
                    ],
                    'aggs' => [
                        'emotionCounts' => [
                            'terms' => [
                                'field' => 'result_tags',
                                'include' => '_emo_.*'
                            ]
                        ]
                    ]
                ]
            ]
        );
        $es_data = Spread::searchEsData($es_params);

        if(!empty($es_data['aggregations']['midCounts']['buckets'])){

            $un_mid = array();  //不存在的媒体id
            foreach ($es_data['aggregations']['midCounts']['buckets'] as $dists){

                $dist = array();

                $dist['mid'] = sprintf("%012d",$dists['key']);

                $params = [
                    'index' => 'medias',
                    'type'  => 'media',
                    'body'  => [
                        'query' => [
                            'filtered' => [
                                'filter' => [
                                    'term' => [ 'mid' => $dist['mid'] ]
                                ]
                            ]
                        ]
                    ]
                ];
                //媒体信息
                $mid_info = Spread::searchEsData($params);

                $dist['mid_name'] = '';
                if(count($mid_info['hits']['hits']) > 0) {
                    $mid_info = current($mid_info['hits']['hits']);
                    $dist['mid_name'] = $mid_info['_source']['name'];
                }else{  //记录不存在的媒体id
                    array_push($un_mid,$dist['mid']);
                }

                if (!empty($dists['emotionCounts']['buckets'])) {

                    foreach ($dists['emotionCounts']['buckets'] as $emotion) {
                        if($emotion['key'] != '_emo_manual'){
                            $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                            $dist[$key] = $emotion['doc_count'];
                        }
                    }

                }
                if (!isset($dist['neutral'])) {
                    $dist['neutral'] = 0;
                }
                if (!isset($dist['negative'])) {
                    $dist['negative'] = 0;
                }
                if (!isset($dist['positive'])) {
                    $dist['positive'] = 0;
                }
                array_push($data, $dist);

            }

            if(!empty($un_mid)){
                $file = storage_path().'/logs/myLog.log';
                Mylog::saveMylog('media',$file,'媒体不存在',$un_mid);    //写入日志
            }
        }

        //由于事件源没有product_from字段，临时处理 begin
        if($category == '门户'){
            //情感文章
            $filter_and = array(
                array(
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getUpdateAt()
                        ]
                    ]
                ),
                array(
                    'missing' => [ 'field' => 'from.product_form' ]
                ),
                array(
                    'term' => [ 'result_tags' => '_evt_'.$uuid ]
                )
            );
            if(isset($query_and)){
                array_push($filter_and,$query_and);
            }

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
            
            $noProduct_params['index'] = Api::getCompanyIndex();
            $noProduct_params['type']  = 'article';
            $noProduct_params['size']  = 0;
            $noProduct_params['body']  = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => $filter_and
                        ]
                    ]
                ],
                'aggs' => [
                    'midCounts' => [
                        'terms' => [
                            'field' => 'from.mid',
                            'size' => 0
                        ],
                        'aggs' => [
                            'emotionCounts' => [
                                'terms' => [
                                    'field' => 'result_tags',
                                    'include' => '_emo_.*'
                                ]
                            ]
                        ]
                    ]
                ]

            );
            $noProduct_data = Spread::searchEsData($noProduct_params);

            if(!empty($noProduct_data['aggregations']['midCounts']['buckets'])){

                foreach ($noProduct_data['aggregations']['midCounts']['buckets'] as $dists){

                    $dist = array();
                    $dist['mid'] = sprintf("%012d",$dists['key']);
                    $params = [
                        'index' => 'medias',
                        'type'  => 'media',
                        'body'  => [
                            'query' => [
                                'filtered' => [
                                    'filter' => [
                                        'term' => [ 'mid' => $dist['mid'] ]
                                    ]
                                ]
                            ]
                        ]
                    ];
                    //媒体信息
                    $mid_info = Spread::searchEsData($params);

                    $dist['mid_name'] = '';
                    if(count($mid_info['hits']['hits']) > 0) {
                        $mid_info = current($mid_info['hits']['hits']);
                        $dist['mid_name'] = $mid_info['_source']['name'];
                    }

                    if (!empty($dists['emotionCounts']['buckets'])) {
                        $menhu = false;
                        $menhu_emo = array();
                        foreach ($dists['emotionCounts']['buckets'] as $emotion) {
                            if($emotion['key'] != '_emo_manual'){
                                $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                                foreach ($data as $k => $v) {
                                    if ($v['mid'] == $dist['mid']) {
                                        $data[$k][$key] += $emotion['doc_count'];
                                        $menhu = true;
                                    }
                                }
                                if ($menhu == false) {
                                    $menhu_emo[$key] = $emotion['doc_count'];
                                }
                            }
                        }
                        if($menhu == false){
                            $menhu_info = $menhu_emo;
                            $menhu_info['mid'] = $dist['mid'];
                            $menhu_info['mid_name'] = isset($dist['mid_name']) ? $dist['mid_name'] : '';
                            if (!isset($menhu_info['neutral'])) {
                                $menhu_info['neutral'] = 0;
                            }
                            if (!isset($menhu_info['negative'])) {
                                $menhu_info['negative'] = 0;
                            }
                            if (!isset($menhu_info['positive'])) {
                                $menhu_info['positive'] = 0;
                            }
                            array_push($data,$menhu_info);
                        }

                    }

                }


            }

            //无情感文章数
            $filter_and = array(
                array(
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getUpdateAt()
                        ]
                    ]
                ),
                array(
                    'missing' => [ 'field' => 'from.product_form' ]
                ),
                array(
                    'term' => [ 'result_tags' => '_evt_'.$uuid ]
                ),
                array(
                    'bool' => [
                        'must_not' => [
                            array(
                                'term' => [
                                    'result_tags' => '_emo_negative'
                                ]
                            ),
                            array(
                                'term' => [
                                    'result_tags' => '_emo_positive'
                                ]
                            ),
                            array(
                                'term' => [
                                    'result_tags' => '_emo_neutral'
                                ]
                            )
                        ]
                    ]
                )
            );
            if(isset($query_and)){
                array_push($filter_and,$query_and);
            }

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
            
            $noProductNoEmo_params['index'] = Api::getCompanyIndex();
            $noProductNoEmo_params['type']  = 'article';
            $noProductNoEmo_params['size']  = 0;
            $noProductNoEmo_params['body']  = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => $filter_and
                        ]
                    ]
                ],
                'aggs' => [
                    'midCounts' => [
                        'terms' => [
                            'field' => 'from.mid',
                            'size' => 0
                        ]
                    ]
                ]

            );
            $noProductNoEmo_data = Spread::searchEsData($noProductNoEmo_params);

            if(!empty($noProductNoEmo_data['aggregations']['midCounts']['buckets'])){
                foreach ($noProductNoEmo_data['aggregations']['midCounts']['buckets'] as $value){
                    $menhu = false;
                    $mid = $value['key'];
                    foreach ($data as $k=>$v){
                        if($v['mid'] == $mid){
                            $data[$k]['neutral'] += $value['doc_count'];
                            $menhu = true;
                        }
                    }
                    if($menhu == false){
                        $menhu_info['mid'] = $mid;
                        $params = [
                            'index' => 'medias',
                            'type'  => 'media',
                            'body'  => [
                                'query' => [
                                    'filtered' => [
                                        'filter' => [
                                            'term' => [ 'mid' => $mid ]
                                        ]
                                    ]
                                ]
                            ]
                        ];
                        //媒体信息
                        $mid_info = Spread::searchEsData($params);

                        $menhu_info['mid_name'] = '';
                        if(count($mid_info['hits']['hits']) > 0) {
                            $mid_info = current($mid_info['hits']['hits']);
                            $menhu_info['mid_name'] = $mid_info['_source']['name'];
                        }
                        $menhu_info['negative'] = 0;
                        $menhu_info['positive'] = 0;
                        $menhu_info['neutral'] = $value['doc_count'];
                        array_push($data,$menhu_info);
                    }
                }

            }

        }

        //重新排序
        if(!empty($data)){
            $data_count = count($data);
            for($i=1;$i<$data_count;$i++){
                for($k=0;$k<($data_count-$i);$k++){
                    $count = $data[$k]['negative'] + $data[$k]['positive'] + $data[$k]['neutral'];
                    $count_next = $data[$k+1]['negative'] + $data[$k+1]['positive'] + $data[$k+1]['neutral'];
                    if($count_next > $count){
                        $temp = $data[$k+1];
                        $data[$k+1] = $data[$k];
                        $data[$k] = $temp;
                    }
                }
            }
        }

        //由于事件源没有product_from字段，临时处理 end

        return response()->json($data);

    }

    //获取公司当天情感文章数量
    public function getCompanyEmotion(){

        $date_begin = Carbon::now()->startOfDay()->toDateTimeString();
        $date_end = Carbon::now()->toDateTimeString();

        $params = [
            'index' => Api::getCompanyIndex(),
            'type'  => 'article',
            'body'  => [
                'query' => [
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
                                'range' => [
                                    'publish_at' => [
                                        'from' => $date_begin,
                                        'to' => $date_end
                                    ]
                                ]
                            )
                        ]
                    ]
                ],
                'aggs' => [
                    'emotionCounts' => [
                        'terms' => [
                            'field' => 'result_tags',
                            'include' => '_emo_.*'
                        ]
                    ]
                ]
            ]
        ];

        //过滤掉已删除文章
        $del_title_sign = Spread::getRedisTitleSign(config('const.redis_pr.del_art'));
        if(!empty($del_title_sign)){
            $params['body']['query']['bool']['must_not'] = array(
                'terms' => [
                    'title_sign' => $del_title_sign
                ]
            );
            array_push($filter_and,$del_article);
        }
        
        $es_data = Spread::searchEsData($params);

        $data = array();
        if (!empty($es_data['aggregations']['emotionCounts']['buckets'])) {
            $emotion = array();
            foreach ($es_data['aggregations']['emotionCounts']['buckets'] as $emo) {
                if($emo['key'] != '_emo_manual'){
                    $key = substr($emo['key'], (strripos($emo['key'], '_') + 1));
                    $emotion[$key] = $emo['doc_count'];
                }
            }
        }
        if (!isset($emotion['neutral'])) {
            $emotion['neutral'] = 0;
        }
        if (!isset($emotion['negative'])) {
            $emotion['negative'] = 0;
        }
        if (!isset($emotion['positive'])) {
            $emotion['positive'] = 0;
        }
        array_push($data,$emotion);

        return response()->json($data);

    }


}