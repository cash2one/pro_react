<?php
/**
 * Created by PhpStorm.
 * User: xzc
 * Date: 16-6-1
 * Time: 上午8:31
 */

namespace App\Http;
use App\Http\Api;
use Elasticsearch\ClientBuilder;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redis;
use App\Model\Event;
use App\Http\Mylog;
use Carbon\Carbon;
use Exception;
use App\Http\Controllers\Api2\ArticleController;

class Spread
{
    /*
     * 第一次传播获取文章列表。
     * type：company|event|article
     * uuid：公司id|事件id|文章id
     *
    */
    public static function getFirstArticles($type,$uuid){
        
        $usr = Api::getCreatorId();     //用户id
        $spread_uuid = $uuid . '_' . $usr;       //uuid+user_id 代表唯一

        //第一次判断清空数据
        $redis_keys = Redis::keys('spread.' . $spread_uuid . '.*');
        if (!empty($redis_keys)) {
            Spread::handleRedis('del', $redis_keys);
        }

        if ($type == 'company') {
            $month_day = date('Y-m-d H:i:s', (time() - 30 * 24 * 3600));   //30天前日期

            $es_params['index'] = 'co_mi_' . $uuid;
            $es_params['type'] = 'article';
            $es_params['size'] = 200;
            $es_params['sort'] = array('reship:desc', 'crawler_at:desc', 'publish_at:desc');
            $es_params['body'] = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'bool' => [
                                'must' => [
                                    array(
                                        'range' => [
                                            'crawler_at' => [
                                                'gte' => $month_day,
                                                'lte' => Api::getUpdateAt()
                                            ]
                                        ]
                                    ),
                                    array(
                                        'range' => [
                                            'reship' => ['gt' => 0]
                                        ]
                                    )
                                ]
                            ]

                        ]
                    ]
                ]

            );

            $es_data = Spread::searchEsData($es_params,true);

        }

        if ($type == 'event') {

            $es_params['index'] = Api::getCompanyIndex();
            $es_params['type'] = 'article';
            $es_params['size'] = 50;
            $es_params['body'] = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => [
                                array(
                                    'range' => [
                                        'crawler_at' => [
                                            'lte' => Api::getUpdateAt()
                                        ]
                                    ]
                                ),
                                array(
                                    'term' => ['result_tags' => '_evt_' . $uuid]
                                )
                            ]
                        ]
                    ]
                ]
            );
            $es_params['search_type'] = 'scan';
            $es_params['scroll'] = '30s';

            $es_data = Spread::searchEsData($es_params,true);

        }


        $data = array();
        if (!empty($es_data)) {

            $es_handle_data = Spread::handleRoutData($es_data);

            foreach ($es_handle_data as $arts) {

                if (isset($arts['reship']) && $arts['reship'] > 0) {   //过滤转发数0的数据

                    $art = array();
                    $art['from'] = 'none';
                    $art['to']['uuid'] = $arts['uuid'];
                    $art['to']['title'] = $arts['link_title'];
                    $art['to']['title_sign'] = $arts['title_sign'];
                    $art['to']['mid'] = $arts['from']['mid'];
                    $art['to']['mid_name'] = $arts['from']['media'];
                    $art['to']['mid_tags'] = $arts['from']['tags'];
                    $art['to']['crawler_at'] = $arts['crawler_at'];
                    $art['to']['publish_at'] = $arts['publish_at'];

                    //顶级分类
                    if (is_array($arts['from']['tags']) && count($arts['from']['tags']) > 0) {
                        foreach ($arts['from']['tags'] as $mid_tag) {
                            $mid_tag_arr = explode('_', $mid_tag);
                            if (isset($mid_tag_arr[1]) && $mid_tag_arr[1] == 'cat') {
                                $art['to']['mid_cat_en'] = $mid_tag_arr[2];                    //顶级分类英文名
                                $art['to']['mid_cat'] = config('const.medias.' . $mid_tag);   //顶级分类中文名
                                Redis::incr('spread.' . $spread_uuid . '.' . $mid_tag_arr[2] . '.articles');   //顶级分类文章数
                            }
                        }
                    }

                    $art['type'] = 'normal';

                    array_push($data, $art);

                    /*数据统计*/

                    //传播的媒体列表
                    Redis::sadd('spread.' . $spread_uuid . '.mids', $arts['from']['mid']);

                    //第1层媒体列表
                    Redis::sadd('spread.' . $spread_uuid . '.midlevel.1', $arts['from']['mid']);

                    //某个媒体的发布文章数
                    Redis::hincrby('spread.' . $spread_uuid . '.mids.' . $arts['from']['mid'], 'articles', 1);
                }

            }

            //查询者
            Redis::set('spread.' . $spread_uuid . '.usr', $usr);

            Redis::hmset('spread.' . $spread_uuid . '.stat', 'articles', count($data));       //文章总数
            Redis::hmset('spread.' . $spread_uuid . '.stat', 'spread_level', 1);              //当前传播层级,1层

        }

        //批量设置redis过期时间
        $redis_keys = Redis::keys('spread.' . $spread_uuid . '.*');
        if (!empty($redis_keys)) {
            Spread::handleRedis('expire', $redis_keys);
        }

        return $data;
        
    }

    /*获取传播分析
     * spread_uuid 分析对象id, 公司id|事件id|文章id
     * from_uuid 分析的文章id，格式：array()
    */
    public static function getSpreadRoute($spread_uuid,$from_uuid){

        $usr = Api::getCreatorId();     //用户id
        $spread_uuid = $spread_uuid . '_' . $usr;       //uuid+user_id 代表唯一

        $es_params['index'] = 'spread';
        $es_params['type'] = 'spread_route';
        $es_params['size'] = 50;
        $es_params['body'] = array(

            'query' => [
                'filtered' => [
                    'filter' => [
                        'and' => [
                            array(
                                'range' => [
                                    'crawler_at' => [
                                        'lte' => Api::getUpdateAt()
                                    ]
                                ]
                            ),
                            array(
                                'terms' => ['from.uuid' => $from_uuid]
                            )
                        ]
                    ]
                ]
            ]

        );
        $es_params['search_type'] = 'scan';
        $es_params['scroll'] = '30s';

        $es_data = Spread::searchEsData($es_params,true);

        $data = array();
        if (!empty($es_data)) {

            $article_array = array();

            foreach ($es_data as $route) {

                if ($route['from']['uuid'] != $route['to']['uuid']) {     //过滤错误数据
                    //顶级分类
                    if (is_array($route['to']['mid_tags']) && count($route['to']['mid_tags']) > 0) {
                        foreach ($route['to']['mid_tags'] as $mid_tag) {

                            $mid_tag_arr = explode('_', $mid_tag);
                            if (isset($mid_tag_arr[1]) && $mid_tag_arr[1] == 'cat') {
                                $route['to']['mid_cat_en'] = $mid_tag_arr[2];              //顶级分类英文名
                                $route['to']['mid_cat'] = config('const.medias.' . $mid_tag);   //顶级分类中文名
                                Redis::incr('spread.' . $spread_uuid . '.' . $mid_tag_arr[2] . '.articles');   //顶级分类文章数
                            }

                        }
                    }

                    array_push($data, $route);

                    /**** 数据统计 start ****/

                    //统计文章总数，过滤相同文章
                    if (!in_array($route['from']['uuid'], $article_array) && !in_array($route['to']['uuid'], $article_array)) {
                        Redis::hincrby('spread.' . $spread_uuid . '.stat', 'articles', 1);       //文章总数
                        array_push($article_array, $route['from']['uuid']);
                        array_push($article_array, $route['to']['uuid']);
                    }

                    //总传播时间
                    $spread_length = 0;
                    if (!empty($route['spread_length'])) {

                        if ($route['spread_length'] > 0) {
                            $spread_length = $route['spread_length'];
                        }

                    } else {
                        //判断时间
                        if (isset($route['from']['publish_at']) && isset($route['to']['publish_at']) && preg_match("/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/s", $route['from']['publish_at']) && preg_match("/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/s", $route['to']['publish_at'])) {

                            $time_length = floor((strtotime($route['to']['publish_at']) - strtotime($route['from']['publish_at'])) / 3600);

                        } elseif (isset($route['from']['crawler_at']) && isset($route['to']['crawler_at']) && preg_match("/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/s", $route['from']['crawler_at']) && preg_match("/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/s", $route['to']['crawler_at'])) {

                            $time_length = floor((strtotime($route['to']['crawler_at']) - strtotime($route['from']['crawler_at'])) / 3600);

                        } else {
                            $time_length = 0;
                        }

                        if ($time_length > 0) {
                            $spread_length = $time_length;
                        }

                    }

                    //总传播时间
                    Redis::hincrby('spread.' . $spread_uuid . '.stat', 'spread_length', $spread_length);
                    //传播的媒体列表
                    Redis::sadd('spread.' . $spread_uuid . '.mids', $route['to']['mid']);

                    //某级传播的媒体列表。取值1~4级
                    $level = Redis::hget('spread.' . $spread_uuid . '.stat', 'spread_level');     //上一传播层级
                    if ($level < 5) {
                        $now_level = $level + 1;
                        Redis::sadd('spread.' . $spread_uuid . '.midlevel.' . $now_level, $route['to']['mid']);
                    }

                    //每个媒体的信息
                    Redis::hincrby('spread.' . $spread_uuid . '.mids.' . $route['from']['mid'], 'reship', 1);             //转发数

                    Redis::hincrby('spread.' . $spread_uuid . '.mids.' . $route['to']['mid'], 'articles', 1);             //发布数

                    Redis::hincrby('spread.' . $spread_uuid . '.mids.' . $route['from']['mid'], 'time', $spread_length);   //转发时间


                    /**** 数据统计 end ****/

                }

            }

        }

        Redis::hincrby('spread.' . $spread_uuid . '.stat', 'reship', count($data));         //转载总数
        Redis::hincrby('spread.' . $spread_uuid . '.stat', 'spread_level', 1);              //当前传播层级

        //批量设置redis过期时间
        $redis_keys = Redis::keys('spread.' . $spread_uuid . '.*');
        if (!empty($redis_keys)) {
            Spread::handleRedis('expire', $redis_keys);
        }

        return $data;

    }

    //查询ES数据,params查询参数，format_data是否处理数据
    public static function searchEsData($params,$format_data=false,$count=false,$highlight=false){

        $hosts = [config('app.esUrl')];
        $client = ClientBuilder::create()->setHosts($hosts)->build();
        
        try{
            if($count==true){
                $es_count = $client->count($params);
                //记录Es日志
                Spread::saveEsLog('info','count',$params);
                
                return $es_count;
                
            }else{
                $es_data = $client->search($params);
                //记录Es日志
                Spread::saveEsLog('info','search',$params);
            }
            
        }catch (Exception $e){
            //记录Es日志
            if($count==true){
                Spread::saveEsLog('error','count',$params,$e);
            }else{
                Spread::saveEsLog('error','search',$params,$e);
            }

            //抛出异常
            throw $e;
        }

        $data = array();

        if($format_data == true){
            
            if (count($es_data['hits']['hits']) > 0) {
                foreach ($es_data['hits']['hits'] as $res){
                    if($highlight == true){
                        array_push($data,$res);
                    }else{
                        array_push($data,$res['_source']);
                    }
                }
            }

            if(!empty($params['scroll'])){

                $scroll_id = $es_data['_scroll_id'];

                //游标全部数据
                while (\true) {

                    $response = $client->scroll([
                            "scroll_id" => $scroll_id,
                            "scroll" => $params['scroll']
                        ]
                    );

                    if (count($response['hits']['hits']) > 0) {

                        foreach ($response['hits']['hits'] as $res) {
                            if($highlight == true){
                                array_push($data,$res);
                            }else{
                                array_push($data,$res['_source']);
                            }
                        }

                        $scroll_id = $response['_scroll_id'];

                    } else {

                        break;
                    }
                }

            }

        }else{
            $data = $es_data;
        }
        
        return $data;
        
    }

    //传播路径数据处理
    public static function handleRoutData($data){

        $from_uuid = array();
        foreach ($data as $art){
            array_push($from_uuid,$art['uuid']);
        }

        if(!empty($from_uuid)){

            $es_params['index'] =  'spread';
            $es_params['type']  = 'spread_route';
            $es_params['size']  = 50;
            $es_params['body']  = array(

                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => [
                                array(
                                    'range' => [
                                        'to.crawler_at' => [
                                            'lte' => Api::getUpdateAt()
                                        ]
                                    ]
                                ),
                                array(
                                    'terms' => [ 'from.uuid' => $from_uuid ]
                                )
                            ]
                        ]
                    ]
                ]

            );
            $es_params['search_type'] = 'scan';
            $es_params['scroll'] = '30s';

            $es_data = Spread::searchEsData($es_params,true);

            $es_uuid = array();
            foreach ($es_data as $value){
                array_push($es_uuid,$value['from']['uuid']);
            }

        }

        $result_data = array();
        if(!empty($es_uuid)){
            foreach ($data as $art){

                if(in_array($art['uuid'],$es_uuid)){
                    array_push($result_data,$art);
                }

            }
        }

        return $result_data;


    }
    
    //批量处理redis
    public static function handleRedis($method,$keys){
        if($method=='del'){
            foreach ($keys as $key){
                Redis::del($key);
            }
        }
        if($method=='expire'){
            foreach ($keys as $key){
                Redis::expire($key,config('app.redis_expire'));
            }
        }

    }

    //数组拆分
    public static function arr_split($arr,$num){

        $count = count($arr);
        for ($i = 0; $i < ($count/$num) ;$i++){
            $result_array[$i] = array_slice($arr,$num*$i,$num);
        }
        
        return $result_array;
        
    }
    
    

    //获取单个事件名称
    public static function getEventName($id){
        
        $event_name = '';
        $rows = Event::where('id',$id)->first();
        if($rows){
            $event_name = $rows->title;
        }else{
            $file = storage_path().'/logs/myLog.log';
            Mylog::saveMylog('event',$file,'事件不存在',array($id));    //写入日志
        }
        
        return $event_name;

    }

    //获取媒体信息
    public static function getMediaInfo($mid){

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
        $es_data = Spread::searchEsData($params);

        $mid_info = array();
        if(count($es_data['hits']['hits']) > 0){
            $source = current($es_data['hits']['hits']);
            $mid_info = $source['_source'];
        }else{
            $file = storage_path().'/logs/myLog.log';
            Mylog::saveMylog('media',$file,'媒体不存在',array($mid));    //写入日志
        }

        return $mid_info;

    }

    //处理文章聚合数据
    public static function articleAggDataHandle($es_data,$result_array=array()){

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
                if(!empty(trim($plat['key']))  && $plat['key'] != '待定' ) {
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
                $media_info = self::getMediaInfo($med['key']);
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
                $res['name'] = self::getEventName($event_id);
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

                //临时处理手动情感面相同文章统计
//                if(isset($emo['uniq'])) {
//                    if ($emo['key'] == '_emo_manual_negative') {
//                        $similar_count['negative'] = self::similarEmotionCount($emo['key']);
//                    } elseif ($emo['key'] == '_emo_manual_positive') {
//                        $similar_count['positive'] = self::similarEmotionCount($emo['key']);
//                    } elseif ($emo['key'] == '_emo_manual_neutral') {
//                        $similar_count['neutral'] = self::similarEmotionCount($emo['key']);
//                    }
//                }

            }

            //临时处理手动情感面相同文章统计
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

    //统计没有from.product_form字段的文章情感文章数,$companyIndex 公司索引
    public static function noProductEmotionArt($companyIndex,$body_params=null){
        
        $es_params['index'] = $companyIndex;
        $es_params['type']  = 'article';
        $es_params['size']  = 0;
        if(!empty($body_params)){
            if (!empty($body_params['query_match'])) {
                $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
            }
            if (!empty($body_params['filter_and'])) {
                $es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];
            }

            if (!empty($body_params['agg_uniq'])) {
                $es_params['body']['aggs']  = array(
                    'noProductCounts' => [
                        'missing' => [
                            'field' => 'from.product_form'
                        ],
                        'aggs' => [
                            'emotionCounts' => [
                                'terms' => [
                                    'field' => 'result_tags',
                                    'include' => '_emo_.*'
                                ],
                                'aggs' => $body_params['agg_uniq']
                            ]
                        ]
                    ]
                );
            }else{
                $es_params['body']['aggs']  = array(
                    'noProductCounts' => [
                        'missing' => [
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
                );
            }
        }else{
            $es_params['body']  = array(
                'query' => [
                    'range' => [
                        'crawler_at' => [
                            'lte' => Api::getUpdateAt()
                        ]
                    ]
                ],
                'aggs' => [
                    'noProductCounts' => [
                        'missing' => [
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
        }

        $es_data = self::searchEsData($es_params);

        $data = array();
        if(!empty($es_data['aggregations']['noProductCounts'])){

            $count=0;
            if(!empty($es_data['aggregations']['noProductCounts']['emotionCounts']['buckets'])){

                foreach ($es_data['aggregations']['noProductCounts']['emotionCounts']['buckets'] as $emotion){
                    if($emotion['key'] != '_emo_manual'){
                        $key = substr($emotion['key'], (strripos($emotion['key'], '_') + 1));
                        $data[$key] = $emotion['doc_count'];
                        $count += $emotion['doc_count'];
                    }
                }

            }
            if(!empty($data)){
                if(!isset($data['neutral'])){
                    $data['neutral'] = 0;
                }
                if(!isset($data['negative'])){
                    $data['negative'] = 0;
                }
                if(!isset($data['positive'])){
                    $data['positive'] = 0;
                }
            }

            if($es_data['aggregations']['noProductCounts']['doc_count'] > $count){
                if(!isset($data['neutral'])){
                    $data['neutral'] = 0;
                }
                if(!isset($data['negative'])){
                    $data['negative'] = 0;
                }
                if(!isset($data['positive'])){
                    $data['positive'] = 0;
                }
                $data['neutral'] += ($es_data['aggregations']['noProductCounts']['doc_count']-$count);
            }

        }

        return $data;
        
    }

    //统计没有from.product_form字段的文章文章数
    public static function noProductArtCount($body_params=null){

        $es_params['index'] = Api::getCompanyIndex();
        $es_params['type']  = 'article';
        if(!empty($body_params)){

            $filter_and = array(
                'missing' => [
                    'field' => 'from.product_form'
                ]
            );

            if (!empty($body_params['query_match'])) {
                $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
            }
            if (!empty($body_params['filter_and'])) {
                $es_params['body']['query']['filtered']['filter']['and'] = $body_params['filter_and'];

                array_push($es_params['body']['query']['filtered']['filter']['and'],$filter_and);

            }else{
                $es_params['body']['query']['filtered']['filter'] = $filter_and;
            }

        }else{
            $es_params['body']  = array(
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'and' => [
                                array(
                                    'range' => [
                                        'crawler_at' => [
                                            'lte' => Api::getUpdateAt()
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

        $es_data = self::searchEsData($es_params,'',1);

        $data = $es_data['count'];


        return $data;

    }

    //记录ES操作日志
    public static function saveEsLog($type,$operation,$params,$e=null){

        $es['input'] = Input::all();
        $es['action'] = \Route::current()->getActionName();
        if(!empty($e)){
            $es['code'] = $e->getCode();
            $es['message'] = $e->getMessage();
            $es['file'] = $e->getFile();
            $es['line'] = $e->getLine();
        }
        $es['url'] = $_SERVER['REQUEST_URI'];
        $es['esUrl'] = config('app.esUrl');
        $es['operation'] = $operation;
        $es['params'] = $params;
        Mylog::getLogger('EsInfo')->$type($es);

    }

    //获取没有情感面文章数
    public static function NoEmotionArticleCount($body_params=null){

        $es_params = [
            'index' => Api::getCompanyIndex(),
            'type'  => 'article',
            'body'  => [
                'query' => [
                    'filtered' => [
                        'filter' => [
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
                        ]
                    ]
                ]
            ]
        ];

        $must = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            )
        );
        if(!empty($body_params)){

            if (!empty($body_params['query_match'])) {
                $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
            }
            if (!empty($body_params['filter_and'])) {
                array_push($must,$body_params['filter_and']);
            }

        }
        $es_params['body']['query']['filtered']['filter']['bool']['must'] = $must;

        $es_data = Spread::searchEsData($es_params,'',1);

        return $es_data['count'];

    }

    //获取没有预警文章数
    public static function NoWarnArticleCount($body_params=null){

        $es_params = [
            'index' => Api::getCompanyIndex(),
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

        $must = array(
            array(
                'range' => [
                    'crawler_at' => [
                        'lte' => Api::getUpdateAt()
                    ]
                ]
            )
        );
        if(!empty($body_params)){

            if (!empty($body_params['query_match'])) {
                $es_params['body']['query']['filtered']['query'] = $body_params['query_match'];
            }
            if (!empty($body_params['filter_and'])) {
                array_push($must,$body_params['filter_and']);
            }

        }
        $es_params['body']['query']['filtered']['filter']['bool']['must'] = $must;

        $es_data = Spread::searchEsData($es_params,'',1);

        return $es_data['count'];

    }

    //统计相似文章数
    public static function similarArcitleCount($title_signs){
        $es_params = [
            'index' => Api::getCompanyIndex(),
            'type'  => 'article',
            'size'  => 0,
            'body'  => [
                'query' =>[
                  'range' => [
                      'crawler_at' => [
                          'lte' => Api::getUpdateAt()
                      ]
                  ]
                ],
                'aggs' => [
                    'similarCount' => [
                        'terms' => [
                            'field' => 'title_sign',
                            'include' => $title_signs,
                            'size'  => 0
                        ]
                    ]
                ]
            ]
        ];
        
        $es_data = self::searchEsData($es_params);
        $data = array();
        if(!empty($es_data['aggregations']['similarCount']['buckets'])){
            foreach ($es_data['aggregations']['similarCount']['buckets'] as $title_sign){
                $key = $title_sign['key'];
                $data[$key] = $title_sign['doc_count'];
            }
        }

        return $data;

    }

//    //临时修复相似文章手动情感面统计
//    public static function similarEmotionCount($manualEmo){
//
//        $article = new ArticleController();
//        $body_params = $article->handleInputData();
//        
//        if(Input::get('user')){
//            $companyIndex = Api::getCompanyIndex();
//        }else{
//            $code = Input::get('code');
//            if(empty($code)){
//                return response()->json(array(
//                    'result' => false
//                ));
//            }
//            $userInfo = Api::getInfoByCode($code);
//            $companyIndex = $userInfo['companyIndex'];
//        }
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
//        $uniq_data = self::searchEsData($uniq_params);
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

        //获取所有相同文章中最早的一篇文章id
        public static function getSimilarEarliestOne($es_params,$size,$m){

//            $uuids = array();
//
//            $uniq_params = $es_params;
//            $uniq_params['size'] = 0;
//            $uniq_params['body']['aggs'] = array(
//                'uniq' => [
//                    'terms' => [
//                        'field' => 'title_sign',
//                        'size'  => 0
//                    ],
//                    'aggs' => [
//                        'uuids' => [
//                            'terms' => [
//                                'field' => 'uuid',
//                                'size' => 1,
//                                'order' => [
//                                    'min_publish' => 'asc'
//                                ]
//                            ],
//                            'aggs' => [
//                                'min_publish' => [
//                                    'min' => [
//                                        'field' => 'publish_at'
//                                    ]
//                                ]
//                            ]
//                        ]
//                    ]
//                ]
//            );
//
//            $uniq_data = self::searchEsData($uniq_params);
//
//            $title_signs = $uniq_data['aggregations']['uniq']['buckets'];
//            if(count($title_signs) > 0) {
//                foreach ($title_signs as $sign) {
//                    array_push($uuids, $sign['uuids']['buckets'][0]['key']);
//                }
//            }
//
//            return $uuids;

            $title_signs = array();

//            $uniq_params['index'] = Api::getCompanyIndex();
//            $uniq_params['type'] = 'article';
            $uniq_params = $es_params;
            $uniq_params['size'] = 0;
            $uniq_params['body']['aggs'] = array(
                'uniq' => [
                    'terms' => [
                        'field' => 'title_sign',
                        'size'  => $size,
                        'order' => [
                            'max_publish' => "desc"
                        ]
                    ],
                    'aggs' => [
                        'max_publish' => [
                            'max' => [
                                'field' => 'publish_at'
                            ]
                        ]
                    ]
                ]
            );

            $uniq_data = self::searchEsData($uniq_params);

            $uniq_signs = $uniq_data['aggregations']['uniq']['buckets'];
            if(count($uniq_signs) > 0) {
                foreach ($uniq_signs as $sign) {
                    array_push($title_signs, $sign['key']);
                }
                $title_signs = array_slice($title_signs,$m);
            }

            return $title_signs;
        }

    //获取相同文章title_sign
    public static function getSimilarTitleSign($es_params,$size,$beg,$order='desc'){

        $title_signs = array();

//            $uniq_params['index'] = Api::getCompanyIndex();
//            $uniq_params['type'] = 'article';
        $uniq_params = $es_params;
        $uniq_params['size'] = 0;
        $uniq_params['body']['aggs'] = array(
            'uniq' => [
                'terms' => [
                    'field' => 'title_sign',
                    'size'  => $size,
                    'order' => [
                        'max_publish' => $order
                    ]
                ],
                'aggs' => [
                    'max_publish' => [
                        'max' => [
                            'field' => 'publish_at'
                        ]
                    ]
                ]
            ]
        );

        $uniq_data = self::searchEsData($uniq_params);

        $uniq_signs = $uniq_data['aggregations']['uniq']['buckets'];
        if(count($uniq_signs) > 0) {
            foreach ($uniq_signs as $sign) {
                array_push($title_signs, $sign['key']);
            }
            $title_signs = array_slice($title_signs,$beg);
        }

        return $title_signs;
    }

    //获取Redis的缓存title_sign,$type类型：emotion_ | del_article_
    public  static function getRedisTitleSign($type){

        $title_signs = array();
        $redis_keys = Redis::keys($type.'*');
        if(!empty($redis_keys)){
            foreach ($redis_keys as $key){
                $title_signs[] = substr($key, strlen($type));
            }
        }
        
        return $title_signs;

    }

}