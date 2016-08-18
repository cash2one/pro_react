<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/3/16
 * Time: 上午10:50
 */

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Http\Spread;
use App\Model\MediaTags;
use App\Http\Api;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Log;
class MediaTagsController extends Controller
{
    public function Index() {
        $results = MediaTags::all();

        //创建category对应标签tags
        $mediaTags = Api::setKeyAry($results,'mid_category','name');
        $mediaCount = Api::setKeyAry($results,'mid_category','media_count');

        $dataAry = array();
        foreach($mediaTags as $cat => $tags){
            $retObj['category'] = $cat;
            $retObj['med_count'] = array_sum($mediaCount[$cat]);
            $retObj['tags'] = $tags;

            array_push($dataAry,$retObj);
        }

        return response()->json(
            $dataAry
        );

    }

    public function topMedias() {
        $medias = config('const.medias');
//        $headers = [
//            'Access-Control-Allow-Methods'=> 'POST, GET, OPTIONS, PUT, DELETE',
//            'Access-Control-Allow-Headers'=> 'X-Requested-With, Content-Type, user_token, Origin, Authorization'
//        ];
        $returns = array();
        foreach($medias as $key=>$mid){
            $rtObj['id'] = substr($key,5);
            $rtObj['name'] = $mid;
            array_push($returns,$rtObj);
        }

        return response()->json(
            $returns
        );
    }

    //获取媒体信息
    public function getMediasInfo(){

        $info_data = array();

        $mids = Input::get('mid');

        if(!empty($mids)){

            if(!is_array($mids)){
                $mids = explode(',',$mids);
            }
            $params = [
                'index' => 'medias',
                'type'  => 'media',
                'body'  => [
                    'query' => [
                        'filtered' => [
                            'filter' => [
                                'terms' => [ 'mid' => $mids ]
                            ]
                        ]
                    ]
                ]
            ];
            //媒体信息
            $mids_info = Spread::searchEsData($params);
            
            if(count($mids_info['hits']['hits']) > 0){

                foreach ($mids_info['hits']['hits'] as $info){

                    $mid_info['mid'] = $info['_source']['mid'];
                    $mid_info['name'] = $info['_source']['name'];

                    array_push($info_data,$mid_info);
                }

            }
        }

        return response()->json($info_data);

    }


}