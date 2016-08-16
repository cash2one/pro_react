#coding:utf-8

__author__ = 'yudh'

import json
import functools
from app.db.dao.redis_base import RedisBase
from app import setting
from conf.err_msgs import *


def rule_require(rule):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self,*args, **kw):
            token = self.request.headers.get("user_token", None)
            # platform = self.request.headers.get("platform", None)
            redis = RedisBase()
            if token and redis.exists_token(token):
                redis.expire_token(token)
                token_info = redis.get_token_info(token)
                # 检查当前token状态
                status_code = token_info['status']['code']
                if status_code != CODE_OK:
                    self.set_status(status_code,token_status[status_code]['reason'])
                    return {'result': False, 'msg': token_status[status_code]['msg']}
                rules = token_info['rule']
                if rule in rules:
                    return func(self,*args, **kw)
                else:
                    self.set_status(403)
                    return {'result': False, 'msg': err_msgs['PERMISSION_DENIED']}
            else:
                self.set_status(401)
                return {'result': False, 'msg': err_msgs['No_AUTHENTICATION']}
        return wrapper
    return decorator

def rule_require_or(or_rules):
    '''
    要求拥有至少一个权限。
    :param or_rules:    [list]要求需要的可供使用的权限名列表。
    :return:
    '''
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self,*args, **kw):
            token = self.request.headers.get("user_token", None)
            # platform = self.request.headers.get("platform", None)
            redis = RedisBase()
            if token and redis.exists_token(token):
                redis.expire_token(token)
                token_info = redis.get_token_info(token)
                rules = token_info['rule']

                src_rules = set(rules)

                t_rules = or_rules
                if not isinstance(or_rules,set):
                    in_rules = set(t_rules)
                else:
                    in_rules = or_rules

                #判断权限是否有交集。
                and_rules = in_rules & src_rules

                if not and_rules.isEmpty(): #有则代表有此权限
                    return func(self,*args, **kw)
                else:
                    self.set_status(403)
                    return {'result': False, 'msg': err_msgs['PERMISSION_DENIED']}
            else:
                self.set_status(401)
                return {'result': False, 'msg': err_msgs['No_AUTHENTICATION']}
        return wrapper
    return decorator

def token_require(func):
    @functools.wraps(func)
    def wrapper(self,*args, **kw):
        token = self.request.headers.get("user_token", None)
        # platform = self.request.headers.get("platform", None)
        redis = RedisBase()
        if token and redis.exists_token(token):
            redis.expire_token(token)
            token_info = redis.get_token_info(token)
            # 检查当前token状态
            status_code = token_info['status']['code']
            if status_code != CODE_OK:
                self.set_status(status_code,token_status[status_code]['reason'])
                return {'result': False, 'msg': token_status[status_code]['msg']}

            return func(self,*args, **kw)
        else:
            self.set_status(401)
            return {'result': False, 'msg': err_msgs['No_AUTHENTICATION']}
    return wrapper

class UserTokenInfo(object):
    '''
    此类是用户的token信息处理类，用于替换原有代码泛滥的token操作。
    '''
    def __init__(self):
        pass

