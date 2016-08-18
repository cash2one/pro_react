<?php

namespace App\Http\Controllers\api;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Api;
use App\Model\UserConfig;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Log;
class UserConfigController extends Controller
{
    //
    public function get() {
        $companyUuid = Api::getCompanyId();;
        $res = UserConfig::where('company_uuid',$companyUuid)->first();
        return response()->json(
            $res
        );
    }

    public function put() {
        $companyUuid = Api::getCompanyId();

        $row = UserConfig::where('company_uuid',$companyUuid)
                        ->where('version',config('app.config_version'))
                        ->where('type','warn')
                        ->first();

        $info = array(
            'status' => Input::get('status'),
            'email'  => Input::get('email'),
        );

        $dataRow = array(
            'type' => 'warn',
            'value'  => json_encode($info),
            'creator_id' => Api::getCreatorId(),
            'version'    =>config('app.config_version')
        );

        foreach($dataRow as $key => $data){
            if(is_null($data)){
                unset($dataRow[$key]);
            }
        }

        if(!$row){
            //新加配置
            $dataRow['company_uuid'] = $companyUuid;
            $res = UserConfig::create($dataRow);
        }else{
            //更新配置
            $res = UserConfig::where('company_uuid',$companyUuid)
                ->where('version',config('app.config_version'))
                ->where('type','warn')
                ->update($dataRow);
        }

        Log::info('用户配置。[companyUuid:'.$companyUuid.'] [uuid:'.Api::getCreatorId().'] [info:'.json_encode($dataRow).']');

        return response()->json(
            ['result' => $res ? true : false]
        );
    }
}
