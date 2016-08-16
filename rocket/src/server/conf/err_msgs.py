# coding:utf8

CODE_OK = 200
CODE_COM_MODIFIED = 421
CODE_USER_DELETED = 422
CODE_USER_MODIFIED = 423
CODE_USER_KICKED = 424
CODE_APP_NEW_VERSION_AVAILABLE = 425

CODE_INVALID = 1

err_msgs = {

    'PARAMS_MISSING':     '参数缺失',
    'PARAMS_ERROR':       '参数错误',
    'VERSION_NOT_EXIST':  '版本超前或不存在',
    # /api/v1/user/authcode
    'SMS_GET_FREQUENT':   '短信验证码获取过于频繁',
    # post /api/v1/user/login
    'TEL_NOT_EXIST':      '手机号不存在',
    'TEL_EXIST':          '手机号已存在',
    'TEL_NOT_SAME':       '原手机号码错误',
    'TEL_ALREADY_BOUND':  '此手机号已绑定',
    'ROLE_NOT_EXIST':     '用户没有该角色',
    'TEL_OR_ROLE_NOT_EXIST':'手机号或者用户角色不存在',
    'HAS_LOGIN':          '用户已登录',
    'SMS_TIMEOUT':        '短信验证码已失效',
    'SMS_ERR':            '短信验证码错误',
    'VERIFY_TIMEOUT':     '图形验证码已失效',
    'VERIFY_ERR':         '图形验证码错误',
    # post /api/v1/company
    'COM_CONF_ERR':       '设置公司配置信息出错，创建公司失败',
    'INDEX_CREATE_ERR':   '索引创建出错，创建公司失败',
    'COM_UUID_EXIST':     '公司ID已重复，请重新输入或者选择参考ID',
    # delete /api/v1/company
    'HAS_COMS':           '该集团下还有公司，不能删除',
    # post /api/v1/syndicate
    'ROLE_SUP_MGR_EXIST': '该用户已存在超级管理员角色',
    # post /api/v1/admins
    'ROLE_ADMIN_EXIST': '该用户已存在管理员角色',
    # post /api/v1/manager
    'MSG_EXIST':          '该运营员已存在',
    'TEL_NAME_NOT_MATCH': '手机号和姓名不匹配',
    # post /api/v1/viewer
    'VIEW_EXIST':         '该观察者已存在',
    'PERMISSION_DENIED':  '没有权限',
    'No_AUTHENTICATION':  '人品已过期，带您重新登录',
    # delete /api/v1/super/{user_id}
    'CANT_DEL_LAST_SUP':  '集团下至少存在一个超级管理员',
    # get /api/v2/managers
     #/api/v1/feedback
    'QUERY_TOO_FAST':     '请求过于频繁，请稍后尝试。',
    # 微信登陆相关错误信息
    'WX_NOT_BOUND':       '该微信号未绑定用户',
    'USER_NOT_FOUND':     '用户不存在',
    'USER_NOT_BOUND':     '用户还没有绑定微信',
    'USER_ID_NOT_ACQUIRED':'用户ID未获得',
    'STATE_ARG_NOT_ACQUIRED':'state参数未获取',
    'REDIRECT_URL_ARG_NOT_ACQUIRED':'redirect_url参数未获取',
    'OPENID_NOT_SAME':    '用户绑定的OpendID和登录的OpenID不一致',
    'AUTH_INFO_ACQUIRED_FAILURE':'认证信息获取失败',
    '40001':              'appid无效或者appsecret错误',
    '40029':              '不合法或已过期的code',
    '40039':              '不合法的url长度',
    '40048':              '不合法的url域名',
    '40066':              '不合法的url',
    '42003':              'code超时',
    'STATE_TIME_OUT':     'state参数超时',
    'WX_ALREADY_BOUND':   '该微信号已被绑定',
    'AUTHCODE_NOT_ACQUIRED':'认证码未获取',
    'USER_ROLE_NOT_ACQUIRED':'用户角色信息未获取',
    'ACCESS_COMPANY_DENIED':'无权访问此公司',
    '50000':              '内容解析错误',
    '40800':              '连接超时',
    '40801':              '连接错误',
    'ARTICLE_NOT_FOUND':  '文章未找到',
}
token_status = {
    CODE_OK: {
        'msg': u'正常'
    },
    CODE_COM_MODIFIED: {
        'reason': 'Company Has Been Deleted',
        'msg': u'当前管理公司发生改变，需要重新登陆。'
    },
    CODE_USER_DELETED: {
        'reason': 'User Has Been Deleted',
        'msg': u'当前用户已被删除，请退出。。'
    },
    CODE_USER_MODIFIED: {
        'reason': 'User Has Been Modified',
        'msg': u'当前用户已被修改，请退出。'
    },
    CODE_USER_KICKED: {
        'reason': 'User Has Been Kicked',
        'msg': u'当前用户已被踢出，请重新登录。'
    },
    CODE_APP_NEW_VERSION_AVAILABLE: {
        'reason': 'App Has New Version',
        'msg':u'APP版本有更新',
    }
}