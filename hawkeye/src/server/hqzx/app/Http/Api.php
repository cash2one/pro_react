<?php
/**
 * Created by PhpStorm.
 * User: xzc
 * Date: 16-7-30
 * Time: 下午12:51
 */

namespace App\Http;
use Illuminate\Support\Facades\Input;
use GuzzleHttp;
use StdClass;
use GraphAware\Neo4j\Client\ClientBuilder;
use Illuminate\Support\Facades\Crypt;

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
    
    public static function getCompanyId()
    {
        $user = Input::get('user');
        return $user->company_uuid;
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

    public static function getUpdateAt()
    {
        $user = Input::get('user');
        $update_at = substr($user->update_at,0,strripos($user->update_at,'.'));
        return $update_at;
    }

    //搜索Neo4j
    public static function queryNeo4jApi($query){
        if(empty($query)){
            return array();
        }
        $client = ClientBuilder::create()
            ->addConnection('default', config('app.neo4j_host'))
            ->build();
        $result = $client->run($query);
        return $result->records();
    }


    //数组转对象
    public static function array2object($arr){

        $obj = new StdClass();
        foreach ($arr as $key => $val){
            $obj->$key = $val;
            if(gettype($obj->$key) == 'array'){
                $obj->$key = Api::array2object($obj->$key);
            }
        }

        return $obj;

    }


    //判断多维数组是否存在某个值
    public static function  deep_in_array($value, $array) {
        foreach($array as $item) {
            if(!is_array($item)) {
                if ($item == $value) {
                    return true;
                } else {
                    continue;
                }
            }
            if(in_array($value, $item)) {
                return true;
            } else if(self::deep_in_array($value, $item)) {
                return true;
            }
        }
        return false;
    }


}