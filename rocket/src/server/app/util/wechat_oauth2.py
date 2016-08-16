# -*-coding: utf-8 -*-
# !/usr/bin/env python
# from __future__ import unicode_literals

import requests
import random
import string
from app import setting
from requests.exceptions import (ConnectTimeout, ReadTimeout,
                                 ConnectionError as _ConnectionError,
                                 ContentDecodingError)
from urllib import urlencode
from json_import import simplejson
from conf.err_msgs import *
import hashlib

TIME_OUT=2

class OAuth2AuthExchangeError(Exception):
    def __init__(self, code, description):
        self.code = code
        self.description = description

    def __str__(self):
        return '%s: %s' % (self.code, self.description)


class ConnectTimeoutError(Exception):
    def __init__(self, code, description):
        self.code = code
        self.description = description

    def __str__(self):
        return '%s: %s' % (self.code, self.description)


class ConnectionError(Exception):
    def __init__(self, code, description):
        self.code = code
        self.description = description

    def __str__(self):
        return '%s: %s' % (self.code, self.description)

class DecodingError(Exception):
    def __init__(self, code, description):
        self.code = code
        self.description = description

    def __str__(self):
        return '%s: %s' % (self.code, self.description)

# 获取认证的url的工具方法
def _url_for_authorize(redirect_uri, scope=None, state=None):
    '''

    :param self:
    :param redirect_uri: 授权域
    :param scope: 权限范围
    :param state: 状态
    :return: 认证url
    '''
    client_params = {
        "appid": setting.APP_ID_FOR_WEB,
        "response_type": setting.RESPONSE_TYPE,
        "redirect_uri": redirect_uri,
    }
    if scope:
        client_params.update(scope=','.join(scope))
    if state:
        client_params.update(state=state)

    url_params = urlencode(client_params)
    return "%s?%s#wechat_redirect" % (setting.AUTHORIZE_URL, url_params)

# 拼接url字符串
def _data_for_exchange(code=None, refresh_token=None,platform='web'):
    '''

    :param code:  认证码
    :param refresh_token: 刷新token，这个参数暂时没用
    :return: 返回换取access_token的url
    '''
    if platform == setting.PLATFORM_MOBILE:
        appid = setting.APP_ID_FOR_MOBILE
        appsecret = setting.APP_SECRET_FOR_MOBILE
    else:
        appid = setting.APP_ID_FOR_WEB
        appsecret = setting.APP_SECRET_FOR_WEB

    app_params = {
        "appid":appid,
    }
    if code:
        app_params.update(code=code,
                          secret=appsecret,
                          grant_type=setting.GRANT_TYPE)
    str_app_parmas = {}
    for k, v in app_params.iteritems():
        str_app_parmas[k] = unicode(v).encode('utf-8')
    url_params = urlencode(str_app_parmas)
    return "%s?%s" % (setting.ACCESS_TOKEN_URL, url_params)


# 换取access_toiken
def exchange_for_access_token(code,refresh_token,platform):
    '''

    :param code:  认证码
    :param refresh_token: 刷新token，这个参数暂时没用
    :return: 返回access_token，openid等信息,json格式
    '''
    # 首先获取  换取access_token的url
    access_token_url = _data_for_exchange(code,refresh_token,platform)
    return get_data(access_token_url)

# 获取认证url
def get_authorize_url(redirect_uri,scope, state):
    '''

    :param self:
    :param redirect_uri: 重定向
    :param scope: 权限范围
    :param state: 状态
    :return: 认证url
    '''
    return _url_for_authorize(redirect_uri=redirect_uri, scope=scope, state=state)

# 生成随机字符串,包含数字和字符,用于生成微信认证的state参数 默认6位长度
def random_string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    '''

    :param size:生成的字符串长度
    :param chars: 由哪些部分组成
    :return: 随机字符串
    '''
    return ''.join(random.choice(chars) for _ in range(size))

# 返回调用js_sdk的url
def _data_for_exchange_for_js_sdk():
    app_params = {
        "appid":setting.APP_ID_FOR_WEB_JS_SDK,
        "secret":setting.APP_SECRET_FOR_WEB_JS_SDK,
        "grant_type":setting.GRANT_TYPE_FOR_JS_SDK
    }
    str_app_parmas = {}
    for k, v in app_params.iteritems():
        str_app_parmas[k] = unicode(v).encode('utf-8')
    url_params = urlencode(str_app_parmas)
    return "%s?%s" % (setting.ACCESS_TOKEN_FOR_JS_SDK_URL, url_params)

# 获取js_sdk的access_token
def exchange_for_access_token_for_js_sdk():
    # 首先获取  换取access_token的url
    access_token_for_js_sdk_url = _data_for_exchange_for_js_sdk()
    return get_data(access_token_for_js_sdk_url)

# 返回调用js_sdk的url
def _data_for_ticket(access_token):
    """
    返回调用js_sdk的url
    :param access_token: 用于获取ticket的access_token
    :return:
    """
    app_params = {
        "access_token":access_token,
        "type":setting.JS_API
    }
    str_app_parmas = {}
    for k, v in app_params.iteritems():
        str_app_parmas[k] = unicode(v).encode('utf-8')
    url_params = urlencode(str_app_parmas)
    return "%s?%s" % (setting.TICKET_URL, url_params)

# 请求ticket
def exchange_for_ticket(access_token):
    exchange_for_ticket_url = _data_for_ticket(access_token)
    return get_data(exchange_for_ticket_url)

# 请求获取参数
def get_data(url):
    # 异常捕获 处理的时候暂时不抛出，返回错误给前端
    try:
        response = requests.get(url, timeout=TIME_OUT)
        # 数据解码解析
        parsed_content = simplejson.loads(response.content.decode())
    # 超时
    except (ConnectTimeout, ReadTimeout):
        parsed_content = {
            "errcode": 40800,
        }
    # 链接错误
    except _ConnectionError:
        parsed_content = {
            "errcode": 40801,
        }
    # 解码异常
    except ContentDecodingError:
        parsed_content = {
            "result": 50000,
        }
    # 返回的内容
    return parsed_content

# 使用sha1算法生成签名
def sha1_signature(str):
    """
    使用sha1算法生成签名
    :param str: 用于生成签名的字符串
    :return: 签名
    """
    return hashlib.sha1(str).hexdigest()

# 拼接签名字符串
def con_str_from_dic(urlencode=True,**kwargs):
    """
    拼接签名字符串
    :param urlencode: 是否对url进行编码
    :param kwargs: 拼接的参数
    :return: 拼接后的字符串
    """
    # 按字典序
    str_arr = []
    for key in sorted(kwargs.iterkeys()):
        str_arr.append(key+"="+kwargs[key])
    return "&".join(str_arr)