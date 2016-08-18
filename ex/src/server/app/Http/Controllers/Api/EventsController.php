<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Api;
use App\Model\Event;
use Illuminate\Support\Facades\Input;
use Carbon\Carbon;
use Illuminate\Support\Facades\Redis;
use App\Http\Spread;
use Illuminate\Support\Facades\Log;
class EventsController extends Controller
{
    //
    public function getIndex()
    {
        $status = Input::get('status');
        $mb = Input::get('mb');
        $his = Input::get('his');
        $companyUuid = Api::getCompanyId();
        $events = Event::where('company_uuid',$companyUuid)
                    ->get();
        $now = Carbon::now();
        //判断事件是否过期
//        foreach($events as $evt){
//            if($now > $evt->end_at){
//                Event::find($evt->id)
//                    ->update(array('status'=>0));
//            }
//        }

        if(isset($status)){
            $events = Event::where('company_uuid', $companyUuid)
                            ->where('status',1)
                            ->get();
        }
        else if(isset($mb) && isset($his)){
            $events = Event::where('company_uuid', $companyUuid)
                ->where('status',0)
                ->get();
        }
        else if(isset($mb)){
            $events = Event::where('company_uuid', $companyUuid)
                ->where('status',1)
                ->get();
        }
        else {
            $events = Event::where('company_uuid', $companyUuid)
                ->get();
        }

        $returns = array();
        foreach($events as $evt){
            $evt['now'] = Carbon::now()->format('Y-m-d');
            if($evt->end_at == '0000-00-00 00:00:00'){
                $evt['end_at'] = 'none';
            }
            array_push($returns,$evt);
        }

        return response()->json(
            $returns
        );
    }

    public function detail()
    {
        $evtId = Input::get('event_id');

        $res = Event::find($evtId);
        $res['now'] = Carbon::now()->format('Y-m-d');
        return response()->json(
            $res
        );

    }
    //增加事件
    public function postIndex()
    {
        $companyUuid = Api::getCompanyId();
        $creatorId = Api::getCreatorId();

        $title = Input::get('title');
        $tRes = Event::where('title',$title)
                    ->where('company_uuid',$companyUuid)
                    ->first();
        //事件重名
        if($tRes)
            return response()->json(
                array(
                    'result' => false,
                    'msg' => '事件重名'
                ));

        $detail = Input::get('detail');
        $newData = array(
            'title'  => $title,
            'begin_at' => Input::get('begin_at'),
//            'end_at'  => Input::get('end_at'),
            'rank'    => Input::get('rank'),
            'detail'    => isset($detail) ? $detail : '',
            'company_uuid' => $companyUuid,
            'creator_id' => $creatorId,
            'create_at'  => Carbon::now(),
            'status'     => 1
        );

        $newObj = Event::create($newData);

        Log::info('增加事件。[companyUuid:'.$companyUuid.'] [uuid:'.$creatorId.'] [info:'.json_encode($newData).']');

        return response()->json(
            array(
                'result' => true,
                'id'     => $newObj->id
            )
        );
    }

    //修改事件
    public function upEvents($id)
    {
        $companyUuid = Api::getCompanyId();
        $creatorId = Api::getCreatorId();
//        $id = Input::get('id');
        $title = Input::get('title');
        $tRes = Event::where('title',$title)
                        ->where('company_uuid',$companyUuid)
                        ->where('id','!=',$id)
                        ->first();
        $const = config('const');
        //事件重名
        if($tRes)
            return response()->json(array(
                'result' => false,
                'msg' => $const['errMsg']['eventExist']
            ));

        $detail = Input::get('detail');
        $endAt = Input::get('end_at');
        $upData = array(
            'title'  => Input::get('title'),
            'begin_at' => Input::get('begin_at'),
            'rank'    => Input::get('rank'),
            'detail'    =>  isset($detail) ? $detail : '',
            'status' => Input::get('status')
        );

        if(isset($endAt)){
            $upData['end_at'] = $endAt;
        }

        //删除数组空项
        foreach($upData as $key => $val){
            if($upData[$key] === null){
                unset($upData[$key]);
            }
        }

        $upRow = Event::where('id',$id)
            ->where('company_uuid',$companyUuid)
            ->update($upData);

        Log::info('修改事件。[companyUuid:'.$companyUuid.'] [uuid:'.$creatorId.'] [eventId:'.$id.'] [upData:'.json_encode($upData).']');

        return response()->json(
            array(
                'result' => true
            )
        );
    }

    public function delete($id)
    {
        //删除事件
        $delRow = Event::where('id', $id)->delete();

        //通知redis
        $channel = config('app.channel');
        $data['company_uuid'] = Api::getCompanyId();
        $data['action'] = 'delete';
        $data['object'] = 'event';
        $data['value'] = $id;

        Redis::publish($channel,json_encode($data));

        //删除相关标签
        $company_uuid = Api::getCompanyId();
        $response = Api::execGroutApi('GET','company/'.$company_uuid.'/tag_rules');
        if(!empty($response)){
            $post_data=array();
            foreach ($response->data as $value){
                $data=array();
                if(property_exists($value,'tag') && $value->tag=='_evt_'.$id){
                    $data['key'] = $value->key;
                    $data['type'] = $value->type;
                    $data['tag'] = $value->tag;
                    array_push($post_data,$data);
                }
            }
            if(!empty($post_data)){
                $postData = array(
                    'http_errors' => true,
                    'form_params' =>[
                        'data'=> json_encode($post_data)
                    ],
                );
                Api::execGroutApi('PUT','company/'.$company_uuid.'/tag_rules',$postData);
            }
        }

        Log::info('删除事件。[companyUuid:'.$company_uuid.'] [uuid:'.Api::getCreatorId().'] [eventId:'.$id.']');

        return response()->json(
            array(
                'result' => $delRow ? true :false,
            )
        );
    }

    /**
     * 最近七天事件
     * @return
     */
    public function hotEvents()
    {
        $companyUuid = Api::getCompanyId();
        $evtRows = Event::where('company_uuid',$companyUuid)
                        ->orderBy('begin_at','desc')
                        ->skip(0)
                        ->take(7)
                        ->get();

        $returns = array();
        if(count($evtRows)>0){
            foreach($evtRows as $row){
                $rtObj['title'] = $row->title;
                $rtObj['begin_at'] = $row->begin_at;
                $rtObj['id'] = $row->id;

                array_push($returns,$rtObj);
            }

        }

        return response()->json($returns);
    }

    /**
     * 获取热门事件列表
     * @return
     */
    public function hotEventsAll()
    {
        $return =  array();
        
        $day = Input::get('day') ? Input::get('day') : Api::getUpdateAt();
        $yestoday = date('Y-m-d',(strtotime($day) - 3600*24));

        $companyUuid = Api::getCompanyId();
        $evtRows = Event::where('company_uuid',$companyUuid)
                        ->where('status',1)
                        ->orderBy('begin_at','desc')
                        ->get();

        if(count($evtRows)>0){

            $index = Api::getCompanyIndex();

            $event_tags = array();
            $events = array();
            foreach($evtRows as $row){
                $rtObj['title'] = $row->title;
                $rtObj['begin_at'] = $row->begin_at;
                $rtObj['rank'] = $row->rank;
                $rtObj['id'] = $row->id;
                $rtObj['detail'] = $row->detail;

                //文章总数
                $art_count_params = [
                    'index' => $index,
                    'type'  => 'article',
                    'body'  => [
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
                                            'term' => [ 'result_tags' => '_evt_'.$row->id ]
                                        )
                                    ]
                                ]
                            ]
                        ]
                    ]
                ];
                $article_count = Spread::searchEsData($art_count_params,false,true);
                $rtObj['article_count'] = $article_count['count'];

                //昨日新增文章数
                $y_art_count_params = [
                    'index' => $index,
                    'type'  => 'article',
                    'body'  => [
                        'query' => [
                            'filtered' => [
                                'filter' => [
                                    'bool' => [
                                        'must' => [
                                            array(
                                                'range' => [
                                                    'crawler_at' => ['gte' => $yestoday.' 00:00:00']
                                                ]
                                            ),
                                            array(
                                                'range' => [
                                                    'crawler_at' => ['lte' => $yestoday.' 23:59:59']
                                                ]
                                            ),
                                            array(
                                                'term' => [ 'result_tags' => '_evt_'.$row->id ]
                                            )
                                        ]
                                    ]

                                ]
                            ]
                        ]
                    ]
                ];
                $yestoday_art_count = Spread::searchEsData($y_art_count_params,false,true);
                $rtObj['yestoday_art_count'] = $yestoday_art_count['count'];
                
                //负面文章数
                $negative_art_count_params = [
                    'index' => $index,
                    'type'  => 'article',
                    'body'  => [
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
                                            'term' => ['result_tags' => '_emo_negative' ]
                                        ),
                                        array(
                                            'term' => [ 'result_tags' => '_evt_'.$row->id ]
                                        )
                                    ]

                                ]
                            ]
                        ]
                    ]
                ];
                $negative_art_count = Spread::searchEsData($negative_art_count_params,false,true);
                $rtObj['negative_art_count'] = $negative_art_count['count'];

                $events['_evt_'.$row->id] = $rtObj;
                array_push($event_tags,'_evt_'.$row->id);
            }

            /*** 按最新加入的文章事件排序 ***/
            $index = Api::getCompanyIndex();
            $params = [

                'index' => $index,
                'type'  => 'article',
                'size'  => 50,
                'scroll' => '30s',
                "sort"  => ['crawler_at:desc','publish_at:desc'],
                'body'  => [
                    'query' => [
                        'filtered' => [
                            'filter' => [
                                'terms' => [ 'result_tags' => $event_tags ]
                            ]
                        ]
                    ]
                ]

            ];

            $es_data = Spread::searchEsData($params,true);
            if(count($es_data) > 0){
                
                foreach ($es_data as $art){
                    foreach ($event_tags as $evt){
                        if(in_array($evt,$art['result_tags']) && !in_array($events[$evt],$return)){
                            array_push($return,$events[$evt]);
                        }
                    }
                }

                foreach ($event_tags as $evt){
                    if(!in_array($events[$evt],$return)){
                        array_push($return,$events[$evt]);
                    }
                }

            }
            /*** 按最新加入的文章事件排序 end ***/


        }

        return response()->json($return);
    }

}
