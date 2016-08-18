<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/3/31
 * Time: 上午11:11
 */
return [
    /*
     |--------------------------------------------------------------------------
     | 媒体标签
     |--------------------------------------------------------------------------
     */
    array(
        'url'    =>  'media/tags',
        'method'     =>  'get',
        'controller' => 'Api\MediaTagsController@index',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'    =>  'media/top',
        'method'     =>  'get',
        'controller' => 'Api\MediaTagsController@topMedias',
        'permissions' => array('rule_ac_manager_tag','rule_analy_event')
    ),
    array(
        'url'    =>  'media/getinfo',
        'method'     =>  'get',
        'controller' => 'Api\MediaTagsController@getMediasInfo',
        'permissions' => array('rule_ac_manager_tag','rule_analy_event')
    ),
    // 用户选择的媒体标签
    array(
        'url'    =>  'user/media/tags',
        'method'     =>  'get',
        'controller' => 'Api\UserMediaController@getTags',
        'permissions' => array('rule_ac_manager_media')
    ),
    array(
        'url'    =>  'user/media/tags',
        'method'     =>  'put',
        'controller' => 'Api\UserMediaController@putTags',
        'permissions' => array('rule_ac_manager_media','rule_ac_manager_tag')
    ),
    array(
        'url'    =>  'user/media/rank',
        'method'     =>  'put',
        'controller' => 'Api\UserMediaController@putRank',
        'permissions' => array('rule_ac_manager_media','rule_ac_manager_tag')
    ),
    array(
        'url'    =>  'user/media/last',
        'method'     =>  'get',
        'controller' => 'Api\UserMediaController@getLast',
        'permissions' => array('rule_ac_manager_media','rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'media/search',
        'method'     =>  'get',
        'controller' => 'Api\UserMediaController@search',
        'permissions' => array('rule_ac_manager_media','rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'media/company/count',
        'method'     =>  'get',
        'controller' => 'Api\UserMediaController@articleMedias',
        'permissions' => array('rule_ac_manager_media','rule_ac_manager_tag','rule_ac_news_audit')
    ),
    array(
        'url'        =>  'media/event/count',
        'method'     =>  'get',
        'controller' => 'Api\UserMediaController@eventMedias',
        'permissions' => array('rule_ac_manager_media','rule_ac_manager_tag','rule_ac_news_audit')
    ),

    /*
    |--------------------------------------------------------------------------
    | 关键字
    |--------------------------------------------------------------------------
    */
    //获取关键字总数
     array(
         'url'        =>  'keywords/count',
         'method'     =>  'get',
         'controller' => 'Api\KeywordController@count',
         'permissions' => array('rule_ac_manager_tag')
     ),
    //获取某企业的关键字
    array(
        'url'        =>  'keywords',
        'method'     =>  'get',
        'controller' => 'Api\KeywordController@get',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'keywords',
        'method'     =>  'post',
        'controller' => 'Api\KeywordController@store',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'keywords/{id}',
        'method'     =>  'put',
        'controller' => 'Api\KeywordController@update',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'keywords/{id}',
        'method'     =>  'delete',
        'controller' => 'Api\KeywordController@destroy',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'keywords/index',
        'method'     =>  'get',
        'controller' => 'Api\KeywordController@index',
        'permissions' => array('rule_ac_manager_tag')
    ),
    /*
    |--------------------------------------------------------------------------
    | 分类
    |--------------------------------------------------------------------------
    */
    array(
        'url'        =>  'category/count',
        'method'     =>  'get',
        'controller' => 'Api\CategoryController@count',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'category',
        'method'     =>  'get',
        'controller' => 'Api\CategoryController@index',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'category',
        'method'     =>  'post',
        'controller' => 'Api\CategoryController@store',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'category/{id}',
        'method'     =>  'put',
        'controller' => 'Api\CategoryController@update',
        'permissions' => array('rule_ac_manager_tag')
    ),
    array(
        'url'        =>  'category/{id}',
        'method'     =>  'delete',
        'controller' => 'Api\CategoryController@destroy',
        'permissions' => array('rule_ac_manager_tag')
    ),
    /*
     |--------------------------------------------------------------------------
     | 文章
     |--------------------------------------------------------------------------
     */
    array(
        'url'        =>  'articles',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@getIndex',
        'permissions' => array('rule_ac_news_audit','rule_analy_event')
    ),
    array(
        'url'        =>  'article/count',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@getArticleCount',
        'permissions' => array('rule_ac_news_audit','rule_analy_event')
    ),
    array(
        'url'        =>  'article/detail',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@detail',
        'permissions' => array('rule_ac_news_audit','rule_analy_event')
    ),
    array(
        'url'        =>  'articles/report',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@putReport',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'article/reports',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@reports',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'articles/emotion',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@putEmotion',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'articles/warn',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@warn',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'articles/nowarn',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@noWarn',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'articles/depend',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@putDepend',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'articles/event',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@putEvent',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'article/events',
        'method'     =>  'put',
        'controller' => 'Api\ArticleController@events',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'article/warn',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@warnArticle',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'article/list',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@articleList',
        'permissions' => array('rule_ac_news_audit','rule_analy_event')
    ),
    array(
        'url'        =>  'articles/latest',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@articlesLatest',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'article/charts',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@articleCharts',
        'permissions' => array('rule_ac_news_audit')
    ),
    array(
        'url'        =>  'article/productform',
        'method'     =>  'get',
        'controller' => 'Api\ArticleController@articleProductForm',
        'permissions' => array('rule_ac_news_audit')
    ),

   /*
   |--------------------------------------------------------------------------
   | 报告
   |--------------------------------------------------------------------------
   */
    array(
        'url'        =>  'reports',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@reports',
        'permissions' => array('rule_ac_report_build')
    ),
//    array(
//        'url'        =>  'report/da/report/monthta',
//        'method'     =>  'get',
//        'controller' => 'Api\ReportController@reportData',
//        'permissions' => array('rule_ac_report_build')
//    ),
    array(
        'url'        =>  'report',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@getIndex',
        'permissions' => array('rule_ac_report_build','rule_analy_event')
    ),
    array(
        'url'        =>  'report',
        'method'     =>  'put',
        'controller' => 'Api\ReportController@putIndex',
        'permissions' => array('rule_ac_report_build')
    ),
    array(
        'url'        =>  'report/submit',
        'method'     =>  'put',
        'controller' => 'Api\ReportController@putSubmit',
        'permissions' => array('rule_ac_report_build')
    ),
    array(
        'url'        =>  'report/articles',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@getArticles',
        'permissions' => array('rule_ac_report_build','rule_analy_event')
    ),
    array(
        'url'        =>  'report/data',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@getData',
        'permissions' => array('rule_ac_report_build')
    ),
    array(
        'url'        =>  'report/month',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@getMonth',
        'permissions' => array('rule_ac_report_build')
    ),
    array(
        'url'        =>  'report/recent',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@getRecent',
        'permissions' => array('rule_ac_report_build','rule_analy_event')
    ),
    array(
        'url'        =>  'report/events',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@events',
        'permissions' => array('rule_ac_report_build')
    ),
    array(
        'url'        =>  'report/download',
        'method'     =>  'get',
        'controller' => 'Api\ReportController@download',
        'permissions' => array('rule_ac_report_build')
    ),
   /*
   |--------------------------------------------------------------------------
   | 事件
   |--------------------------------------------------------------------------
   */
    array(
        'url'        =>  'events',
        'method'     =>  'get',
        'controller' => 'Api\EventsController@getIndex',
        'permissions' => array('rule_ac_event_operator','rule_analy_event')
    ),
    array(
        'url'        =>  'event/detail',
        'method'     =>  'get',
        'controller' => 'Api\EventsController@detail',
        'permissions' => array('rule_ac_event_operator','rule_analy_event')
    ),
    array(
        'url'        =>  'events',
        'method'     =>  'post',
        'controller' => 'Api\EventsController@postIndex',
        'permissions' => array('rule_ac_event_operator')
    ),
    array(
        'url'        =>  'events/hot',
        'method'     =>  'get',
        'controller' => 'Api\EventsController@hotEventsAll',
        'permissions' => array('rule_ac_event_operator','rule_analy_event')
    ),
    array(
        'url'        =>  'events/{id}',
        'method'     =>  'put',
        'controller' => 'Api\EventsController@upEvents',
        'permissions' => array('rule_ac_event_operator')
    ),
    array(
        'url'        =>  'events/{id}',
        'method'     =>  'delete',
        'controller' => 'Api\EventsController@delete',
        'permissions' => array('rule_ac_event_operator')
    ),

    /*
     |--------------------------------------------------------------------------
     | 用户设置
     |--------------------------------------------------------------------------
     */
    array(
        'url'        =>  'config',
        'method'     =>  'get',
        'controller' => 'Api\UserConfigController@get',
        'permissions' => array('rule_ac_event_operator')
    ),
    array(
        'url'        =>  'config',
        'method'     =>  'put',
        'controller' => 'Api\UserConfigController@put',
        'permissions' => array('rule_ac_event_operator')
    ),

    /*
     |--------------------------------------------------------------------------
     | 传播分析
     |--------------------------------------------------------------------------
     */
    array(
        'url'        =>  'articles/reship',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getReship',
        'permissions' => array('rule_analy_spread_company')
    ),
    array(
        'url'        =>  'spread/rout',
        'method'     =>  'post',
        'controller' => 'Spread\SpreadArticleController@getRout',
        'permissions' => array('rule_analy_spread_company')
    ),
    array(
        'url'        =>  'spread/company/{uuid}/stat',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getStatis',
        'permissions' => array('rule_analy_spread_company')
    ),
    array(
        'url'        =>  'spread/event/{uuid}/stat',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getStatis',
        'permissions' => array('rule_analy_spread_company')
    ),
    array(
        'url'        =>  'spread/article/{uuid}/stat',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getStatis',
        'permissions' => array('rule_analy_spread_company')
    ),
    array(
        'url'        =>  'spread/search',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@searchArticle',
        'permissions' => array('rule_analy_spread_company')
    ),
    
    /*
     |--------------------------------------------------------------------------
     | 媒体分布
     |--------------------------------------------------------------------------
     */
    array(
        'url'        =>  'media/dist/category/company/{uuid}',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getCompanyMediaCategoryDist',
        'permissions' => array('rule_analy_spread_company','rule_analy_event')
    ),
    array(
        'url'        =>  'media/dist/category/event/{uuid}',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getEventMediaCategoryDist',
        'permissions' => array('rule_analy_spread_company','rule_analy_event')
    ),
    array(
        'url'        =>  'media/dist/media/company/{uuid}',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getCompanyMediaDist',
        'permissions' => array('rule_analy_spread_company','rule_analy_event')
    ),
    array(
        'url'        =>  'media/dist/media/event/{uuid}',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getEventMediaDist',
        'permissions' => array('rule_analy_spread_company','rule_analy_event')
    ),

    /*
     |--------------------------------------------------------------------------
     | 情感文章
     |--------------------------------------------------------------------------
     */

    //获取公司当天情感文章数量
    array(
        'url'        =>  'emotion/company/article',
        'method'     =>  'get',
        'controller' => 'Spread\SpreadArticleController@getCompanyEmotion',
        'permissions' => array('rule_analy_spread_company','rule_analy_event')
    ),
    
];