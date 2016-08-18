<?php

namespace App\Http\Controllers\Api;

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
use Illuminate\Support\Facades\Log;
class ReportController extends Controller
{
    public  function reports()
    {
        $month = Input::get('month');
        $companyUuid = Api::getCompanyId();
        $monthStart = Carbon::createFromFormat('Y-m',$month)->startOfMonth();
        $monthNow = Carbon::now()->format('Y-m');
        if($month == $monthNow){
            $monthEnd = Carbon::now()->endOfDay();
        }else{
            $monthEnd = Carbon::createFromFormat('Y-m',$month)->endOfMonth();
        }

        $results = Report::where('title_at','>=',$monthStart)
                         ->where('title_at','<',$monthEnd)
                        ->where('company_uuid',$companyUuid)
                        ->get();

        $returns = array();
        $rptTitles = Api::setKeyVal($results,'title_at','title');
        $rptIds = Api::setKeyVal($results,'title_at','id');
        $rptSts = Api::setKeyVal($results,'title_at','status');
        for($date = $monthEnd; $date->gte($monthStart); $date->subDay()) {
            $rpt = array();
            $dt =  $date->format('Y-m-d');

            if(isset($rptTitles[$dt])){
                $rpt['title'] = $rptTitles[$dt];        //报告标题
                $rpt['title_at'] = $dt;                 //报告事件
                $rpt['id'] = $rptIds[$dt];              //报告id
                $rpt['status'] = $rptSts[$dt];
            }else{
                //创建新报告
                $newRow = Report::create(array(
                    'title' => '未命名',
                    'title_at' => $dt,
                    'company_uuid' => $companyUuid,
                    'creator_id' => Api::getCreatorId(),
                    'create_at' => Carbon::now(),
                    'status' => 2
                ));

                $rpt['title'] = '未命名';
                $rpt['title_at'] = $dt;
                $rpt['id'] = $newRow->id;
                $rpt['status'] = 2;
            }

            array_push($returns,$rpt);
        }

//        $retAry = array();
//        foreach($results as $res){
//            array_push($retAry,$res->formatToApi());
//        }

        return response()->json(
            $returns
        );
    }

    public  function getIndex()
    {
        $day = Input::get('day');
        if(empty($day)){
            return response()->json('日期不能为空');
        }else{
            $from = $day.' 00:00:00';
            $now = Carbon::now()->format('Y-m-d');
            if($now == $day){
                $to = Carbon::now()->toDateTimeString();
            }else{
                $to = $day.' 23:59:59';
            }
        }
        $companyUuid = Api::getCompanyId();
        $companyIndex = Api::getCompanyIndex();
        $rptRes = Report::where('company_uuid',$companyUuid)
                        ->where('title_at',$day)->first();

        //查询情感文章数
        $emotion['positive'] = 0;
        $emotion['negative'] = 0;
        $emotion['neutral'] = 0;
        $params = [
            'index' => Api::getCompanyIndex(),
            'type'  => 'article',
            'size'  => 0,
            'body'  => [
                'query' => [
                    'bool' => [
                        'must' => [
                            array(
                                'range' => [
                                    'publish_at' => [
                                        'from' => $from,
                                        'to' => $to
                                    ]
                                ]
                            ),
                            array(
                                'range' => [
                                    'crawler_at' => [
                                        'lte' => Api::getUpdateAt(),
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

        $es_data = Spread::searchEsData($params);
        if(!empty($es_data['aggregations']['emotionCounts']['buckets'])){
            foreach ($es_data['aggregations']['emotionCounts']['buckets'] as $emo){
                $key = substr($emo['key'],(strrpos($emo['key'],'_')+1));
                $emotion[$key] = $emo['doc_count'];
            }
        }

        $reportDay = array();
        if(!is_null($rptRes)){
            $rptExRes = ReportEx::where('report_id',$rptRes->id)->first();

//            $reportDay = $rptRes->formatToApi();
//            if(!is_null($rptExRes)){
//                $reportDay['version'] = $rptExRes->version;
//            }
//            if(is_null($rptExRes)){
//                ReportEx::create(array(
//                    'report_id' => $rptRes->id,
//                    'info' => json_encode('{"events":[],"summary":{"event_index":"1","event_desc":""},"focus_articles":[],"articles_statis":[],"title":"\u672a\u547d\u540d","artTrend":[],"version":1,"date":"2016-04-22","status":2}'),
//                    'version' => 1,
//                    'create_at' => Carbon::now()
//                ));
//            }else {
                $reportDay = json_decode($rptExRes['info']);
//            }
            if(!empty($reportDay)){
                $reportDay->articles_statis = $emotion;
            }

        }



        if(!count($reportDay) > 0){
            $reportDay['title']  = $rptRes->title;
            $reportDay['date']  = $rptRes->title_at;
            $reportDay['version']  = 1;

//            $dayRows = StatisDay::where('type',5)
//                ->where('st_id',$companyIndex)
//                ->where('record_at',$day)
//                ->get();
//
//            $rtObj = array();
//            foreach($dayRows as $row){
//                if($row->name == 'article_positive_cnt'){
//                    $rtObj['positive'] = $row->value;
//                }
//                else if($row->name == 'article_neutral_cnt'){
//                    $rtObj['neutral'] = $row->value;
//                }
//                else if($row->name == 'article_negative_cnt'){
//                    $rtObj['negative'] = $row->value;
//                }
//            }

            $reportDay['articles_statis']  = $emotion;

        }

        return response()->json(
            $reportDay
        );

    }

    public  function reportData()
    {
        $day = Input::get('day');
        $userToken = Input::get('user_token');
        $user = json_decode(Redis::get('token_'.$userToken));
        $companyUuid = $user->company_uuid;
        $rptRes = Report::where('company_uuid',$companyUuid)
                        ->where('title_at',$day)->first();

        $reportDay = array();
        if(!is_null($rptRes)){
            $rptExRes = ReportEx::where('report_id',$rptRes->id)->first();
            $reportDay = json_decode($rptExRes['info']);
        }

        return response()->json(
            $reportDay
        );
    }

    //保存日报表数据
    public  function putIndex()
    {
        $this->saveReport(2);
    }


    //提交报表
    public  function putSubmit()
    {
        $this->saveReport(3);
    }

    public function saveReport($status){
        $report = Input::get('report');
        $companyUuid = Api::getCompanyId();

        $rptDate = $report['date'];
        //日报表是否存在
        $rptRow = Report::where('title_at',$rptDate)
                        ->where('company_uuid',$companyUuid)
                        ->first();

        //更新标题
        $upRpt = Report::where('title_at',$rptDate)
                    ->update(array(
                        'title' => $report['title'],
                        'status' => $status
                    ));

        //日报表不存在,保存报表
        if(is_null($rptRow)) {
            $rptRow = Report::create(array(
                'title' => $report['title'],
                'title_at' => $report['date'],
                'company_uuid' => $companyUuid,
                'status' => $status
            ));

            ReportEx::create(array(
                'report_id' => $rptRow->id,
                'info' => json_encode($report),
                'version' => $report['version'],
                'create_at' => Carbon::now()
            ));

            Log::info('新建报表。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [info:'.json_encode($report).']');
            
        }else{
            $rptExRow = ReportEx::where('report_id',$rptRow->id)->first();
            if(is_null($rptExRow)){
                ReportEx::create(array(
                    'report_id' => $rptRow->id,
                    'info' => json_encode($report),
                    'version' => $report['version'],
                    'create_at' => Carbon::now()
                ));
            }else{
                //报表已存在保存info
                $upRow = ReportEx::where('report_id',$rptRow->id)
                    ->update(array(
                        'info' => json_encode($report)
                    ));
            }

            Log::info('保存报表。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [info:'.json_encode($report).']');
            
        }

        return response()->json(
            ['result'=>true]
        );
    }


    public  function getArticles()
    {

        $companyUuid = Api::getCompanyId();
        $date = Input::get('day');
        $cpIndex = Api::getCompanyIndex();
        $row = Report::where('title_at',$date)
                    ->where('company_uuid',$companyUuid)
                    ->first();

        $returns = array();
        if($row){
            $tagRows = ArticleTags::where('company_uuid',$companyUuid)
                        ->where('tag','report')
                        ->where('value',$row->id)
                        ->get();



            if(count($tagRows) > 0){
                $artIds = array();
                foreach($tagRows as $row){
                    array_push($artIds,$row->article_uuid);
                }

                $postData = array(
                    'http_errors' => false,
                    'json'=>[
                        "filter" => [
                            'and' => [
                                array(
                                    'range' => [
                                        'crawler_at' => [
                                            'lte' => Api::getUpdateAt()
                                        ]
                                    ]
                                ),
                                array(
                                    "terms" =>[
                                        'uuid'=>$artIds
                                    ]
                                )
                            ]
                        ]
                    ]
                );

                $url = $cpIndex.'/article/_search/?pretty -d';
                $resp = Api::execEsApi('get',$url,$postData);

                if(isset($resp->hits->hits)) {
                    $arts = $resp->hits->hits;

                    foreach ($arts as $art) {
                        $item = $art->_source;
                        $rtObj['title'] = $item->link_title;
                        $rtObj['url'] = $item->url;
                        $rtObj['uuid'] = $item->uuid;
                        if(property_exists($item,'author')){
                            $rtObj['author'] = $item->author;
                        }
                        $rtObj['create_at'] = $item->publish_at;
                        $rtObj['from'] = $item->from;
                        $rtObj['from_text'] = $item->from->media;
                        $rtObj['content'] = $item->content;

                        $const = config('const');
                        foreach($item->result_tags as $tag){
                            if(strstr($tag, '_emo_') && isset($const['emotion'][$tag])){
                                $rtObj['emotion'] = $const['emotion'][$tag];
                            }
                        }

                        array_push($returns, $rtObj);
                    }

                    return response()->json($returns);
                }
            }
        }

        return response()->json($returns);
    }

    public  function getData()
    {
        return response()->json(
            [
                "keywords" => ["keyword1","keyword1"],
                "articles_statis" => [
                    'positive'=> 123,
                    'neutral'=>  456,
                    "negative"=> 789
                ]
            ]
        );
    }

    public  function getMonth()
    {
        $companyUuid = Api::getCompanyId();
        $results = Report::where('company_uuid',$companyUuid)
                    ->orderBy('title_at','desc')
                    ->get();
        $titleAts = array();
        foreach($results as $res){
            array_push($titleAts,substr($res->title_at,0,7));
        }

        $titleAts = array_unique($titleAts);
        $rts = array();
        foreach($titleAts as $titleAt){
            array_push($rts,$titleAt);
        }

        if(count($rts) == 0){
            $rts[] = Carbon::now()->format('Y-m');
        }
        return response()->json($rts);
    }

    //获取近7天报表
    public  function getRecent()
    {
        $companyUuid = Api::getCompanyId();
        $now = Carbon::now()->endOfDay();
        $weekBef = Carbon::now()->startOfDay()->subDays(6);

        $results = Report::where('title_at','>=',$weekBef)
                        ->where('title_at','<',$now)
                        ->where('company_uuid',$companyUuid)
                        ->get();

        $rptTitles = Api::setKeyVal($results,'title_at','title');
        $rptIds = Api::setKeyVal($results,'title_at','id');
        $returns = array();
        for($date = $now->subDay(); $date->gte($weekBef); $date->subDay()) {
            $rpt = array();
            $dt =  $date->format('Y-m-d');

            if(isset($rptTitles[$dt])){
                $rpt['title'] = $rptTitles[$dt];        //报告标题
                $rpt['title_at'] = $dt;                 //报告事件
                $rpt['id'] = $rptIds[$dt];              //报告id
            }else{
                //创建新报告
                $newRow = Report::create(array(
                    'title' => '未命名',
                    'title_at' => $dt,
                    'company_uuid' => $companyUuid,
                    'creator_id' => Api::getCreatorId(),
                    'create_at' => Carbon::now(),
                    'status' => 2
                ));

                $rpt['title'] = '未命名';
                $rpt['title_at'] = $dt;
                $rpt['id'] = $newRow->id;
            }

            array_push($returns,$rpt);
        }

        return response()->json($returns);
    }

    public  function events()
    {
        $day = Input::get('day');
        $cpIndex = Api::getCompanyIndex();
        $companyUuid = Api::getCompanyId();
        $dayStart = Carbon::createFromFormat('Y-m-d',$day)->startOfDay()->toDateTimeString();
        $endStart = Carbon::createFromFormat('Y-m-d',$day)->endOfDay()->toDateTimeString();
        if($day == Carbon::now()->format('Y-m-d')){
            $endStart = Api::getUpdateAt();
        }
        $postData = array(
            'http_errors' => false,
            'json'=>[
                "filter"=> [
                    "range" =>[
                        'crawler_at'=>[
                            'from'=>$dayStart,
                            'to' =>$endStart
                        ]
                    ]
                ],
                "aggs" => [
                    "group_by_state" => [
                        "terms" => [
                            "field"=> "result_tags",
                            "size"=>0
                        ]
                    ]

                ]
            ]
        );

        $url = $cpIndex.'/article/_search/?pretty -d';
        $resp = Api::execEsApi('post',$url,$postData);
        $returns = array();
        if(isset($resp->aggregations->group_by_state->buckets)){
            $evtIds = array();
            $res = $resp->aggregations->group_by_state->buckets;
            $evtArts = array();
            foreach($res as $rt){
                if(strstr($rt->key,'_evt_')){
                    $evtArts[substr($rt->key,5)] = $rt->doc_count;
                    array_push($evtIds,substr($rt->key,5));
                }
            }

            $evtRows = Event::where('company_uuid',$companyUuid)
                            ->whereIn('id',$evtIds)
                            ->where('status',1)
                            ->get();

            foreach($evtRows as $row){
                $row['article_count'] = $evtArts[$row->id];

                array_push($returns,$row);
            }
//            $returns = $evtRows;
        }

//        $events = Event::all();

        return response()->json(
            $returns
        );
    }


    public  function download()
    {
        putenv("PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs");
//        putenv("DYLD_LIBRARY_PATH");?
//        $day = Input::get('day');
//        $baseUrl = config('app.url');
//        $url = $baseUrl.'report_download';
          echo exec('casperjs --version',$b);
        echo exec('php -v',$a);
//        var_dump($a);
        var_dump($b);
//        $filename = public_path().'/test/'.$day.'.png';
//        $cmd = sprintf('casperjs '.base_path().'/phantomjs/render_report.js --url=%s --date=%s --output=%s',$url, $day,$filename);
//        echo $cmd;
//        $cmd = '/usr/local/bin/casperjs /Users/zz/Code/myProjects/star-lord-ex/src/server/phantomjs/render_report.js --url=http://localhost --date=abc --output='.$filename;
//        echo exec('/usr/local/bin/casperjs --version 2>&1');
//        echo $filename;
//        print_r($a);
//        echo $b;
//        var_dump($return);

    }
}
