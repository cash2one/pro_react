<?php

namespace App\Http\Middleware;

use Closure;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Config;

class UserRight
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next)
    {

        $user_token = $request->header('user_token');	//获取user_token
        if($user_token){

            $user = json_decode(Redis::get('token_'.$user_token));	//获取用户数据
            if(!$user){

                $data['result'] = false;
                $data['msg'] 	= '无权限操作！请重新登录！';

                echo json_encode($data);
                exit;

            }else{

                if(!property_exists($user,'company_uuid')){

                    $data['result'] = false;
                    $data['msg'] 	= '获取不到公司信息！';

                    echo json_encode($data);
                    exit;
                }

                Config::set('user',$user);

            }

        }else{

            $data['result'] = false;
            $data['msg'] 	= '无权限操作！请重新登录！';

            echo json_encode($data);
            exit;

        }

        return $next($request);
    }
}
