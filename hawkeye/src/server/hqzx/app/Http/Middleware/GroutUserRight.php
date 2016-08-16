<?php

namespace App\Http\Middleware;

use Closure;

class GroutUserRight
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
        if($user_token != 'grout'){

            $data['result'] = false;
            $data['msg'] 	= '无权限操作！';

            echo json_encode($data);
            exit;

        }

        return $next($request);
    }
}
