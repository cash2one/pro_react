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
use Illuminate\Support\Facades\Route;

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


//restful api route
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


//    Route::controller('media/tags', 'Api\MediaTagsController');             //媒体标签
//    Route::controller('user/media', 'Api\UserMediaController');             //用户媒体
//    Route::get('media/search', 'Api\UserMediaController@search');
//    Route::get('keywords/count', 'Api\KeywordController@count');
//    Route::resource('keywords', 'Api\KeywordController');                   //关键字
//    Route::get('category/count', 'Api\CategoryController@count');
    //分类
//    Route::resource('category', 'Api\CategoryController',['names' => ['index' => 'category']]);
//    Route::controller('articles', 'Api\ArticleController');                 //文章
//    Route::put('article/reports', 'Api\ArticleController@reports');
//    Route::put('article/events', 'Api\ArticleController@events');
//    Route::get('reports', 'Api\ReportController@reports');
//    Route::get('report/month', 'Api\ReportController@getMonth');
//    Route::controller('report', 'Api\ReportController');                 //报表

//    Route::put('events/{id}', ['uses' => 'Api\EventsController@upEvents']);
//    Route::controller('events', 'Api\EventsController');                //事件

    
});

Route::group(['prefix' => '/api/v2/'], function()
{
    Route::get('report/data', 'Api\ReportController@reportData');
    Route::get('category/test', 'Api\CategoryController@test');
    Route::get('growingio/test', 'Spread\SpreadArticleController@growingIoTest');

    //报告获取查询的聚合信息，不需要用户登录
    Route::get('article/report/agg', ['uses' => 'Api2\ReportArticleController@getReportAgg']);   
    
});

Route::group(['prefix' => '/api/v2/','middleware' => 'auth'], function()
{
    //事件接口
    Route::get('events/hot', ['uses' => 'Api\EventsController@hotEventsAll','permissions'=> ['rule_ac_event_operator','rule_analy_event'] ]);   //舆情热门事件列表
    Route::get('events/getname', ['uses' => 'Api2\EventsController@getEventsName','permissions'=> ['rule_ac_event_operator','rule_analy_event'] ]);   //获取事件名称
    
    //文章查询接口
    Route::get('article/query/agg', ['uses' => 'Api2\ArticleController@getAgg','permissions'=> ['rule_ac_news_audit'] ]);   //获取查询的聚合信息
    Route::get('article/query/count', ['uses' => 'Api2\ArticleController@getCount','permissions'=> ['rule_ac_news_audit'] ]);   //获取查询数据的纪录个数
    Route::get('article/query/data', ['uses' => 'Api2\ArticleController@getData','permissions'=> ['rule_ac_news_audit'] ]);   //获取查询的数据
    Route::get('article/audit/data', ['uses' => 'Api2\ArticleController@getAuditData','permissions'=> ['rule_ac_news_audit'] ]);   //人工审计
    Route::get('article/same/data', ['uses' => 'Api2\ArticleController@getSameData','permissions'=> ['rule_ac_news_audit'] ]);   //获取相同文章列表
    Route::put('article/same', ['uses' => 'Api2\ArticleController@putSameData','permissions'=> ['rule_ac_news_audit'] ]);   //获取相同文章列表

    //报告接口
    Route::get('reports/count', ['uses' => 'Api2\ReportController@reportCount','permissions'=> ['rule_ac_news_audit'] ]);
    Route::get('reports', ['uses' => 'Api2\ReportController@reports','permissions'=> ['rule_ac_news_audit'] ]);
    Route::get('report', ['uses' => 'Api2\ReportController@report','permissions'=> ['rule_ac_news_audit'] ]);
    Route::post('reports', ['uses' => 'Api2\ReportController@store','permissions'=> ['rule_ac_news_audit'] ]);
    Route::put('reports', ['uses' => 'Api2\ReportController@pubReport','permissions'=> ['rule_ac_news_audit'] ]);
    Route::delete('reports/del', ['uses' => 'Api2\ReportController@del','permissions'=> ['rule_ac_news_audit'] ]);
//    Route::get('reports/share_url', ['uses' => 'Api2\ReportController@qrCode','permissions'=> ['rule_ac_news_audit'] ]);
    Route::get('reports/share', ['uses' => 'Api2\ReportController@share','permissions'=> ['rule_ac_news_audit'] ]);
    //报告写redis状态
    Route::get('reports/status', ['uses' => 'Api2\ReportController@status','permissions'=> ['rule_ac_news_audit'] ]);
    Route::put('reports/edit', ['uses' => 'Api2\ReportController@edit','permissions'=> ['rule_ac_news_audit'] ]);
    Route::put('reports/edit/ok', ['uses' => 'Api2\ReportController@editOk','permissions'=> ['rule_ac_news_audit'] ]);
});

Route::get('/api/v2/reports/share', 'Api2\ReportController@share');
Route::get('/api/v2/reports/share_url', ['uses' => 'Api2\ReportController@qrCode','permissions'=> ['rule_ac_news_audit'] ]);