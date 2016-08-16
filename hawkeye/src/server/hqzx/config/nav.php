<?php
/**
 * Created by PhpStorm.
 * User: xzc
 * Date: 16-5-30
 * Time: 下午5:39
 */

return [
    /*
     |--------------------------------------------------------------------------
     | 大数据导航分类信息
       * authority  代表权威机构信息
       * industry   代表行业报告
       * index      代表指数榜单。
       * sales      代表销量票房
     | name：工具名称；info：简述；website：推荐跳转网站；url：网站域名；search_url：真实搜索地址；
     | search_type：搜索类型
        normal:字符串链接
        post:需要通过post表单进行传递搜索
        processed:关键字必须要经过网站自身处理转换才能搜索
        string_encode_gbk:关键字需转换为gb2312，再进行url编码，格式如：%D0%C5%CF%A2
        string_encode_js:关键字需转换为json，再将'\'替换为'%'，格式如：%u884c%u4e1a
     |--------------------------------------------------------------------------
     */
    'category' => array(
        'authority' => '权威机构信息',
        'industry'  => '行业报告',
        'index'     => '指数榜单',
        'sales'     => '销量票房'
    ),
    
    'authority' => array(
        array(
            'name'      =>  '政府信息查询',
            'info'      =>  '展示机构职责、发布政务信息、引领行业前沿、办事服务指南',
            'website'   =>  '中国网信网',
            'url'       =>  'http://www.cac.gov.cn',
            'search_url'  =>  'http://search.cac.gov.cn/was5/web/search?channelid=232085&searchword=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'      =>  '新闻记者证',
            'info'      =>  '查询记者证信息、相关文件法规、申报流程说明、违规违纪名录。',
            'website'   =>  '中国记者网',
            'url'       =>  'http://press.gapp.gov.cn',
            'search_url'  =>  'http://press.gapp.gov.cn/reporter/utils/search.html?word=',
            'search_type'   =>  'string_encode_gbk',
            'search_form'   => null
        ),
//        array(
//            'name'     =>  '证券信息查询',
//            'info'      =>  '证券相关的信息公示及其考试报名、成绩查询等',
//            'website'   =>  '中国证券业协会',
//            'url'       =>  'http://www.sac.net.cn',
//            'search_url'  =>  'http://www.sac.net.cn',
//            'search_type'   =>  'post',
//            'search_form'   =>  array(
//                'form_name' =>  null,
//                'form_id'   =>  'AdvForm',
//                'form_action'    =>  'http://www.sac.net.cn/was5/web/search',
//                'input_name'    =>  'sword',
//                'input_id'      =>  null,
//                'input_class'   =>  null
//            )
//        ),
//        array(
//            'name'     =>  '证券基金信息查询',
//            'info'      =>  '证券基金相关的信息公示及其考试报名、成绩查询等',
//            'website'   =>  '中国证券投资基金业协会',
//            'url'       =>  'http://www.amac.org.cn/',
//            'search_url'  =>  'http://www.amac.org.cn/cms/search?SiteID=22&Query=',
//            'search_type'   =>  'normal',
//            'search_form'   => null
//        ),
//        array(
//            'name'     =>  '世界银行数据',
//            'info'      =>  '免费并公开获取世界各国的发展数据',
//            'website'   =>  '世界银行',
//            'url'       =>  'http://data.worldbank.org.cn',
//            'search_url'  =>  'http://data.worldbank.org.cn',
//            'search_type'   =>  'post',
//            'search_form'   =>  array(
//                'form_name' =>  null,
//                'form_id'   =>  'wbboxes-goto-form-1',
//                'form_action'    =>  'http://data.worldbank.org.cn/frontpage',
//                'input_name'    =>  'goto',
//                'input_id'      =>  'edit-goto-1',
//                'input_class'   =>  null
//            )
//        ),
        array(
            'name'     =>  '国家数据',
            'info'      =>  '查询中国一系列指标的数据，并可查看可视化统计图。',
            'website'   =>  '国家数据',
            'url'       =>  'http://data.stats.gov.cn',
            'search_url'  =>  'http://data.stats.gov.cn/search.htm?s=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
//        array(
//            'name'     =>  '保险信息查询',
//            'info'      =>  '查看商业保险的政策法规和行业规则等保险类信息。',
//            'website'   =>  '中国保险监督委员会',
//            'url'       =>  'http://www.circ.gov.cn',
//            'search_url'  =>  'http://www.circ.gov.cn/dig/search.action?hl=zh-CN&sr=score+desc&q=',
//            'search_type'   =>  'normal',
//            'search_form'   => null
//        ),
//        array(
//            'name'     =>  '商标信息查询',
//            'info'      =>  '在线查询企业商标注册信息的网站',
//            'website'   =>  '中国商标网',
//            'url'       =>  'http://www.ctmo.gov.cn',
//            'search_url'  =>  'http://gzhd.saic.gov.cn/saicsearch/index.jsp',
//            'search_type'   =>  'post',
//            'search_form'   =>  array(
//                'form_name' =>  'myform1',
//                'form_id'   =>  'myform1',
//                'form_action'    =>  'http://gzhd.saic.gov.cn/saicsearch/index.jsp',
//                'input_name'    =>  'key',
//                'input_id'      =>  null,
//                'input_class'   =>  null
//            )
//        ),
        array(
            'name'     =>  '国家工商总局',
            'info'      =>  '查看政策法规 规划计划 公告公示 办事指南等信息',
            'website'   =>  '中华人民共和国国家工商行政管理总局',
            'url'       =>  'http://www.saic.gov.cn',
            'search_url'  =>  'http://searchsaic.saic.gov.cn/was5/web/search?channelid=229576&orderby=-IR_URLTIME&searchword=',
            'search_type'   =>  'normal',
            'search_form'   => null
        )

    ),

    'industry' => array(
        array(
            'name'     =>  '百度数据',
            'info'      =>  '依据每天数亿人次的搜索分析各行业数据,提供行业研究报告以及行业品牌排名。',
            'website'   =>  '百度数据报告',
            'url'       =>  'http://data.baidu.com',
            'search_url'  =>  'http://data.baidu.com/results.php?wd=',
            'search_type'   =>  'string_encode_gbk',
            'search_form'   => null
        ),
        array(
            'name'     =>  '阿里数据',
            'info'      =>  '托阿里巴巴集团海量数据、深耕小企业前沿案例、打造具影响力的新商业知识平台。',
            'website'   =>  '阿里研究院',
            'url'       =>  'http://www.aliresearch.com/',
            'search_url'  =>  'http://aliresearch.com/blog/index/search.html?keywords=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'     =>  '艾瑞网',
            'info'      =>  '聚合互联网数据资讯,融合互联网行业资源,提供电子商务、移动互联网、网络游戏、网络广告、网络营销等行业内容',
            'website'   =>  '艾瑞网',
            'url'       =>  'http://report.iresearch.cn',
            'search_url'  =>  'http://s.iresearch.cn/search/',
            'search_type'   =>  'normal/',
            'search_form'   => null
        )

    ),

    'index' => array(
//        array(
//            'name'     =>  '优酷指数',
//            'info'      =>  '优酷视频网站数据为基础的基于视频技术手段获取的视频播放数、搜索量、评论、站外引用等多维度进行数据统计',
//            'website'   =>  '优酷指数',
//            'url'       =>  'http://index.youku.com',
//            'search_url'  =>  'http://index.youku.com/',
//            'search_type'   =>  'processed',
//            'search_form'   =>  array(
//                'form_name' =>  null,
//                'form_id'   =>  null,
//                'form_action'    =>  null,
//                'input_name'    =>  null,
//                'input_id'      =>  'queryWord',
//                'input_class'   =>  null
//            )
//        ),
        array(
            'name'     =>  '微博指数',
            'info'      =>  '通过关键词的热议度，以及行业/类别的平均影响力，来反映微博舆情或账号的发展走势',
            'website'   =>  '微指数',
            'url'       =>  'http://data.weibo.com/index',
            'search_url'  =>  'http://data.weibo.com/index/hotword?wid=&wname=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'     =>  '好搜指数',
            'info'      =>  '基于360搜索的大数据分享平台。通过指数查询,可掌握关键字热度趋势、理解用户真实需求、了解关键字搜索的人群属性',
            'website'   =>  '360指数',
            'url'       =>  'http://index.so.com/#index',
            'search_url'  =>  'http://index.so.com/#trend?q=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'     =>  '百度指数',
            'info'      =>  '以百度海量网民行为数据为基础的数据分享平台',
            'website'   =>  '百度指数',
            'url'       =>  'http://index.baidu.com',
            'search_url'  =>  'http://index.baidu.com/?tpl=trend&word=',
            'search_type'   =>  'string_encode_gbk',
            'search_form'   => null
        ),
//        array(
//            'name'     =>  '阿里指数',
//            'info'      =>  '最权威专业的行业价格、供应、采购趋势分析',
//            'website'   =>  '阿里指数',
//            'url'       =>  'http://index.1688.com',
//            'search_url'  =>  'http://index.1688.com/alizs/market.htm',
//            'search_type'   =>  'post',
//            'search_form'   =>  array(
//                'form_name' =>  null,
//                'form_id'   =>  null,
//                'form_action'    =>  'http://index.1688.com/alizs/market.htm',
//                'input_name'    =>  'keywords',
//                'input_id'      =>  'alizs-input',
//                'input_class'   =>  'ui-autocomplete-input'
//            )
//        ),
        array(
            'name'     =>  'GS新媒体指数',
            'info'      =>  '中国第一个开放的新媒体指数平台',
            'website'   =>  '清博指数',
            'url'       =>  'http://www.gsdata.cn',
            'search_url'  =>  'http://www.gsdata.cn/query/wx?q=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'     =>  '新媒体排行榜',
            'info'      =>  '通过对各类事件、产品、人物等信息的排名,为广大网民提供一个客观的参考信息',
            'website'   =>  '新榜',
            'url'       =>  'http://www.newrank.cn',
            'search_url'  =>  'http://www.newrank.cn/public/info/search.html?isBind=false&value=',
            'search_type'   =>  'string_encode_js',
            'search_form'   => null
        )

    ),

    'sales' => array(
        array(
            'name'      =>  '票房查询',
            'info'      =>  '专注于票房数据,提供电影日票房,周票房,年度票房等',
            'website'   =>  '中国票房',
            'url'       =>  'http://www.cbooo.cn',
            'search_url'  =>  'http://www.cbooo.cn/search?k=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'     =>  '美国票房查询',
            'info'      =>  '美国在线的电影票房数据统计网站',
            'website'   =>  'BOM票房数据',
            'url'       =>  'http://www.boxofficemojo.com/alltime/',
            'search_url'  =>  'http://www.boxofficemojo.com/search/?q=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
//        array(
//            'name'     =>  'app运营数据',
//            'info'      =>  '涵盖下载量、活跃量、用户评价等多个数据监测维度',
//            'website'   =>  '清源火眼',
//            'url'       =>  'http://www.huoyanapp.com',
//            'search_url'  =>  'http://www.huoyanapp.com/',
//            'search_type'   =>  'processed',
//            'search_form'   =>  array(
//                'form_name' =>  null,
//                'form_id'   =>  null,
//                'form_action'    =>  null,
//                'input_name'    =>  'keywords',
//                'input_id'      =>  'alizs-input',
//                'input_class'   =>  'form-control'
//            )
//        ),
        array(
            'name'     =>  '网站排名查询',
            'info'      =>  '免费提供排名的官方数据查询，网站访问量查询，排名变化趋势数据查询',
            'website'   =>  'alexa',
            'url'       =>  'http://www.alexa.cn',
            'search_url'  =>  'http://www.alexa.cn/index.php?url=',
            'search_type'   =>  'normal',
            'search_form'   => null
        ),
        array(
            'name'     =>  '微博可视分析',
            'info'      =>  '通过直观的视图清晰地呈现出一个事件中微博转发的过程',
            'website'   =>  '微博可视分析工具',
            'url'       =>  'http://vis.pku.edu.cn/weibova/weiboevents/',
            'search_url'  =>  'http://vis.pku.edu.cn/weibova/weiboevents/weiboevents.html?event=',
            'search_type'   =>  'string_encode_gbk',
            'search_form'   => null
        )


    )

];