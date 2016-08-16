#coding:utf-8

__author__ = 'commissar'

import os
import pyrestful.rest
import hashlib
import requests
import random

import tornado.web
import xml.dom.minidom
import inspect
import json
import logging

from datetime import *
from app.db.dao.redis_base import RedisBase
from app.util.base_db import get_session
from app.util.datetime_util import *
from app.util.dao_base import DaoBase
from app.db.dao.users import UserDao
from app.db.dao import redis_base
from app.db.dao.user_last_status import UserLastStatusDao
from app.db.dao.company import CompanyDao
from app.db.dao.role_rules import RoleRulesDao
from app.db.dao.user_conf import UserConfDao
from app.db.dao.settings import SettingsDao
from app.db.model import Users,UserConf
from app.setting import *
from app import setting
from conf.err_msgs import *

from pyrestful import mediatypes
from pyconvert.pyconv import convertXML2OBJ, convert2XML, convertJSON2OBJ, convert2JSON

class BaseHandler(pyrestful.rest.RestHandler):
    def __init__(self, application, request, **kwargs):
        super(BaseHandler, self).__init__(application, request, **kwargs)
        self.request_args = {}

        self.logger = getLogging()
        self.user_action_logger = getLoggingForUserAction()
        self.redis = redis_base.RedisBase()

    # 覆盖PyRestfulAPI中的方法 定制异常traceback日志
    def _exe(self, method):
        """ Executes the python function for the Rest Service """
        request_path = self.request.path
        path = request_path.split('/')
        services_and_params = list(filter(lambda x: x!='',path))
        content_type = None
        if 'Content-Type' in self.request.headers.keys():
            content_type = self.request.headers['Content-Type']

        # Get all funcion names configured in the class RestHandler
        functions    = list(filter(lambda op: hasattr(getattr(self,op),'_service_name') == True and inspect.ismethod(getattr(self,op)) == True, dir(self)))
        # Get all http methods configured in the class RestHandler
        http_methods = list(map(lambda op: getattr(getattr(self,op),'_method'), functions))

        if method not in http_methods:
            raise tornado.web.HTTPError(405,'The service not have %s verb'%method)
        for operation in list(map(lambda op: getattr(self,op), functions)):
            service_name          = getattr(operation,"_service_name")
            service_params        = getattr(operation,"_service_params")
            # If the _types is not specified, assumes str types for the params
            params_types          = getattr(operation,"_types") or [str]*len(service_params)
            params_types          = params_types + [str]*(len(service_params)-len(params_types))
            produces              = getattr(operation,"_produces")
            consumes              = getattr(operation,"_consumes")
            services_from_request = list(filter(lambda x: x in path,service_name))
            query_params          = getattr(operation,"_query_params")

            if operation._method == self.request.method and service_name == services_from_request and len(service_params) + len(service_name) == len(services_and_params):
                try:
                    params_values = self._find_params_value_of_url(service_name,request_path) + self._find_params_value_of_arguments(operation)
                    p_values      = self._convert_params_values(params_values, params_types)
                    if consumes == None and produces == None:
                        consumes = content_type
                        produces = content_type
                    if consumes == mediatypes.APPLICATION_XML:
                        param_obj = convertXML2OBJ(params_types[0],xml.dom.minidom.parseString(self.request.body).documentElement)
                        p_values.append(param_obj)
                    elif consumes == mediatypes.APPLICATION_JSON:
                        body = self.request.body
                        if sys.version_info > (3,):
                            body = str(self.request.body,'utf-8')
                        param_obj = convertJSON2OBJ(params_types[0],json.loads(body))
                        p_values.append(param_obj)
                    response = operation(*p_values)

                    if response == None:
                        return

                    self.set_header("Content-Type",produces)

                    if produces == mediatypes.APPLICATION_JSON and hasattr(response,'__module__'):
                        response = convert2JSON(response)
                    elif produces == mediatypes.APPLICATION_XML and hasattr(response,'__module__'):
                        response = convert2XML(response)

                    if produces == mediatypes.APPLICATION_JSON and isinstance(response,dict):
                        self.write(response)
                        self.finish()
                    elif produces == mediatypes.APPLICATION_JSON and isinstance(response,list):
                        self.write(json.dumps(response))
                        self.finish()
                    elif produces in [mediatypes.APPLICATION_XML,mediatypes.TEXT_XML] and isinstance(response,xml.dom.minidom.Document):
                        self.write(response.toxml())
                        self.finish()
                    else:
                        self.gen_http_error(500,"Internal Server Error : response is not %s document"%produces)
                except Exception as detail:
                    self.gen_http_error(500,"Internal Server Error : %s"%detail)
                    # 修改的地方 调用RequestHandler的处理请求异常的方法
                    self._handle_request_exception(detail)

    def get_token(self):
        '''
        获取当前用户的token对象. token对象的结构见pkg_token函数。
        :return:
        '''
        token = self.request.headers.get("user_token",None)

        token_info = None

        if(token is not None):
            redis = RedisBase()
            token_info = redis.get_token_info(token)
        return token_info

    def get_current_user(self):
        """Override to determine the current user from, e.g., a cookie.

        This method may not be a coroutine.
        """
        return None       #TODO:这是便于调试。正确情况下应该返回None

    def initialize(self):
        self.session = get_session()

    def on_finish(self):
        self.session.close()

    def verify_args(self,captcha=None,telephone=None,v_id=None,v_code=None,role=None,platform=None,app_version=None,m_platform=None, syn_uuid=None):
        '''
        判断短信验证码和图形验证码是否正确
        :param captcha: 用户填写的手机验证码
        :param telephone: 手机号
        :param v_id: 图形验证码id
        :param v_code: 用户填写的图形验证码
        :param app_version
        :param m_platform
        :param syn_uuid
        :return:
        '''
        authcode = self.redis.get_value(self.redis_captcha(telephone))
        verify_code = self.redis.get_value(self.redis_verify(v_id))
        user = UserDao(session=self.session)
        user_id = user.get_user_id_by_tel_and_role(telephone,role)
        result = {}
        if not authcode: # 判断短信验证码是否失效
            result.update({
                'result': False,
                'msg': err_msgs['SMS_TIMEOUT'],
            })
            self.set_status(417)
        elif authcode and authcode != captcha: # 判断短信验证码是否一致
            if self.redis.error_num_over(telephone):
                pass  #连续输入错误5次锁死该用户
            result.update({
                'result': False,
                'msg': err_msgs['SMS_ERR'],
            })
            self.set_status(400)
        elif v_id and not verify_code:# 判断图形验证码是否失效
            result.update({
                'result': False,
                'msg': err_msgs['VERIFY_TIMEOUT'],
            })
            self.set_status(417)
        elif verify_code and verify_code.lower() != v_code.lower():# 判断图形验证码是否一致
            result.update({
                'result': False,
                'msg': err_msgs['VERIFY_ERR'],
            })
            self.set_status(400)
        elif not user_id: # 判断用户
            result.update({
                'result': False,
                'msg': err_msgs['TEL_OR_ROLE_NOT_EXIST']
            })
            self.set_status(404)
        elif platform == setting.PLATFORM_MOBILE and (not app_version or not m_platform or not syn_uuid):
                result.update({
                    'result': False,
                    'msg': err_msgs['PARAMS_MISSING']
                })
                self.set_status(400)
        else:
            result.update({
                'user_id':user_id,
                'result': True,
            })

            # 删除redis中的短信验证码信息
            self.redis.del_key(self.redis_captcha(telephone))
            # 删除redis中的图形验证码信息
            self.redis.del_key(self.redis_verify(v_id))
            # 删除用户验证码输入错误相关的信息
            self.redis.del_key(self.redis_err_num(telephone))

        return result

    @staticmethod
    def build_token(tel):
        '''
        通过用户电话和当前时间md5生成token
        :param tel: 电话
        :return: [str] token
        '''
        cur_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        md5 = hashlib.md5()
        md5.update(tel+cur_date)
        return md5.hexdigest()

    @staticmethod
    def build_es_index(syn_uuid, com_uuid):
        return 'co_'+syn_uuid+'_'+com_uuid

    def build_company_uuid(self, uuid):
        numbers = ''.join(map(str, range(0, 10)))
        com_db = CompanyDao(session=self.session)
        length = random.randint(1,3)
        while True:
            r = ''.join(random.sample(numbers, length))
            if 9 <= len(uuid) <= 12:
                company_uuid = uuid[:12-length] + r
            else:
                company_uuid = uuid + r
            if not com_db.com_exists(company_uuid):
                return company_uuid

    def set_default_headers(self):
        # self.set_header('Access-Control-Allow-Origin', 'http://advices.puzhizhuhai.com')
        self.set_header('Access-Control-Allow-Origin', '*')

        self.set_header('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS')
        self.set_header('Access-Control-Allow-Headers', 'user_token')
    #        self.set_header('Access-Control-Max-Age', 1000)
    #        self.set_header('Access-Control-Allow-Headers', 'user_token')
    #        self.set_header('Content-type', 'application/json')

    def options(self):
        self.set_header('Access-Control-Max-Age', 1000)
        self.set_status(200)

    def error_result(self,msg_code, status_code=400):
        '''
        返回一个dict结构，其内容有两个状态一个是消息。
        :param msg_code:        错误的消息代码。其对应的描述从err_msgs.py中获取。
        :param status_code:     错误的HTTP状态码。
        :return:
        '''
        result = {
            'result': False,
            'msg': err_msgs.get(msg_code,u'未知错误！(%s)'%msg_code)
        }
        self.set_status(status_code)
        return result

    @staticmethod
    def redis_token(token):
        if token:
            return TOKEN_STR + token
        else:
            return None

    @staticmethod
    def redis_verify(v_id):
        if v_id:
            return  VERIFY_STR + v_id
        else:
            return None

    @staticmethod
    def redis_captcha(tel):
        if tel:
            return CAPTCHA_STR + tel
        else:
            return None

    @staticmethod
    def redis_err_num(tel):
        if tel:
            return ERROR_NUM_STR + tel
        else:
            return None

    # 根据传入的参数生成token_info
    def pkg_token_v2(self,user_info, role_group, roles, rules, com_and_synd_info=None, **kwargs):
        '''
        打包token_info
        :param user_info: 用户基本信息
        :param role_group: 用户角色组
        :param roles: 用户在公司下的特定角色列表
        :param rules: 用户的权限列表
        :param com_and_synd_info: 用户所属公司的信息
        :return:
        '''
        token_info = {
                "uuid": user_info['uuid'],
                "openid": user_info['openid'],
                "name": user_info['user_name'],
                "py_full": user_info['py_full'],
                "role_group": role_group,
                "role": roles,
                "rule": rules,
                "update_at":kwargs['update_at'] if kwargs and kwargs.get('update_at') else pre_cur_datetime(),
            }
        if com_and_synd_info:
            if com_and_synd_info.get('parent'):
                token_info.update({
                    "company_uuid": com_and_synd_info['uuid'],
                    "company": {
                        'name': com_and_synd_info['name'],
                        'es_host': ES_HOST,
                        'es_index': com_and_synd_info['index']
                    },
                    "syndicate_uuid": com_and_synd_info['parent']['uuid'],
                    "syndicate": com_and_synd_info['parent']['name'],
                })
            else:
                token_info.update({
                    "syndicate_uuid": com_and_synd_info['uuid'],
                    "syndicate": com_and_synd_info['name'],
                })

        status = {
            'code': CODE_OK,
            'msg': token_status[CODE_OK]['msg']
        }
        token_info.update(status=status)
        # 若有参数需要更新则更新
        # for k,v in kwargs.items():
        #     if token_info.has_key(k):
        #         token_info.update(k=v)
        return token_info

    # 操作数据库获取生成token需要的信息
    def gen_token_info(self, user_id=None, role_group=None, platform='web', old_token_info=None, **kwargs):
        '''
        查询与生成token_info相关的信息，并调用组装函数组装token
        :param user_id: 用户ID
        :param role_group:  用户角色组
        :param platform:    登录平台
        :param old_token_info: 旧的token
        :param kwargs: 需要更新的内容,不管是重新生成还是更新旧的token，格式需要注意：指定的key可以是openid,name,update_at,role,role_group,rule,company,syndicate_uuid,syndicate.
        :return:
        '''
        #TODO: 此方法要修改成逻辑更清晰的，且需要的数据都是通过参数传入，而不依赖数据库。依赖之前的token，如果之前的为NONE,则使用当前传入数据重新构建一个。

        token_info = {}
        # 移动端存入app的版本信息和登录平台信息
        if platform == setting.PLATFORM_MOBILE:
            token_info.update(expire_time=setting.TOKEN_EXPIRE_TIME_FOR_MOBILE,app_version_info=kwargs.get("app_version_info"),platform=platform)
        else:
            token_info.update(expire_time=setting.TOKEN_EXPIRE_TIME,platform=platform)

        # 根据之前的token更新键值对，不需要重新生成新token
        if old_token_info:
            for k,v in kwargs.items():
                if old_token_info.has_key(k):
                    old_token_info.update({k:v})
            token_info.update(old_token_info)
        else:
            user_db = UserDao(session=self.session)
            usr_status_db = UserLastStatusDao(session=self.session)
            com_db = CompanyDao(session=self.session)
            user_conf_db = UserConfDao(session=self.session)
            role_rule_db = RoleRulesDao(session=self.session)
            # 获取用户相关信息
            user_info = user_db.user(user_id)

            # 获取用户user_conf表中对应的role_type
            role_type = self.get_user_conf_type(role_group)

            if role_group == Users.ROLE_ADMIN:
                # TODO 获取admin角色rules的函数可能需要修改成通过role_group参数获取，当前是role参数，也可以通过新建一个函数获取
                roles = user_conf_db.get_spec_roles(user_id,UserConf.ACC_COM_ID,role_type)
                com_and_synd_info = None
            else:
                # 根据最后状态表得到用户的company_id
                status = usr_status_db.get_specific_status(user_id, role_group, platform)
                com_and_synd_info = {}

                # 查询公司的相关信息（包括公司和集团）
                if status and status.company_uuid and com_db.com_exists(status.company_uuid):  # 最后状态表没有数据或者上次操作的公司不存在需要重新选择公司
                    com_and_synd_info.update(com_db.get_company_by_uuid(status.company_uuid))
                else:
                    syndicate_uuid = user_conf_db.get_companys_by_userid_and_type(user_id,role_type)[0]
                    com_and_synd_info.update(com_db.get_company_by_uuid(syndicate_uuid,False))

                # 获取roles
                if com_and_synd_info.get('parent') and role_group == Users.ROLE_SUP_MGR:
                    roles = user_conf_db.get_spec_roles(user_id,com_and_synd_info['parent']['uuid'],role_type)
                else:
                    roles = user_conf_db.get_spec_roles(user_id,com_and_synd_info['uuid'],role_type)

            # 获取rules
            rules = []
            for role in roles:
                rules.extend(role_rule_db.get_role_rules(role))
            token_info.update(self.pkg_token_v2(user_info, role_group, roles=roles, rules=rules,com_and_synd_info=com_and_synd_info,**kwargs))

        return token_info

    # 更新token:用来更新token中的字段，不需要重新生成，目前在绑定微信，解绑微信，编辑用户公司时用到
    # TODO 实现这个函数的逻辑
    def update_token(self):
        pass

    def pkg_token(self, user_id, role_group, platform):
        '''
        :param user_id:
        :param role_group:
        :param platform:
        :return:
        '''

        #TODO: 此方法要修改成逻辑更清晰的，且需要的数据都是通过参数传入，而不依赖数据库。依赖之前的token，如果之前的为NONE,则使用当前传入数据重新构建一个。

        # 获取用户相关信息
        user_db = UserDao(session=self.session)
        user_info = user_db.user(user_id)

        if (platform == 'mobile'):
            expire_time = setting.TOKEN_EXPIRE_TIME_FOR_MOBILE
        else:
            expire_time = setting.TOKEN_EXPIRE_TIME

        if role_group == Users.ROLE_ADMIN:
            token = {
                "uuid": user_id,
                "openid":user_info['openid'],
                "name": user_info['user_name'],
                "expire_time": expire_time,
                "role_group": role_group,
                "rule": ['rule_sys_manager_syndicate','rule_sys_manager_super'],
                "status": {
                    'code': CODE_OK,
                    'msg': token_status[CODE_OK]['msg']
                }
            }
            return token

        # 获取用户user_conf表中对应的role_type
        role_type = self.get_user_conf_type(role_group)

        # 根据最后状态表得到用户的company_id
        usr_status_db = UserLastStatusDao(session=self.session)
        status = usr_status_db.get_specific_status(user_id, role_group, platform)
        com_db = CompanyDao(session=self.session)
        if status and status.company_uuid and com_db.com_exists(status.company_uuid):  # 最后状态表没有数据或者上次操作的公司不存在需要重新选择公司
            company_uuid = status.company_uuid

            # 查询公司的相关信息
            com_db = CompanyDao(session=self.session)
            com_info = com_db.get_company_by_uuid(company_uuid)

            # 查询该角色在该公司下的角色和权限
            user_conf = UserConfDao(session=self.session)
            if role_group == Users.ROLE_SUP_MGR:
                roles = user_conf.get_spec_roles(user_id,com_info['parent']['uuid'],role_type)
            else:
                roles = user_conf.get_spec_roles(user_id,company_uuid,role_type)

            role_rule_db = RoleRulesDao(session=self.session)
            rules = []
            for role in roles:
                rules.extend(role_rule_db.get_role_rules(role))
            token = {
                "name": user_info['user_name'],
                "uuid": user_id,
                "openid":user_info['openid'],
                "role": roles,
                "role_group": role_group,
                "expire_time": expire_time,
                "rule": rules,
                "company_uuid": company_uuid,
                "company": {
                    'name': com_info['name'],
                    'es_host': ES_HOST,
                    'es_index': com_info['index']
                },
                "syndicate_uuid": com_info['parent']['uuid'],
                "syndicate": com_info['parent']['name']
            }
        else:
            user_conf_db = UserConfDao(session=self.session)
            syndicate_uuid = user_conf_db.get_companys_by_userid_and_type(user_id,role_type)[0]
            syndicate_info = com_db.get_company_by_uuid(syndicate_uuid,False)
            roles = user_conf_db.get_spec_roles(user_id,syndicate_uuid,role_type)

            role_rule_db = RoleRulesDao(session=self.session)
            rules = []
            for role in roles:
                rules.extend(role_rule_db.get_role_rules(role))

            token = {
                "name": user_info['user_name'],
                "uuid": user_id,
                "openid":user_info['openid'],
                "role": roles,
                "role_group": role_group,
                "expire_time": expire_time,
                "rule": rules,#['rule_setting_personal','rule_ac_manager_company'],
                "syndicate_uuid": syndicate_uuid,
                "syndicate": syndicate_info['name']
            }

        token['status'] = {
            'code': CODE_OK,
            'msg': token_status[CODE_OK]['msg']
        }
        return token

    @staticmethod
    def get_user_conf_type(role_group):
        '''
        users表和user_conf表用户类型的一一对应
        :param role_group:
        :return:
        '''
        return UserConf.MAPPING[role_group]

    @staticmethod
    def post_company_grout(company_uuid,es_index):
        '''
        新增公司时在grout中设置公司的配置信息
        :param company_uuid:
        :param es_index:
        :return:
        '''
        val = {
            "es_host": ES_HOST,
            "es_index": es_index,
            "lexis": "default",
            "tags_config":'''{
              "emotion":{
                 "nlp_thd_positive":0.6,
                 "nlp_thd_negative":0.6
              },
              "warn": {"key_thd": 3},
              "category": {"key_thd": 2}
           }'''
        }
        res = requests.post(GROUT_COMPANY_HOST % company_uuid,data=val)
        if res.status_code != 200:
            return False
        txt = res.json()
        if txt['result'] == "true":
            return True
        return False

    @staticmethod
    def delete_company_grout(company_uuid):
        '''
        删除公司
        :param company_uuid:
        :return:
        '''
        res= requests.delete(GROUT_COMPANY_HOST % company_uuid)
        if res.status_code != 200:
            return False
        txt = res.json()
        if txt['result'] == "true":
            return True
        return False

    @staticmethod
    def set_com_media(company_uuid):
        '''
        设置某个公司关注的媒体类型
        :return:
        '''
        val = {
            "data":'''[
            {"print":["_ALL_"]},
            {"network":["_ALL_"]},
            {"tv":["_ALL_"]},
            {"new":["_ALL_"]},
            {"bbs":["_ALL_"]},
            {"blog":["_ALL_"]},
            {"wiki":["_ALL_"]},
            {"video":["_ALL_"]},
            {"weibo":["_ALL_"]},
            {"weixin":["_ALL_"]}
            ]'''
        }
        res= requests.post(GROUT_COM_MEDIA_CATE_HOST % company_uuid,data=val)
        if res.status_code != 200:
            return False
        txt = res.json()
        if txt['result'] == "true":
            return True
        return False

    @staticmethod
    def get_avatar(user_id):
        dir_path = os.path.abspath(os.path.join( os.path.dirname(__file__),os.path.pardir,os.path.pardir,os.path.pardir, 'dist/avatar'))
        file_name = dir_path + '/%s.jpg' % user_id

        if not os.path.exists(file_name):
            avatar = '/avatar/touxiang.jpg'
        else:
            avatar = '/avatar/%s.jpg' % user_id
        return avatar

    def log_user_action(self,user_id,msg,what):
        '''
        记录用户的操作
        :param msg: 操作内容
        :param user_id: 用户ID
        :return:
        '''
        self.user_action_logger.info("["+user_id+"]["+msg+"]["+what+"]")