<?php

return [
    /*
     |--------------------------------------------------------------------------
     | 关键字
     |--------------------------------------------------------------------------
     */
    //获取已添加的关键字关键字
    array(
        'url'    =>  'keywords',
        'method'     =>  'get',
        'controller' => 'HangQing\KeywordsController@index',
        'permissions' => array('rule_sc_index_info','rule_ac_news_audit')
    ),
    //增加关键字
    array(
        'url'    =>  'keywords',
        'method'     =>  'post',
        'controller' => 'HangQing\KeywordsController@store',
        'permissions' => array('rule_sc_index_setting')
    ),
    //设置关键字状态
    array(
        'url'    =>  'keywords/{id}',
        'method'     =>  'put',
        'controller' => 'HangQing\KeywordsController@update',
        'permissions' => array('rule_sc_index_setting')
    ),
    //删除关键字
    array(
        'url'    =>  'keywords/{id}',
        'method'     =>  'delete',
        'controller' => 'HangQing\KeywordsController@destroy',
        'permissions' => array('rule_sc_index_setting')
    ),
    //获取关键字指数数据
    array(
        'url'    =>  '/keywords/data',
        'method'     =>  'get',
        'controller' => 'HangQing\IndexController@index',
        'permissions' => array('rule_sc_index_info','rule_ac_news_audit')
    ),

    /*
     |--------------------------------------------------------------------------
     | 大数据导航
     |--------------------------------------------------------------------------
     */
    array(
        'url'    =>  'bigdata/nav/data',
        'method'     =>  'get',
        'controller' => 'BigData\NavController@index',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    ),
    array(
        'url'    =>  'bigdata/nav/url',
        'method'     =>  'get',
        'controller' => 'BigData\NavController@getNavUrl',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    ),

    /*
     |--------------------------------------------------------------------------
     | 品牌风云榜
     |--------------------------------------------------------------------------
     */
    array(
        'url'    =>  'brand/nav',
        'method'     =>  'get',
        'controller' => 'Brand\ListController@getNav',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    ),
    array(
        'url'    =>  'brand/list/{nav}',
        'method'     =>  'get',
        'controller' => 'Brand\ListController@getList',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    ),
    array(
        'url'    =>  'brand/list/{nav}/{category}',
        'method'     =>  'get',
        'controller' => 'Brand\ListController@getList',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    ),
    array(
        'url'    =>  'brand/relation/{nav}/{keyword}',
        'method'     =>  'get',
        'controller' => 'Brand\ListController@getRelation',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    ),
    array(
        'url'    =>  'brand/spread/{nav}/{keyword}',
        'method'     =>  'get',
        'controller' => 'Brand\ListController@getSpread',
        'permissions' => array('rule_ng_authority','rule_ng_industry','rule_ng_index','rule_ng_sales')
    )

];