<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/4/12
 * Time: 上午10:58
 */

return [
    'emotion'=>[
        '1' => '_emo_positive',
        '-1' => '_emo_negative',
        '2' => '_emo_neutral',
        '0' => 0,
        '_emo_positive' => '正面',
        '_emo_negative' => '负面',
        '_emo_neutral' => '中立',
    ],
    'related'=>[
        '1' => '',
        '0' => '_def_not_me',
    ],
    'warn'=>[
        '1' => '_warn_',
        '0' => '_warn_',
    ],
    'medias'=>[
        '_cat_print' => '纸媒',
        '_cat_network' => '网媒',
//        '_cat_tv'  => '卫视',
        '_cat_new' => '新媒体',
//        '_cat_bbs' => '论坛',
//        '_cat_blog' => '博客',
//        '_cat_wiki' => '百科',
//        '_cat_video' => '视频',
        '_cat_weibo' => '微博',
        '_cat_weixin' => '微信'
    ],
    'errMsg'=>[
        'overcount' => '超过文章上限,最多加5篇',
        'keywordExist' =>'关键字已存在',
        'eventExist' =>'事件重名',
        'tokenOverdue' => '人品已过期，带您重新登录'
    ],
    'medias_count'=>[
        'print' => 'print_cnt',
        'network' => 'network_cnt',
        'tv'  => 'tv_cnt',
        'new' => 'new_cnt',
        'bbs' => 'bbs_cnt',
        'blog' => 'blog_cnt',
        'wiki' => 'wiki_cnt',
        'video' => 'video_cnt',
        'weibo' => 'weibo_cnt',
        'weixin' => 'weixin_cnt'
    ],
    'tags' => ['emotion','related','warn'],
    'redis_pr'=>[
        'emo' => 'emotion_',
        'del_art' => 'del_article_'
    ]
];