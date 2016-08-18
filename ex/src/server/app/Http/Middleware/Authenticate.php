<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;
class Authenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
//        if (Auth::guard($guard)->guest()) {
//            if ($request->ajax() || $request->wantsJson()) {
//                return response('Unauthorized.', 401);
//            } else {
//                return redirect()->guest('login');
//            }
//        }
        $headers = [
            'Access-Control-Allow-Headers'=> 'user_token'
        ];
        $token = $request
//            ->header('Access-Control-Allow-Headers', 'user_token')
            ->header('user-token');
        $user = json_decode(Redis::get('token_'.$token));

        //没获取到用户信息
        if(is_null($user)){
            return response()->json(array(
                'result'=>false,
                'msg'=> config('const.errMsg.tokenOverdue'),
            ),401);
        }

        //返回除了200以外的状态码
        if($user->status->code != 200){
            return response()->json(array(
                'result'=>false,
                'msg'=> $user->status->msg,
            ),$user->status->code);
        }

        if(isset($user->expire_time) && !empty($user->expire_time)){
            Redis::expire('token_'.$token,$user->expire_time);
        }else{
            Redis::expire('token_'.$token,12*3600);
        }

        $request['user'] = $user;

        //权限控制
        $rules = $user->rule;
        $permits = $this->getPermission($request);

        foreach($permits as $permit) {
            if (in_array($permit, $rules)) {
                return $next($request);
            }
        }

        return response()->json(array(
            'result' => false,
            'msg' => '没有权限',
        ), 403);



    }


    // 获取当前路由需要的权限
    public  function getPermission($request)
    {
        $permits = config('permission');
        $actions = $request->route()->getAction();
        if (empty($actions['permissions'])) {
            return response()->json(array(
                'result'=>false,
                'msg'=>'没有设置权限',
            ),403);
        }

        return $actions['permissions'];
    }
}
