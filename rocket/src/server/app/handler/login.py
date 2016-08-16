# coding=utf-8

__author__ = 'commissar'

import json
import traceback

from pyrestful import mediatypes
from pyrestful.rest import post,get,put
from io import BytesIO

from app.util.base_handler import BaseHandler
from app.util.verify_code import VerifyCode
from app.util.auth_code import AuthCode
from app.util.datetime_util import *
from app.util.wechat_oauth2 import exchange_for_access_token,get_authorize_url,\
    random_string_generator,exchange_for_access_token_for_js_sdk,exchange_for_ticket,\
    sha1_signature,con_str_from_dic
from app.util.base_rbac import token_require
from app.db.dao.users import UserDao
from app.db.dao.user_last_status import UserLastStatusDao
from app.db.dao.user_conf import UserConfDao
from app.db.dao.settings import SettingsDao
from app.db.dao.company import CompanyDao
from app.db.dao.redis_base import RedisBase
from app.db.model import Users, UserConf
from app import setting
from conf.err_msgs import *

class LoginHandler(BaseHandler):

    def set_token_info_and_user_conf(self, user_id, role, telephone, platform=setting.PLATFORM_WEB, app_version_info=None):
        '''
        生成token并将token_info存入redis，且更新用户最新状态表
        :param user_id:
        :param role:
        :param telephone:
        :param platform:
        :return: 返回token
        '''
        kwargs = {
            'app_version_info': app_version_info,
        }
        # 设置token信息
        info = json.dumps(self.gen_token_info(user_id, role, platform,**kwargs))
        print info
        token = self.build_token(telephone)
        self.redis.set_token(token,info,True,platform=platform)
        # 设置用户最新状态表中的token信息
        usr_status_db = UserLastStatusDao(session=self.session)
        usr_status_db.set_token(user_id,role,token,platform)
        return token

    # 判断用户是否已经登录，已经登录的话改变前一token的状态信息
    def login_admin(self,user_id,telephone):
        '''
        TODO:处理管理员登陆。
        :return: token
        '''
        usr_status_db = UserLastStatusDao(session=self.session)
        status = usr_status_db.get_specific_status(user_id, Users.ROLE_ADMIN, setting.PLATFORM_WEB)
        if status and status.token and self.redis.exists_token(status.token):
            old_token = self.redis.get_token_info(status.token)
            old_token['status'] = {
                'code': CODE_USER_KICKED,
                'msg': token_status[CODE_USER_KICKED]['msg']
            }
            self.redis.set_token(status.token,json.dumps(old_token),False)
        # 日志
        self.log_user_action(user_id,"login",Users.ROLE_ADMIN)

        return self.set_token_info_and_user_conf(user_id,Users.ROLE_ADMIN,telephone, setting.PLATFORM_WEB)

    # 判断用户是否已经登录，已经登录的话改变前一token的状态信息
    def login_manager(self,user_id,telephone):
        '''
        TODO:处理运营员登陆。
        :return: token
        '''
        usr_status_db = UserLastStatusDao(session=self.session)
        status = usr_status_db.get_specific_status(user_id, Users.ROLE_MANAGER, setting.PLATFORM_WEB)
        if status and status.token and self.redis.exists_token(status.token):
            old_token = self.redis.get_token_info(status.token)
            old_token['status'] = {
                'code': CODE_USER_KICKED,
                'msg': token_status[CODE_USER_KICKED]['msg']
            }
            self.redis.set_token(status.token,json.dumps(old_token),False)
        # 日志
        self.log_user_action(user_id,"login",Users.ROLE_MANAGER)

        return self.set_token_info_and_user_conf(user_id,Users.ROLE_MANAGER,telephone, setting.PLATFORM_WEB)

    # 同一集团下只允许一个超级管理员登录成功
    def login_super_manager(self,user_id,telephone):
        '''
        TODO:处理超级运营员登陆.
        :return: token
        '''
        usr_conf_db = UserConfDao(session=self.session)
        syndicate = usr_conf_db.get_companys_by_userid_and_type(user_id,UserConf.TYPE_ROLE_SUPMGR)[0]
        tokens = self.redis.get_all_tokens()
        for token in tokens:
            token_info = json.loads(self.redis.get_value(token))
            role_group = token_info.get('role_group')
            syndicate_uuid = token_info.get('syndicate_uuid')
            if role_group == Users.ROLE_SUP_MGR and syndicate_uuid == syndicate:
                token_info['status'] = {
                    'code': CODE_USER_KICKED,
                    'msg': token_status[CODE_USER_KICKED]['msg']
                }
                self.redis.set_value(token,json.dumps(token_info))
                self.redis.expire(token,setting.KICKED_EXPIRE_TIME)
        # 日志
        self.log_user_action(user_id,"login",Users.ROLE_SUP_MGR)

        return self.set_token_info_and_user_conf(user_id,Users.ROLE_SUP_MGR,telephone, setting.PLATFORM_WEB)

    # 判断用户是否已经登录，已经登录的话改变前一token的状态信息
    def login_viewer(self, user_id, telephone, app_version_info):
        '''
        TODO:处理管理员登陆。
        :return:
        '''
        usr_status_db = UserLastStatusDao(session=self.session)
        usr_conf_db = UserConfDao(session=self.session)
        com_db = CompanyDao(session=self.session)

        status = usr_status_db.get_specific_status(user_id, Users.ROLE_VIEWER, setting.PLATFORM_MOBILE)
        if status and status.token and self.redis.exists_token(status.token):
            old_token = self.redis.get_token_info(status.token)
            old_token['status'] = {
                'code': CODE_USER_KICKED,
                'msg': token_status[CODE_USER_KICKED]['msg']
            }
            self.redis.set_token(status.token,json.dumps(old_token),False)

        # 如果是手机端,则在登陆时一次性将公司列表也返回
        companys = usr_conf_db.get_companys_by_userid_and_type(user_id, UserConf.TYPE_ROLE_VIEWER)

        company_list = []
        for com_uuid in companys:
            company = com_db.get_company_by_uuid(com_uuid,False)

            t_item = {
                'uuid': com_uuid,
                'name': company['name'],
                'desc': company['desc'],
                'property': company['property'],
                'py': company['py'],
                'id': company['id']
            }
            company_list.append(t_item)
            company_list.sort(key=lambda com: com["py"])
        # 日志
        self.log_user_action(user_id,"login",Users.ROLE_VIEWER)

        return company_list,self.set_token_info_and_user_conf(user_id,Users.ROLE_VIEWER,telephone, setting.PLATFORM_MOBILE,app_version_info)

    # 用户登录
    @post(_path='/api/v1/user/login',  _produces=mediatypes.APPLICATION_JSON)
    def login(self):
        telephone = self.get_argument("telephone","")
        captcha = self.get_argument("captcha","")
        role = self.get_argument("role","")
        platform = self.get_argument('from', setting.PLATFORM_WEB)
        v_id = self.get_argument('v_id', None)
        v_code = self.get_argument('verify_code',None)
        app_version = self.get_argument("app_version",None)
        m_platform = self.get_argument("m_platform",None)
        syn_uuid = self.get_argument("syn_uuid",None)
        ret = self.verify_args(captcha,telephone,v_id,v_code,role,platform,app_version,m_platform,syn_uuid)
        result = {}
        if ret and ret['result']:
            token = None
            if role == Users.ROLE_ADMIN:
                token = self.login_admin(ret['user_id'],telephone)
            elif role == Users.ROLE_SUP_MGR:
                token = self.login_super_manager(ret['user_id'],telephone)
            elif role == Users.ROLE_MANAGER:
                token = self.login_manager(ret['user_id'],telephone)
            elif role == Users.ROLE_VIEWER:
                setting_db = SettingsDao(session=self.session)
                is_newest = setting_db.is_newest_version(app_version,m_platform)
                if not is_newest:
                    self.set_status(CODE_APP_NEW_VERSION_AVAILABLE,token_status[CODE_APP_NEW_VERSION_AVAILABLE]['msg'])
                app_version_info = {
                    'app_version': app_version,
                    'm_platform': m_platform,
                }
                companys,token = self.login_viewer(ret['user_id'], telephone, app_version_info)
                result.update(companys=companys,hostname=syn_uuid+setting.HOST_NAME_SUFFIX)
            else:
                pass

            result.update({
                'result': True,
                'msg': "OK",
                'token': token,
            })
        else:
            result.update(ret)
        return result

    # 用户注销
    @post(_path='/api/v1/user/logout',  _produces=mediatypes.APPLICATION_JSON)
    def logout(self):
        token = self.request.headers.get("user_token",None)
        token_info = self.get_token()
        if token:
            self.redis.del_key(self.redis_token(token))

        result = {
            'result': True,
            'msg': "OK"
        }
        # 日志
        self.log_user_action(token_info.get("uuid"),"logout",token_info.get("role_group"))

        return result

    # 生成手机验证码
    @post(_path='/api/v1/user/authcode',  _produces=mediatypes.APPLICATION_JSON)
    def captcha(self):
        telephone = self.get_argument("telephone",'')
        role = self.get_argument("role",None)

        user = UserDao(session=self.session)
        user_id = user.get_user_id_by_tel_and_role(telephone,role)
        if not user_id:  # 判断手机号是否存在
            result = {
                'result': False,
                'msg': err_msgs['TEL_OR_ROLE_NOT_EXIST']
            }
            self.set_status(400)
            return result

        # if not user.exist_role_group(user_id, role):  # 判断用户是否存在该角色
        #     result = {
        #         'result': False,
        #         'msg': err_msgs['ROLE_NOT_EXIST']
        #     }
        #     self.set_status(400)
        #     return result

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
        self.redis.set_value(r_captcha, code)
        self.redis.expire(r_captcha,setting.CAPTCHA_EXPIRE_TIME)
        result = {
            'result': True,
            'msg': "OK"
        }
        return result

    # 生成图片验证码
    @get(_path='/api/v1/user/verify',  _produces=mediatypes.APPLICATION_JSON)
    def verify(self):
        v_id = self.get_argument("v_id")
        
        vecode = VerifyCode()
        code_img,capacha_code= vecode.createCodeImage()

        r_vid = self.redis_verify(v_id)
        self.redis.set_value(r_vid, capacha_code)
        self.redis.expire(r_vid,setting.VERIFY_EXPIRE_TIME)

        msstream=BytesIO()
        code_img.save(msstream,"jpeg")
        # code_img.close()
        self.set_header('Content-Type', 'image/jpg')
        self.write(msstream.getvalue())

    # 微信绑定
    @post(_path='/api/v1/user/bind_wx',  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def bind_wx(self):
        # 获取参数
        code = self.get_argument("code",None)
        token = self.request.headers.get("user_token",None)
        platform = self.get_argument("from","web")
        result = {}

        # 未获取认证码
        if not code:
            result.update({
                "result":False,
                "msg":err_msgs['PARAMS_MISSING']
            })
            self.set_status(400)
        else:
            # 从token中获取user_id
            token_info = self.redis.get_token_info(token)


            #user = user_db.get_user_by_uuid(uuid)
            if not token_info:
                result.update({
                    "result":False,
                    "msg":err_msgs['USER_NOT_FOUND']
                })
                self.set_status(400)
            else:
                # 查找拥有此user_id的用户
                user_db = UserDao(session=self.session)

                uuid = token_info['uuid']
                openid = token_info["openid"]
                role_group = token_info["role_group"]

                if not user_db.isbind_wx_user(uuid):# 微信号被绑定过之后不再允许绑定

                    # 换取access_token等信息
                    auth_info = exchange_for_access_token(code,None,platform)

                    # 获取auth_info失败
                    if auth_info.get('errcode', 0):
                        result.update({
                            "result":False,
                            "msg":err_msgs[str(auth_info.get('errcode', 0))],
                        })
                        self.set_status(502)

                    # openid和之前的不相同--添加或更新
                    elif auth_info.get('openid',0) and auth_info['openid'] != openid:
                        user_db.bind_user_with_openid(uuid,auth_info['openid'],role_group)
                        # 更新token
                        info = json.dumps(self.gen_token_info(uuid, role_group, platform,{}))
                        self.redis.set_token(token, info)
                        # 日志
                        self.log_user_action(uuid,"bind_wx","-")

                        result.update({
                            "result":True,
                            "msg":"OK",
                        })
                else:
                    result.update({
                            "result":False,
                            "msg":err_msgs['WX_ALREADY_BOUND'],
                            "bound": True,
                        })
                    self.set_status(400)
                    # result.update({
                    #         "result":True,
                    #         "msg":"OK",
                    #     })

        return result

    # 微信登录
    @post(_path='/api/v1/user/login_wx',  _produces=mediatypes.APPLICATION_JSON)
    def login_wx(self):
        # 获取参数
        code = self.get_argument("code",None)
        platform = self.get_argument("from","web")
        state = self.get_argument("state",None)
        syn_uuid = self.get_argument("syn_uuid",None)
        # 获取state中存储的信息
        state_info = self.redis.get_state_info(state) if state else None

        result = {}
        # 未获取认证码
        if (platform == setting.PLATFORM_WEB and (not code or not state)) or (platform == setting.PLATFORM_MOBILE and (not code or not syn_uuid)):
            result.update({
                "result":False,
                "msg":err_msgs['PARAMS_MISSING']
            })
            self.set_status(400)
        elif platform == setting.PLATFORM_WEB and not state_info:
            result.update({
                "result":False,
                "msg":err_msgs['STATE_TIME_OUT'],
            })
            self.set_status(400)
        else:
            if platform == setting.PLATFORM_WEB:
                # 获取角色
                role = state_info.get('role')
            else:
                role = Users.ROLE_VIEWER

            # 换取access_token等信息
            auth_info = exchange_for_access_token(code,None,platform)

            # auth_info获取失败
            if auth_info.get('errcode', 0):
                result.update({
                    "result":False,
                    "msg":err_msgs[str(auth_info.get('errcode', 0))]
                })
                self.set_status(502)
            else:
                # 查找拥有此openid的用户
                user_db = UserDao(session=self.session)
                user = user_db.get_user_by_openid_and_role(auth_info['openid'],role)
                if not user:
                    result.update({
                        "result":False,
                        "msg":err_msgs['WX_NOT_BOUND']
                    })
                    self.set_status(400)
                else:
                    # 用户已登录将其踢出
                    usr_status_db = UserLastStatusDao(session=self.session)
                    status = usr_status_db.get_specific_status(user.user_id, role, platform)
                    if status and status.token and self.redis.exists_token(status.token):
                        old_token = self.redis.get_token_info(status.token)
                        old_token['status'] = {
                            'code': CODE_USER_KICKED,
                            'msg': token_status[CODE_USER_KICKED]['msg']
                        }
                        self.redis.set_token(status.token,json.dumps(old_token),False)
                    # 设置token信息
                    info = json.dumps(self.gen_token_info(user.user_id, role, platform,{}))
                    token = self.build_token(user.telephone)
                    self.redis.set_token(token,info,platform=platform)

                    # 设置用户最后一次状态表中的token信息
                    usr_status_db = UserLastStatusDao(session=self.session)
                    usr_status_db.set_token(user.user_id,role,token,platform=platform)
                    # 日志
                    self.log_user_action(user.user_id,"login_wx","-")

                    result.update({
                        "result":True,
                        "msg":"OK",
                        "token":token,
                    })
                    if platform == setting.PLATFORM_MOBILE:
                        # 如果是手机端,则在登陆时一次性将公司列表也返回
                        usr_conf_db = UserConfDao(session=self.session)
                        com_db = CompanyDao(session=self.session)
                        companys = usr_conf_db.get_companys_by_userid_and_type(user.user_id, UserConf.TYPE_ROLE_VIEWER)

                        company_list = []
                        for com_uuid in companys:
                            company = com_db.get_company_by_uuid(com_uuid,False)

                            t_item = {
                                'uuid': com_uuid,
                                'name': company['name'],
                                'desc': company['desc'],
                                'property': company['property'],
                                'py': company['py'],
                                'id': company['id']
                            }
                            company_list.append(t_item)
                            company_list.sort(key=lambda com: com["py"])
                        result.update(companys=company_list,hostname=syn_uuid+setting.HOST_NAME_SUFFIX)
        return result


    # 解除微信绑定
    @post(_path='/api/v1/user/unbind_wx',  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def unbind_wx(self):
        # 获取参数
        token = self.request.headers.get("user_token",None)
        platform = self.get_argument("from","web")
        # 从token中获取user_id
        token_info = self.redis.get_token_info(token)
        uuid = token_info['uuid']

        # 查找拥有此user_id的用户
        user_db = UserDao(session=self.session)
        user = user_db.get_user_by_uuid(uuid)
        result = {}
        if not user:
            result.update({
                "result":False,
                "msg":err_msgs['USER_NOT_FOUND']
            })
            self.set_status(400)

        # 用户没有绑定
        elif not user.openid:
            result.update({
                "result":False,
                "msg":err_msgs['USER_NOT_BOUND']
            })
            self.set_status(400)

        else:
            # 解绑定
            user_db.unbind_user_with_openid(user.user_id,token_info['role_group'])
            # 更新token
            # kwargs = {
            #     "openid": None,
            # }
            info = json.dumps(self.gen_token_info(user.user_id, user.role, platform))
            self.redis.set_token(token, info)
            # 日志
            self.log_user_action(user.user_id,"unbind_wx","-")

            result.update({
                "result":True,
                "msg":"OK",
            })
        return result

    # 生成微信认证url接口
    @post(_path='/api/v1/user/auth_url_wx',  _produces=mediatypes.APPLICATION_JSON)
    def auth_url_wx(self):

        redirect_uri = self.get_argument("redirect_uri",None)
        role = self.get_argument("role",None)

        if not redirect_uri or not role:
            result = {
                "result":False,
                "msg":err_msgs['PARAMS_MISSING'],
            }
            self.set_status(400)
        else:
            # 生成state参数
            state = random_string_generator(8)
            # 将state存入redis
            self.redis.set_state(state,redirect_uri,role)
            # TODO scope获取可能还需要前端传入
            auth_url = get_authorize_url(redirect_uri=setting.REDIRECT_URI_SERVER,scope=[setting.SCOPE_FOR_LOGIN],state=state)
            result = {
                "result":True,
                "msg":"OK",
                "auth_url":auth_url,
            }
        return result

    # 根据state参数返回redirect_uri
    @get(_path='/api/v1/user/redirect_uri',  _produces=mediatypes.APPLICATION_JSON)
    def redirect_uri(self):
        state = self.get_argument("state",None)
        result = {}
        if not state:
            result.update({
                "result":False,
                "msg":err_msgs['PARAMS_MISSING'],
            })
            self.set_status(400)
        else:
            state_info = self.redis.get_state_info(state)
            if not state_info:
                result.update({
                    "result":False,
                    "msg":err_msgs['STATE_TIME_OUT'],
                    "redirect_uri":setting.HOST_NAME+'/login',
                })
                self.set_status(400)
            else:
                result.update({
                    "result":True,
                    "msg":"OK",
                    "redirect_uri":state_info.get("redirect_uri"),
                })

        return result

    # 更新token中的更新时间
    @put(_path='/api/v1/user/cur_time_updating',  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def update_cur_time_in_token(self):
        token = self.request.headers.get('user_token',None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        if token_info and token_info.get('update_at'):
            token_info.update(update_at=pre_cur_datetime())
            redis.set_token(token,json.dumps(token_info))
        # 日志
        self.log_user_action(token_info.get("uuid"),"update_cur_time_in_token","-")

        result = {
            'result': True,
        }

        return result

    # 微信分享API
    @get(_path='/api/v1/user/signature',  _produces=mediatypes.APPLICATION_JSON)
    def get_signature(self):
        noncestr = self.get_argument("noncestr",None)
        timestamp = self.get_argument("timestamp",None)
        url = self.get_argument("url",None)
        result = {}
        if not noncestr or not timestamp or not url:
            result.update({
                "result":False,
                "msg": err_msgs['PARAMS_MISSING']
            })
            self.set_status(400)
        else:
            redis = RedisBase()
            ticket = redis.get_value(setting.TICKET_STR)
            if not ticket:
                access_token = exchange_for_access_token_for_js_sdk()
                # auth_info获取失败
                if access_token.get('errcode', 0):
                    result.update({
                        "result":False,
                        "msg":err_msgs[str(access_token.get('errcode'))]
                    })
                    self.set_status(502)
                else:
                    ticket = exchange_for_ticket(access_token.get("access_token"))
                    if ticket.get('errcode', 0):
                        result.update({
                            "result":False,
                            "msg":err_msgs[str(ticket.get('errcode'))]
                        })
                        self.set_status(502)
                    else:
                        # 将该ticket存入redis
                        redis.set_ticket(setting.TICKET_STR,json.dumps(ticket),setting.TICKET_EXPIRE_TIME)
                        params = {
                            "noncestr": noncestr,
                            "jsapi_ticket": ticket.get("ticket"),
                            "timestamp": timestamp,
                            "url": url
                        }
                        signature = sha1_signature(con_str_from_dic(False,**params))
                        result.update({
                            "result": True,
                            "signature": signature
                        })
            else:
                params = {
                    "noncestr": noncestr,
                    "jsapi_ticket": json.loads(ticket).get("ticket"),
                    "timestamp": timestamp,
                    "url": url
                }
                signature = sha1_signature(con_str_from_dic(False,**params))
                result.update({
                    "result": True,
                    "signature": signature
                })

        return result