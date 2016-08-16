#coding:utf-8

__author__ = 'commissar'
import logging
import sys

DB_HOST = '192.168.1.202'
DB_PORT = 3306
DB_NAME = 'rocket_db'
DB_USER = 'root'
DB_PASS = 'pzzh123456'

REDIS_IP = '192.168.1.202'
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_PASSWORD = "pzzh123456"

TOKEN_EXPIRE_TIME = 43200
TOKEN_EXPIRE_TIME_FOR_MOBILE = 10000000#sys.maxint
KICKED_EXPIRE_TIME = 3600
CAPTCHA_EXPIRE_TIME = 120
FEEDBACK_EXPIRE_TIME = 120 #反馈限制时间两分钟
SET_CAPT_EXPIRE_TIME = 60
VERIFY_EXPIRE_TIME = 120
STATE_EXPIRE_TIME = 600 #STATE参数两分钟后超时
TICKET_EXPIRE_TIME = 7200 #STATE参数两分钟后超时
CAPTCHA_ERR_LIMIT_NUM = 5      # 限制只能连续输入错误5次
CAPTCHA_GET_LIMIT_NUM = 50
CAPTCHA_GET_LIMIT_TIME = 3600  # 限制一个小时内最多获取7次验证码

CAPTCHA_NUM_STR = 'captnum_'  # redis中保存验证码获取次数的键为'captnum_'+tel
ERROR_NUM_STR = 'errnum_'  # redis中保存验证码获取次数的键为'errnum_'+tel
TOKEN_STR = 'token_'  # redis中保存token的键为'token_'+token
CAPTCHA_STR = 'captcha_'  # redis中保存手机验证码的键为'captcha_'+tel
VERIFY_STR = 'verify_'  # redis中保存图形验证码的键为'verify_'+tel
FEEDBACK_STR = 'feedback_' #redis中保存上传反馈时间限制的键为'feedback_'+xxx
STATE_STR = 'state_' #redis中保存微信认证参数state的键为'state_'+random_string
TICKET_STR = 'ticket' #redis中保存微信JS_SDK的票据信息的键为'ticket'

ES_HOST = 'http://192.168.1.202:9200'
GROUT_COMPANY_HOST = 'http://192.168.1.202:9700/company/%s'
GROUT_COM_MEDIA_CATE_HOST = 'http://192.168.1.202:9700/company/%s/media/category'
HOST_NAME_SUFFIX = ".puzhizhuhai.com"

# IOS最新版本号
NEWEST_VERSION_FOR_IOS = 10
# ANDROID最新版本号
NEWEST_VERSION_FOR_ANDROID = 10
# 移动平台
M_PLATFORM_IOS = 'ios'
M_PLATFORM_ANDROID = 'android'
# 版本和版本下载地址后缀
SUFFIX_VERSION = 'version'
SUFFIX_URL = 'url'

# 发送短信验证码相关
SMS_SEND = False
SMS_SEND_URL = 'http://gw.api.taobao.com/router/rest'
SECRET = 'df029e387e94e366539a4c3b8059dd1b'
METHOD = 'alibaba.aliqin.fc.sms.num.send'
APPKEY = '23346473'
SIGN_NAME = u'登录验证'
TEMPLATE_CODE = 'SMS_7820395'
TEMPLATE_PARAM = u'{"code":"%s","product":"普智数据中心"}'


#微信授权使用到的相关url
HOST = "open.weixin.qq.com"
AUTHORIZE_URL = "https://open.weixin.qq.com/connect/qrconnect" #获取认证码code的url
ACCESS_TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token" #获取access_token的url
REFRESH_TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/refresh_token" #刷新access_token的url
ACCESS_TOKEN_FOR_JS_SDK_URL = "https://api.weixin.qq.com/cgi-bin/token" #获取access_token_for_js_sdk的url
TICKET_URL = "https://api.weixin.qq.com/cgi-bin/ticket/getticket" #获取ticket的url

# app相关参数
APP_ID_FOR_WEB_JS_SDK = "wx22e54fb525672bb7"
APP_ID_FOR_WEB = "wxdb1db27ca81d84ad"
APP_ID_FOR_MOBILE = "wx1365150c268a27d5"
APP_SECRET_FOR_WEB_JS_SDK = "58f9d1e7cbc927d84b2c0b7f479458aa"
APP_SECRET_FOR_WEB = "d7beab71178a4d1d1ff05695a46a3089"
APP_SECRET_FOR_MOBILE = "029c371b8f5af005931d10796adc12e7"
JS_API = "jsapi"
REDIRECT_URI_SERVER = "http://home.puzhizhuhai.com/wx.html"
HOST_NAME = "http://home.puzhizhuhai.com"

# 其他参数
RESPONSE_TYPE = "code"
GRANT_TYPE = "authorization_code"
GRANT_TYPE_FOR_JS_SDK = "client_credential"
SCOPE_FOR_LOGIN = "snsapi_login"
SCOPE_FOR_USERINFO = "snsapi_userinfo"
SCOPE_FOR_BASE = "snsapi_base"

# 登录平台
PLATFORM_WEB = "web"
PLATFORM_MOBILE = "mobile"

# ES查询配置
GLOBAL_INDEX_ARTICLE = "articles"
GLOBAL_INDEX_MEDIA = "medias"


# token update_at提前时间

# 判断登录平台为mobile的用户是否已经下线的时间间隔,单位小时
TIME_GAP = 1

def getLogging():
    return logging.getLogger("tornado")

def getLoggingForUserAction():
    return logging.getLogger("rocket.raccoon.user_action")