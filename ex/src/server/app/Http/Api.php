<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/3/17
 * Time: 上午11:08
 */
namespace App\Http;
use Illuminate\Support\Facades\Input;
use GuzzleHttp;
use App\Model\ArticleTags;
use App\Model\Report;
use App\Model\Event;
use StdClass;
use App\Http\Spread;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;
class Api
{
    public static function getInfoByCode($code)
    {
        $codeStr = Crypt::decrypt($code);
        $params = explode('&',$codeStr);

        $uuid = $params[0];
        $cpIndex = $params[1];
        $userId = $params[2];
        $companyUuid = $params[3];

        return array(
            'companyIndex' => $cpIndex,
            'uuid'  => $uuid,
            'userId' => $userId,
            'companyUuid' => $companyUuid
        );
    }

    public static function createCode($code)
    {

    }

    public static function getCompanyId()
    {
        $user = Input::get('user');
//        return 4;
        return $user->company_uuid;
//        return 2;
    }

    public static function getCompany()
    {
        $user = Input::get('user');
        return $user->company;
    }

    public static function getCompanyIndex()
    {
        $user = Input::get('user');
        return $user->company->es_index;
    }

    public static function getCreatorId()
    {
        $user = Input::get('user');
        return $user->uuid;
    }

    public static function getReportAt($uuid)
    {
        $reportAt = Redis::get('report_at_'.$uuid);
        if(!$reportAt){
            $reportAt = Carbon::now()->subMinute()->toDateTimeString();

            Redis::set('report_at_'.$uuid,$reportAt);
            Redis::expire('report_at_'.$uuid,60);
        }

        return $reportAt;
    }

    public static function getUpdateAt()
    {
        $user = Input::get('user');
        $update_at = substr($user->update_at, 0, strripos($user->update_at, '.'));
        return $update_at;
    }

    public static function setKeyAry($array, $ky, $val)
    {
        $returnAry = array();
        foreach ($array as $ret) {
            $key = $ret->$ky;
            //分类存在
            if (isset($returnAry[$key])) {
                array_push($returnAry[$key], $ret->$val);
            } else {
                $subAry = array();
                array_push($subAry, $ret->$val);

                //建立分类key对应标签数组
                $returnAry[$key] = $subAry;
            }

        }

        return $returnAry;
    }


    public static function setKeyVal($array, $ky, $val)
    {
        $returnAry = array();
        foreach ($array as $ret) {
            $key = $ret->$ky;
            $returnAry[$key] = $ret->$val;
        }

        return $returnAry;
    }


    public static function execEsApi($method, $url, $postData = null)
    {
        $esUrl = config('app.esUrl');
        $client = new GuzzleHttp\Client(['base_uri' => $esUrl]);

        try {
            if ($postData) {
                $response = $client->request($method, $url, $postData);
            } else {
                $response = $client->request($method, $url);
            }
            //记录Es日志
            Spread::saveEsLog('info', $method . ' ' . $url, $postData);

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $postData['error_info'] = $e->getResponse()->getBody()->getContents();
            //记录Es日志
            Spread::saveEsLog('error', $method . ' ' . $url, $postData, $e);
            if ($e->getCode() == '404') {
                return 450;
            } else {
                throw $e;
            }
        }

        return json_decode($response->getBody());
    }


    public static function execGroutApi($method, $url, $postData = null)
    {
        $cwUrl = config('app.cwUrl');
        $client = new GuzzleHttp\Client(['base_uri' => $cwUrl]);

        if ($postData) {
            $response = $client->request($method, $url, $postData);
        } else {
            $response = $client->request($method, $url);
        }

        return json_decode($response->getBody());
    }


    //查询es文章,根据格式返回,is_array表示原始数据是否为数组
    public static function formatArticle($art, $is_array = false)
    {
        $companyUuid = Api::getCompanyId();
        $rtObj = [];
        if ($is_array == true) {
            $item = $art['_source'];
            $rtTags = $item['result_tags'];
        } else {
            $item = $art->_source;
            $rtTags = $item->result_tags;
        }

        //图片url转换
        if ($is_array == false) {
            if (isset($item->from->tags) && in_array('_cat_weixin', $item->from->tags) && !empty($item->imgs)) {               //微信
                $item->imgs = self::imgConvert($item->imgs, 'weixin');
            } elseif (isset($item->from->platform->name) && $item->from->platform->name == '百度百家' && !empty($item->imgs)) {  //百度
                $item->imgs = self::imgConvert($item->imgs, 'baidu');
            }
        } else {
            if (isset($item['from']['tags']) && in_array('_cat_weixin', $item['from']['tags']) && !empty($item['imgs'])) {                 //微信    
                $item['imgs'] = self::imgConvert($item['imgs'], 'weixin');
            } elseif (isset($item['from']['platform']['name']) && $item['from']['platform']['name'] == '百度百家' && !empty($item['imgs'])) {    //百度
                $item['imgs'] = self::imgConvert($item['imgs'], 'baidu');
            }
        }

        //无图片时采用媒体头像
        if ($is_array == false) {
            if (empty($item->imgs) && !empty($item->from->mid)) {
                $item->imgs = array();
                $media_info = Spread::getMediaInfo($item->from->mid);
                if (!empty($media_info['avater'])) {
                    array_push($item->imgs, $media_info['avater']);
                }
            }
        } else {
            if (empty($item['imgs']) && !empty($item['from']['mid'])) {
                $item['imgs'] = array();
                $media_info = Spread::getMediaInfo($item['from']['mid']);
                if (!empty($media_info['avater'])) {
                    array_push($item['imgs'], $media_info['avater']);
                }
            }
        }

        foreach ($item as $key => $val) {
            if ($key == 'link_title') {
                $rtObj['title'] = $val;
            }
            //过滤下划线
            if ($key == 'tags') {
                foreach ($val as $k => $v) {
                    if (substr($v, 0, 1) == '_') {
                        unset($val[$k]);
                    }
                }
                $val = array_values($val);
            }

            //平台信息
            if ($key == 'from') {
                foreach ($val as $k => $v) {
                    if ($k == 'platform') {
                        if ($is_array == true) {
                            unset($val['platform']);
                            if ($item['from']['media'] == $v['name']) {
                                $val['platform_name'] = '';
                            } else {
                                $val['platform_name'] = $v['name'];
                            }
                        } else {
                            unset($val->platform);
                            if ($item->from->media == $v->name) {
                                $val->platform_name = '';
                            } else {
                                $val->platform_name = $v->name;
                            }
                        }
                    }
                }
            }


            $rtObj[$key] = $val;
        }

        $rtObj['dependent'] = true;
//            $rtObj['similar_articles'] = $item->similar_articles;
        //返回文章报表
        $uuid = $is_array == true ? $item['uuid'] : $item->uuid;
        $artRes = ArticleTags::where('article_uuid', $uuid)
            ->where('company_uuid', $companyUuid)
            ->where('tag', 'report')
            ->get();
        if (count($artRes) > 0) {
            $rptIds = array();
            foreach ($artRes as $row) {
                array_push($rptIds, $row->value);
            }

            $rptRows = Report::where('company_uuid', $companyUuid)
                ->whereIn('id', $rptIds)
                ->get();
            $rptAry = array();
            foreach ($rptRows as $row) {
                $rptObj['id'] = $row->id;
                $rptObj['title'] = $row->title;
                $rptObj['title_at'] = $row->title_at;
                array_push($rptAry, $rptObj);
            }
            $rtObj['reports'] = $rptAry;
        }

        $catIds = array();
        $evtIds = array();      //事件id数组
        $keys = array();
        foreach ($rtTags as $tag) {
            switch ($tag) {
                case strstr($tag, '_cat_'):
                    array_push($catIds, substr($tag, 5));
                    break;
                case strstr($tag, '_emo_'):
                    if(in_array($tag,array('_emo_positive','_emo_neutral','_emo_negative'))){
                        $rtObj['emotion'] = substr($tag, 5);
                        if(in_array('_emo_manual',$rtTags)){
                            $rtObj['emotion'] = 'manual_'.$rtObj['emotion'];
                        }
                    }
                    break;
                case strstr($tag, '_warn_'):
                    if (strstr($tag, 'manual')) {
                        $rtObj['warn'] = 'warn_manual';
                    } else {
                        $rtObj['warn'] = 'warn';
                    }
                    break;
                case strstr($tag, '_evt_'):
                    array_push($evtIds, substr($tag, 5));
                    break;
                case strstr($tag, '_key_'):
                    array_push($keys, substr($tag, 5));
                    break;
                case strstr($tag, '_def_not_me'):
                    $rtObj['dependent'] = false;
                    break;
            }
        }

        //事件标签
        if (count($evtIds) > 0) {
            $evtNames = array();
            $rows = Event::whereIn('id', $evtIds)->get();

            foreach ($rows as $row) {
                $evtObj['id'] = $row->id;
                $evtObj['title'] = $row->title;
                array_push($evtNames, $evtObj);
            }

            $rtObj['events'] = $evtNames;
        }
        //命中关键字
        if (count($keys) > 0) {
            $rtObj['keys'] = $keys;
        }

        return $rtObj;
    }

//    //查询es文章数组结果,根据格式返回
//    public static function array_formatArticle($art)
//    {
//        $companyUuid = Api::getCompanyId();
//        $rtObj = [];
//        $item = $art['_source'];
//        $rtTags = $item['result_tags'];
//
//        foreach($item as $key=>$val){
//            if($key == 'link_title'){
//                $rtObj['title'] = $val;
//                continue;
//            }
//            //过滤下划线
//            if($key == 'tags'){
//                foreach($val as $k=>$v){
//                    if(substr($v,0,1) == '_'){
//                        unset($val[$k]);
//                    }
//                }
//                $val = array_values($val);
//            }
//
//            //平台信息
//            if($key == 'from'){
//                foreach($val as $k=>$v){
//                    if($k == 'platform'){
//                        unset($val[$k]);
//                        $val['platform_name'] = $v['name'];
//                    }
//                }
//            }
//
//            //微信图片url转换
//            if($key == 'imgs' && isset($item['from']['tags']) && in_array('_cat_weixin',$item['from']['tags']) && !empty($val)){
//                foreach ($val as $img){
//                    $img_array[] = $_SERVER['HTTP_HOST'].'/'.config('app.weixin_img_url').$img;
//                }
//                $val = $img_array;
//            }
//
//
//            $rtObj[$key] = $val;
//        }
//
//        $rtObj['dependent'] = true;
////            $rtObj['similar_articles'] = $item->similar_articles;
//        //返回文章报表
//        $artRes = ArticleTags::where('article_uuid',$item['uuid'])
//            ->where('company_uuid',$companyUuid)
//            ->where('tag','report')
//            ->get();
//        if(count($artRes)>0) {
//            $rptIds = array();
//            foreach ($artRes as $row) {
//                array_push($rptIds, $row->value);
//            }
//
//            $rptRows = Report::where('company_uuid',$companyUuid)
//                ->whereIn('id',$rptIds)
//                ->get();
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
//                    $rtObj['warn'] = 'warn';
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

    //数组转对象
    public static function array2object($arr)
    {

        $obj = new StdClass();
        foreach ($arr as $key => $val) {
            $obj->$key = $val;
            if (gettype($obj->$key) == 'array') {
                $obj->$key = Api::array2object($obj->$key);
            }
        }

        return $obj;

    }

    //等级转换
    public static function getRank($influence)
    {

        if ($influence < 1000) {
            $rank = 4;
        } elseif ($influence >= 1000 && $influence < 10000) {
            $rank = 3;
        } elseif ($influence >= 10000 && $influence < 20000) {
            $rank = 2;
        } else {
            $rank = 1;
        }


        return 5 - $rank;   //临时适配前端反向关注

    }

    //判断多维数组是否存在某个值
    public static function deep_in_array($value, $array)
    {
        foreach ($array as $item) {
            if (!is_array($item)) {
                if ($item == $value) {
                    return true;
                } else {
                    continue;
                }
            }
            if (in_array($value, $item)) {
                return true;
            } else if (self::deep_in_array($value, $item)) {
                return true;
            }
        }
        return false;
    }

    //图片路径转换
    public static function imgConvert($imgs, $type)
    {

        $url_base = url()->previous();
        $tempu = parse_url($url_base);
        $host = $tempu['host'];
        foreach ($imgs as $img) {
            $img_array[] = 'http://' . $host . '/' . config('app.' . $type . '_img_url') . $img;
        }

        return $img_array;

    }

    //限制字数
    public static function msubstr($str, $start = 0, $length, $charset = "utf-8", $suffix = true)
    {
        if (function_exists("mb_substr"))
            $slice = mb_substr($str, $start, $length, $charset);
        elseif (function_exists('iconv_substr')) {
            $slice = iconv_substr($str, $start, $length, $charset);
        } else {
            $re['utf-8'] = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xff][\x80-\xbf]{3}/";
            $re['gb2312'] = "/[\x01-\x7f]|[\xb0-\xf7][\xa0-\xfe]/";
            $re['gbk'] = "/[\x01-\x7f]|[\x81-\xfe][\x40-\xfe]/";
            $re['big5'] = "/[\x01-\x7f]|[\x81-\xfe]([\x40-\x7e]|\xa1-\xfe])/";
            preg_match_all($re[$charset], $str, $match);
            $slice = join("", array_slice($match[0], $start, $length));
        }

        return ($suffix && (mb_strlen($str, $charset) > $length)) ? $slice . '...' : $slice;
    }

    //清除html未闭合标签
    public static function cleartags($string)
    {
        $result = $string;
        $beg_count = substr_count($string,'<e');
        $end_count = substr_count($string,'m>');
        if($beg_count == $end_count){
            return $result;
        }

        $result = substr($string,0,strripos($string,'<e'));

        return $result;
    }


}