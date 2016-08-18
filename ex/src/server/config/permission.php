<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/3/30
 * Time: 下午2:58
 */

return [
    /**
     * 媒体标签
     */
    'mediaTags' => [
        'url'        => 'media/tags',
        'permissions' => ['rule_ac_manager_media']
    ],

    /**
     *用户媒体
     */
    'userMedia' => [
        'url'        => 'user/media',
        'permissions' => ['rule_ac_manager_media']
    ],
    /**
     * 分类
     */
    'category' => [
        'url'        => 'category',
        'permissions' => ['rule_ac_manager_media','rule_ac_manager_category']
    ],

];