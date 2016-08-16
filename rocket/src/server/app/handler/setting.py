#coding:utf-8

__author__ = 'commissar'

import json
import os
from pyrestful import mediatypes
from pyrestful.rest import get, post, put, delete
from app.db.model import UserConf

from app.util.base_handler import BaseHandler
from app.db.dao.users import UserDao
from app.db.dao.user_conf import UserConfDao
from app.db.dao.settings import SettingsDao
from app.db.dao.redis_base import RedisBase
from app.db.model import Users
from app.util.base_rbac import rule_require
from app.util.auth_code import AuthCode
from app import setting
from conf.version_info import *
from conf.err_msgs import err_msgs


class SettingHandler(BaseHandler):

    @get(_path='/api/v1/personal',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_setting_personal')
    def get_personal_setting(self):
        token = self.request.headers.get("user_token",None)

        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']

        user_db = UserDao(session=self.session)
        user_info = user_db.user(user_id)

        self.set_header('Content-Type', 'image/jpg')
        avatar = self.get_avatar(user_id)

        # 日志
        self.log_user_action(token_info.get("uuid"),"get_personal_setting","")

        result = {
            'user_type': Users.MAPPING[token_info['role_group']],
            'company': token_info['company']['name'] if token_info.get('company') else '',
            'user_name': user_info['user_name'],
            'telephone': user_info['telephone'],
            'email': user_info['email'],
            'avatar': avatar,
            'openid': token_info['openid']
        }
        return result

    @put(_path='/api/v1/personal', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_setting_personal')
    def update_personal_setting(self):
        user_name = self.get_argument('user_name',"")
        email = self.get_argument('email',"")
        self.logger.info("user_name:"+user_name+"email:"+email)

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']

        # 更新用户信息
        usr_db = UserDao(session=self.session)
        usr_db.update_user_v2(user_id,user_name)

        # 更新用户配置信息
        usr_conf_db = UserConfDao(session=self.session)
        usr_conf_db.update_account(user_id,UserConf.TYPE_EMAIL,email)

        # 更新token 不需要重新生产token
        token_info['name'] = user_name
        redis.set_token(token,json.dumps(token_info))
        # 日志
        self.log_user_action(token_info.get("uuid"),"update_personal_setting","-")

        return {'result': True}

    @put(_path='/api/v1/bind_telephone', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_setting_personal')
    def bind_telephone(self):
        telephone_old = self.get_argument('telephone_old',"")
        telephone_new = self.get_argument('telephone_new',"")
        captcha = self.get_argument("captcha","")
        self.logger.info("  telephone:"+telephone_new)

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']

        usr_db = UserDao(session=self.session)
        user_info = usr_db.user(user_id)

        if telephone_old != user_info["telephone"]:
            result = {
                'result': False,
                'msg': err_msgs['TEL_NOT_SAME']
            }
            self.set_status(400)
            return result

        if telephone_old != telephone_new and usr_db.get_user_id_by_tel(telephone_new):
            result = {
                'result': False,
                'msg': err_msgs['TEL_ALREADY_BOUND']
            }
            self.set_status(400)
            return result

        r_captcha = self.redis_captcha(telephone_old)
        authcode = redis.get_value(r_captcha)

        if not authcode:
            result = {
                'result': False,
                'msg': err_msgs['SMS_TIMEOUT']
            }
            self.set_status(400)
            return result

        if authcode != captcha:
            result = {
                'result': False,
                'msg': err_msgs['SMS_ERR']
            }
            self.set_status(400)
            return result

        # 删除redis中的验证码信息
        redis.del_key(r_captcha)
        usr_db.bind_user_with_tel(user_id,telephone_new)
        token_info['telephone'] = telephone_new
        redis.set_token(token,json.dumps(token_info))
        # 日志
        self.log_user_action(token_info.get("uuid"),"bind_telephone",telephone_new)

        return {'result': True}

    @get(_path='/api/v1/version',  _produces=mediatypes.APPLICATION_JSON)
    def get_version_info(self):
        return version_info
        
    # 获取最新版本
    @get(_path='/api/v1/version/{version}/{m_platform}',  _produces=mediatypes.APPLICATION_JSON)
    def newest_version(self,version,m_platform):
        result = {}
        # 参数缺失
        if not version or not m_platform:
            result.update({
                "result": False,
                "msg": err_msgs["PARAMS_MISSING"]
            })
            self.set_status(400)
        # 判断是否最新版本
        else:
            setting_db = SettingsDao(session=self.session)
            newest_version = setting_db.is_newest_version(version,m_platform)
            if not newest_version:
                url = setting_db.newest_version_download_url(m_platform)
                if url:
                    result.update({
                        "isnewest": False,
                        "url": url,
                    })
                else:
                    self.logger.warning("Database has not newest version download url!")
                    result.update({
                        "isnewest": True,
                    })
            else:
                result.update({
                    "isnewest": True,
                })

        return result
        
    @post(_path='/api/v1/avatar',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_setting_personal')
    def set_avatar(self):
        dir_path = os.path.abspath(os.path.join( os.path.dirname(__file__),os.path.pardir,os.path.pardir,os.path.pardir, 'dist/avatar'))
        avatar=self.request.files.get('avatar')
        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']
        filename = user_id + '.jpg'
        filepath = os.path.join(dir_path,filename)
        with open(filepath,'wb') as up:
            up.write(avatar[0]['body'])
        # 日志
        self.log_user_action(token_info.get("uuid"),"set_avatar","-")

        return {'result': True}

    @post(_path='/api/v1/setting/authcode',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_setting_personal')
    def captcha(self):
        telephone = self.get_argument("telephone",'')

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']

        user = UserDao(session=self.session)
        user_info = user.user(user_id)
        old_tel = user_info['telephone']

        if old_tel != telephone and user.get_user_id_by_tel(telephone):
            result = {
                'result': False,
                'msg': err_msgs['TEL_EXIST']
            }
            self.set_status(400)
            return result

        if setting.SMS_SEND:
            send_res = AuthCode().send_msg(telephone)
            if send_res['result']:
                code = send_res['code']
            else:
                result = send_res
                self.set_status(400)
                return result
        else:
            code = '123456'

        r_captcha = self.redis_captcha(telephone)
        redis.set_value(r_captcha, code)
        redis.expire(r_captcha,setting.SET_CAPT_EXPIRE_TIME)
        result = {
            'result': True,
            'msg': "OK"
        }
        return result