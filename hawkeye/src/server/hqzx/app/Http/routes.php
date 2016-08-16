<?php

/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| Here is where you will register all of the routes in an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| This route group applies the "web" middleware group to every route
| it contains. The "web" middleware group is defined in your HTTP
| kernel and includes session state, CSRF protection, and more.
|
*/

Route::group(['middleware' => ['web']], function () {
    //
});

Route::group(['prefix' => '/api/v1/','middleware' => 'auth'], function()
{
    $routes = config('routes');

    foreach($routes as $rt){
        $method = $rt['method'];
        switch($method) {
            case 'get':
                Route::get($rt['url'], ['uses' => $rt['controller'],'permissions'=>$rt['permissions']]);
                break;
            case 'post':
                Route::post($rt['url'], ['uses' => $rt['controller'],'permissions'=>$rt['permissions']]);
                break;
            case 'put':
                Route::put($rt['url'], ['uses' => $rt['controller'],'permissions'=>$rt['permissions']]);
                break;
            case 'delete':
                Route::delete($rt['url'], ['uses' => $rt['controller'],'permissions'=>$rt['permissions']]);
                break;
        }

    }

});

Route::group(['prefix' => 'api/v1', 'namespace' => 'HangQing'],function(){
    Route::post('/keywords/{company_id}/data','IndexController@store');
});

//报表获取关键字
Route::get('/api/v1/keywords/report','HangQing\KeywordsController@reportIndex');
//报表表获关键字指数数据
Route::get('/api/v1/keywords/report/data','HangQing\IndexController@reportIndex');