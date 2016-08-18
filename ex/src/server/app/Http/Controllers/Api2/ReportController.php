<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/8/2
 * Time: 下午4:37
 */

namespace App\Http\Controllers\Api2;

use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\Input;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use App\Model\Report;
use App\Model\ReportEx;
use App\Http\Api;
use App\Model\Event;
use Illuminate\Support\Facades\Redis;
use App\Model\ArticleTags;
use App\Model\StatisDay;
use App\Http\Spread;
use App\Model\Users;
use QrCode;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
class ReportController extends Controller
{
    /**
     * 获取给定时间段内报表总数
     * @return \Illuminate\Http\JsonResponse
     */
    public function reportCount()
    {
        $companyUuid = Api::getCompanyId();
        $beginAt = Input::get('begin_at');
        $endAt = Input::get('end_at');

        $results = Report::where('end_at','>=',$beginAt)
            ->where('end_at','<=',$endAt)
            ->where('company_uuid',$companyUuid)
            ->count();

        return response()->json(
            array('count'=>$results)
        );
    }

    /**
     * 获取报表列表
     * @return \Illuminate\Http\JsonResponse
     */
    public function reports()
    {
        $beginAt = Input::get('begin_at');
        $endAt = Input::get('end_at');
        $beg = Input::get('beg');
        $count = Input::get('count');
        $companyUuid = Api::getCompanyId();
        $userUuid = Api::getCreatorId();
        $cpIndex = Api::getCompanyIndex();

        $results = Report::where('end_at','>=',$beginAt)
                        ->where('end_at','<=',$endAt)
                        ->where('company_uuid',$companyUuid)
                        ->orderBy('end_at','desc')
                        ->skip($beg)
                        ->take($count)
                        ->get();

        $crtIds = array();
        $upIds = array();
        foreach($results as $ret){
            array_push($crtIds,$ret->creator_id);
            array_push($upIds,$ret->updater_id);
        }

        //读火箭熊获取用户名
        $crtRows = Users::whereIn('user_id',$crtIds)->get();
        $upRows = Users::whereIn('user_id',$upIds)->get();
        $creators = Api::setKeyVal($crtRows,'user_id','user_name');
        $ups = Api::setKeyVal($upRows,'user_id','user_name');

        foreach($results as $ret){
//            $code = base64_encode($ret->uuid."&".$cpIndex);
            $code = Crypt::encrypt($ret->uuid."&".$cpIndex.'&'.$userUuid.'&'.$companyUuid);
            $ret['creator'] = $creators[$ret->creator_id];
            $ret['updater'] = isset($ups[$ret->updater_id]) ? $ups[$ret->updater_id] : "";
            $ret['share_url'] = $ret->publish_url.'/'.$code;
        }

        return response()->json(
            $results
        );

    }


    /**
     * 保存日报表数据/更新
     * @return \Illuminate\Http\JsonResponse
     */
    public  function store()
    {
        $companyUuid = Api::getCompanyId();
        $userUuid = Api::getCreatorId();
        $uuid = Input::get('uuid');
        $report = Input::get('info');

        $host = config('app.url');
//        $host = Input::get('host');
        if(isset($uuid)){
            $rptObj = Report::where('uuid',$uuid)->first();
        }else{
            $rptObj = new Report();
            $rptObj->creator_id  = $userUuid;       //创建者
            $rptObj->create_at   = Carbon::now();   //创建时间
            $rptObj->publish_url = $host.'/report_share#';
        }

        $rptObj->title          = Input::get('title');
        $rptObj->begin_at       = Input::get('begin_at');
        $rptObj->end_at         = Input::get('end_at');
        $rptObj->company_uuid   = $companyUuid;
        $rptObj->status         = Input::get('status');
        $rptObj->updater_id     = $userUuid;
        $rptObj->update_at      = Carbon::now();
        $rptObj->save();

//        $newRow = Report::create(array(
//            'title'         => Input::get('title'),
//            'begin_at'      => Input::get('begin_at'),
//            'end_at'        => Input::get('end_at'),
//            'company_uuid'  => $companyUuid,
//            'status'        => Input::get('status'),
//            'creator_id'    => $userUuid,
//            'updater_id'    => $userUuid,
//            'create_at'     => Carbon::now(),
//            'update_at'     => Carbon::now(),
//            'publish_url'   => $host.'publish/report'
//        ));

        if(!isset($uuid)) {
            $uuid = md5($rptObj->id);
            $rptRow = Report::find($rptObj->id);
            $rptRow->uuid = $uuid;
            $rptRow->save();

            $exRow = ReportEx::create(array(
                'report_uuid'   => $uuid,
                'info'          => json_encode($report),
                'version'       => Input::get('version'),
                'create_at'     => Carbon::now()
            ));
        }else{
            $exRow = ReportEx::where('report_uuid', $uuid)
                ->update([
                    'info'          => json_encode($report),
                    'version'       => Input::get('version'),
                ]);
        }

        Log::info('保存日报表数据/更新。[companyUuid:'.$companyUuid.'] [uuid:'.$userUuid.'] [reportUuid:'.$uuid.'] ');

        return response()->json(
            array(
                'result' => true,
                'uuid' =>$uuid
            )
        );
    }


    //发布报表
    public  function pubReport()
    {
        $uuid = Input::get('uuid');
        $userUuid = Api::getCreatorId();
//        $cpIndex = Api::getCompanyIndex();
//        $rptObj = Report::where('uuid',$uuid)->first();
//
//        $rptObj->status      = 3;
//        $rptObj->update_at   = Carbon::now();
//        $rptObj->updater_id  = $userUuid;
//        $rptObj->save();
        $rptRow = Report::where('uuid', $uuid)
                    ->update([
                        'status'     => 3,
                        'update_at'  => Carbon::now(),
                        'updater_id' => $userUuid,
                        'share_url' => $userUuid,
                    ]);

//        $code = Crypt::encrypt($rptObj->uuid."&".$cpIndex);

        Log::info('发布报表。[companyUuid:'.Api::getCompanyId().'] [uuid:'.$userUuid.'] [reportUuid:'.$uuid.'] ');

        return response()->json(
            array(
                'result' => $rptRow ? true : false,
//                'share_url' => $rptObj->publish_url.'/'.$code
            )
        );
    }


    //获取报表
    public function report()
    {
        $uuid = Input::get('uuid');

        $returns = $this->getReport($uuid,null,false);
        
        return response()->json(array(
            'result'=> $returns ? true : false,
            'data'  => $returns
        ),$returns ? 200 : 410);
    }

    //删除报表
    public function del()
    {
        $uuid = Input::get('uuid');
        $ret = Report::where('uuid',$uuid)->delete();
        $retEx = ReportEx::where('report_uuid',$uuid)->delete();

        Log::info('删除报表。[companyUuid:'.Api::getCompanyId().'] [uuid:'.Api::getCreatorId().'] [reportUuid:'.$uuid.'] ');

        return response()->json(array('result' => true));
    }


    public function qrCode()
    {
        $uuid = Input::get('uuid');
        $token = Input::get('user_token');
        $user = json_decode(Redis::get('token_'.$token));
        $cpIndex = $user->company->es_index;
        $userId = $user->uuid;
        $cpUuid = $user->company_uuid;

        $code = Crypt::encrypt($uuid."&".$cpIndex."&".$userId.'&'.$cpUuid);


        $rptRow = Report::where('uuid',$uuid)->first();
        $url = $rptRow->publish_url.'/'.$code;

        $qrCode = QrCode::format('png')->size(162)->generate($url);


        return response($qrCode)
            ->header('Content-Type', 'image/png');
    }

    public function share()
    {
        $code = Input::get('code');
//        $codeStr = base64_decode($code);
//        $codeStr = Crypt::decrypt($code);
//        $params = explode('&',$codeStr);
//        $uuid = $params[0];
//        $cpIndex = $params[1];
        $info = Api::getInfoByCode($code);
        $uuid = $info['uuid'];
        $cpIndex = $info['companyIndex'];
        $userId = $info['userId'];

        $returns = $this->getReport($uuid,$cpIndex,true);


        return response()->json(array(
            'result'=> $returns ? true : false,
            'data'  => $returns
        ),$returns ? 200 : 410);
    }


    /**
     * 根据uuid获取报表数据
     * @param $uuid
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReport($uuid,$cpIndex,$isShare)
    {

        $code = '';
        $cpIndex = $cpIndex;
        if(!$isShare){
            $cpIndex = Api::getCompanyIndex();
            $userId = Api::getCreatorId();
            $cpUuid = Api::getCompanyId();
            $code = Crypt::encrypt($uuid."&".$cpIndex.'&'.$userId.'&'.$cpUuid);
        }

        $returns = array();
        $rptRows = Report::where('uuid',$uuid)->first();

        if(!$rptRows){
            return false;
        }

        $rptExRows = ReportEx::where('report_uuid',$uuid)->first();
        $userRow = Users::where('user_id',$rptRows->creator_id)->first();



        $returns['uuid'] = $uuid;
        $returns['version'] = $rptExRows->version;
        $returns['title'] = $rptRows->title;
        $returns['begin_at'] = $rptRows->begin_at;
        $returns['end_at'] = $rptRows->end_at;
        $returns['status'] = $rptRows->status;
        $returns['creator'] = $userRow->user_name;
        $returns['share_url'] = $rptRows->publish_url.'/'.$code;

        $report = json_decode($rptExRows['info']);
        $returns['info'] = $report;
        $articles = isset($report->focus_articles) ? $report->focus_articles : [];

        $artIds = array();
        $artSims = array();
        foreach($articles as $art){
            if(isset($art->uuid) && isset($art->similar_count)) {
                array_push($artIds, $art->uuid);
                $artSims[$art->uuid] = $art->similar_count;
            }
        }

        if(isset($artIds) && count($artIds) > 0) {
            $data = array(
                'http_errors' => false,
                'json' => [
                    "query" => [
                        "terms" => [
                            'uuid' => $artIds,
                        ]
                    ]
                ]
            );

            $url = $cpIndex . '/article/_search/?pretty -d';
            $resp = Api::execEsApi("GET", $url, $data);

            $artIdList = array();
            $titleSigns = array();
            $returns['info']->focus_articles = $artIdList;
            if(isset($resp->hits->hits)) {
                $arts = $resp->hits->hits;
                if (count($arts) > 0) {
                    foreach ($arts as $art) {
                        $item = $art->_source;
                        $resultTags = $item->result_tags;

                        //存在负面标签
                        if (in_array('_emo_manual', $resultTags) && in_array('_emo_negative',$resultTags)) {
                            $rtObj['uuid'] = $item->uuid;
                            $rtObj['title'] = $item->link_title;
                            $rtObj['url'] = $item->url;
                            $rtObj['publish_at'] = $item->publish_at;
                            $rtObj['from']['media'] = $item->from->media;
                            $rtObj['from']['platform_name'] = isset($item->from->platform->name) ? $item->from->platform->name : '';
                            $rtObj['emotion'] = "manual_negative";
                            $rtObj['title_sign'] = $item->title_sign;
//                            $rtObj['similar_count'] = $artSims[$item->uuid];
                            $artIdList[$item->uuid] = $rtObj;
//                            array_push($artAry, $rtObj);
                            array_push($titleSigns,$item->title_sign);
                        }
                    }

                    //排序
                    $artAry = array();
                    foreach($artIds as $artId){
                        if(isset($artIdList[$artId])){
                            array_push($artAry, $artIdList[$artId]);
                        }
                    }



                    $params = array(
                        'http_errors' => false,
                        'json' => [
                            'aggs' => [
                                'similarCount' => [
                                    'terms' => [
                                        'field' => 'title_sign',
                                        'include' => $titleSigns,
                                        'size'  => 0
                                    ]
                                ]
                            ],
                            'query' => [
                                'range' => [
                                    'crawler_at' => [
                                        'lte' => Api::getReportAt($uuid)
                                    ]
                                ]
                            ],
                        ]
                    );
                    $ctUrl = $cpIndex . '/article/_search/?pretty -d';
                    $resp = Api::execEsApi("GET", $ctUrl, $params);
                    $simMap = array();
                    if(isset($resp->aggregations->similarCount->buckets)){
                        foreach($resp->aggregations->similarCount->buckets as $item){
                            $simMap[$item->key] = $item->doc_count;
                        }
                    }

                    $articles = array();
                    foreach($artAry as $art){
                        $art['similar_count'] = $simMap[$art['title_sign']] - 1;
                        array_push($articles,$art);
                    }

                    $returns['info']->focus_articles = $articles;
                }
            }
        }

        return $returns;
    }

    /**
     * 获取报表状态,是否可编辑
     * @return \Illuminate\Http\JsonResponse
     */
    public function status()
    {
        $uuid = Input::get('uuid');
        $data = Redis::get('report_'.$uuid);

        return response()->json(
            array(
                'result' => $data ? false : true
            )
        );
    }

    //编辑报表
    public function edit()
    {
        $uuid = Input::get('uuid');
        if(!$uuid){
            return response()->json(
                array(
                    'result' => false,
                    'msg' => '无报表uuid'
                )
            );
        }
        $params['edit'] = true;
        Redis::set('report_'.$uuid,json_encode($params));
        Redis::expire('report_'.$uuid,60);
        return response()->json(
            array(
                'result' => true
            )
        );
    }

    public function editOk()
    {
        $uuid = Input::get('uuid');
        Redis::del('report_'.$uuid);

        return response()->json(
            array(
                'result' => true
            )
        );
    }
}