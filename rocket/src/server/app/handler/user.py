#coding:utf-8

__author__ = 'commissar'

import json
import traceback
from pyrestful import mediatypes
from pyrestful.rest import get, post, put, delete

from app.setting import *
from app.util.base_handler import BaseHandler
from app.util.datetime_util import *
from app.db.model import Users,Rules,UserConf
from app.db.dao.users import UserDao
from app.db.dao.user_conf import UserConfDao
from app.db.dao.role_rules import RoleRulesDao
from app.db.dao.company import CompanyDao
from app.db.dao.settings import SettingsDao
from app.db.dao.redis_base import RedisBase
from app.db.dao.user_last_status import UserLastStatusDao
from app.db.dao.rules import RuleDao
from app.util.base_rbac import rule_require,token_require
from conf.err_msgs import *


class UserHandler(BaseHandler):

    @get(_path='/api/v1/user',  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def get_user(self):
        token = self.request.headers.get("user_token",None)

        rule_db = RuleDao(session=self.session)
        setting_db = SettingsDao(session=self.session)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        company_uuid = token_info.get('company_uuid',None)
        app_version_info = token_info.get("app_version_info")
        update_at = str_to_datetime(token_info['update_at']).strftime('%Y-%m-%d %H:%M:%S')
        avatar = self.get_avatar(token_info['uuid'])
        # 日志
        self.log_user_action(token_info.get("uuid"),"get_user",token_info.get("uuid"))

        if app_version_info:
            # app_version_info = json.loads(app_version_info)
            is_newest = setting_db.is_newest_version(app_version_info.get('app_version'),app_version_info.get('m_platform'))
            if not is_newest:
                self.set_status(CODE_APP_NEW_VERSION_AVAILABLE,token_status[CODE_APP_NEW_VERSION_AVAILABLE]['msg'])
        if company_uuid:
            com_db = CompanyDao(session=self.session)
            syndicate = com_db.get_company_by_uuid(token_info['syndicate_uuid'])

            #根据公司再对显示权限进行过滤。这里一定不能修改token的内容。
            company_rules = rule_db.get_rules_by_level(Rules.LV_COMPANY, token_info['rule'])
            result = {
                'uuid': token_info['uuid'],
                'name': token_info['name'],
                'py_full': token_info['py_full'],
                'role_group': token_info['role_group'],
                'role': token_info['role'],
                'rule': company_rules,
                'avatar': avatar,
                'company': token_info['company']['name'],
                'company_uuid':company_uuid,
                'syndicate':{
                    'name': syndicate['name'],
                    'media_solution': syndicate['media_solution']
                },
                "openid": token_info['openid'],
                'update_at': update_at,
            }
            return result
        else:#如果没有选择公司，则返回给另外一些显示权限。
            syndicate_rules = rule_db.get_rules_by_level(Rules.LV_SYNDICATE, token_info['rule'])
            token_info['rule'] = list(syndicate_rules)
            #token_info['rule'] = syndicate_rules,
            token_info['avatar'] = avatar
            token_info['update_at'] = update_at
            return token_info

    @get(_path='/api/v1/{role_name}/count', _type=[str],  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def get_managers_count(self,role_name):
        self.logger.info("role_name:"+role_name)

        usr_db = UserDao(session=self.session)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_managers_count",role_name)

        result = {
            'count': usr_db.get_role_count(role_name)
        }

        return result

    @get(_path='/api/v1/super', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_super')
    def get_supmgrs_infos(self):
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument("sort", "telephone")
        self.logger.info("sort:"+sort)

        results = []

        usr_rules_db = UserConfDao(session=self.session)
        supmgr_list = usr_rules_db.get_sprmgrs()
        for supmgr in supmgr_list:
            if supmgr['user_name'].find(search) == -1 and supmgr['telephone'].find(search) == -1:
                continue
            results.append(supmgr)
        results.sort(key=lambda manager: manager[sort])
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_supmgrs_info","-")

        result = {
            "result": True,
            "count": len(results),
            "sup_mgrs": results[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(results) else results[int(beg):]
        }
        return result

    @get(_path='/api/v1/admins', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_adminer')
    def get_admins_infos(self):
        beg = self.get_argument("beg", 0)
        count = self.get_argument("count", 30)
        search = self.get_argument("search", "")
        sort = self.get_argument("sort", "telephone")
        self.logger.info("sort:" + sort)

        usr_rules_db = UserConfDao(session=self.session)
        admin_list = usr_rules_db.get_admins()
        results = []
        for admin in admin_list:
            if admin['user_name'].find(search) == -1 and admin['telephone'].find(search) == -1:
                continue
            results.append(admin)
        results.sort(key=lambda admin: admin[sort])
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_admins_info","-")

        result = {
            "result": True,
            "count": len(results),
            "admins": results[int(beg):int(beg) + int(count)] if (int(beg) + int(count)) <= len(results) else results[int(beg):]
        }
        return result

    @get(_path='/api/v2/manager/{user_id}',_type=[str], _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def get_manager(self, user_id):
        '''
        获取运营员员的详细信息。包括其管理了几个公司，在每个公司的角色。
        :return:
        '''
        result = {'result': False,}

        token_info = self.get_token()
        # 日志
        self.log_user_action(token_info.get("uuid"),"get_manager",user_id)

        if(token_info is not None):
            syndicate_uuid = token_info.get("syndicate_uuid")

            #获取当前集团的所有公司
            com_db = CompanyDao(session=self.session)
            company_list = com_db.get_companys(syndicate_uuid)
            cmpy_dict = { com_item['uuid']: com_item['name'] for com_item in company_list}

            company_ids = cmpy_dict.keys()

            #获取此运营员所管理的公司及在每个公司的角色。
            user_conf_db = UserConfDao(session=self.session)

            cmpy_role_dict = user_conf_db.get_manager_companies(user_id,company_ids)    #{company_id2:[role_1,role_2],company_id2:[role_2]}

            #获取这些运营员的信息。
            user_db = UserDao(session=self.session)
            result = user_db.user(user_id,Users.ROLE_MANAGER)

            result['user_id'] =str(user_id)
            result["roles"] = cmpy_role_dict
            result["result"] = True

            del result['role']

        else:
            result = {
                    'result': False,
                    'msg': err_msgs['No_AUTHENTICATION']
                }
            self.set_status(400)
        return result


    @get(_path='/api/v2/managers', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def get_managers_in_syndicate(self):
        '''
        此方法获取到当前集团所有运营员的信息。仅包括其管理哪几个公司。并不包括其在公司里所处的角色。
        :return:
        '''
        search = self.get_argument("search",None)
        sort = self.get_argument("sort", "telephone")
        self.logger.info("sort:"+sort)

        result = {'result': False,}

        token_info = self.get_token()
        if(token_info is not None):
            syndicate_uuid = token_info.get("syndicate_uuid")

            #获取当前集团的所有公司
            com_db = CompanyDao(session=self.session)
            company_list = com_db.get_companys(syndicate_uuid)
            cmpy_dict = { com_item['uuid']: com_item['name'] for com_item in company_list}

            company_ids = cmpy_dict.keys()

            #获取这些公司的所有运营员。
            user_conf_db = UserConfDao(session=self.session)
            user_cmpy_map = user_conf_db.get_managers_by_company_uuids(company_ids) #dict(user_id:set(company_uuid))

            #获取这些运营员的信息。
            user_db = UserDao(session=self.session)
            users = user_db.get_users_by_uuids(user_cmpy_map.keys(),Users.ROLE_MANAGER,sort,search)

            data = []
            usr_idx = 0
            for user in users:
                usr_cmys = []
                for cmpy_id in user_cmpy_map[user.user_id]:
                    cmpy_name = cmpy_dict.get(cmpy_id)

                    t_cmpy_dict = {
                        "company_name":cmpy_name,
                        "company_id":cmpy_id
                    }

                    usr_cmys.append(t_cmpy_dict)

                usr_cmys.sort(key=lambda cmpy: cmpy['company_name'])

                usr_item = {
                    "user_id": user.user_id,
                    "user_name":user.user_name,
                    "telephone":user.telephone,
                    'companys':usr_cmys
                }

                self.logger.debug("[%d]%s"%(usr_idx,json.dumps(usr_item)))
                usr_idx += 1

                data.append(usr_item)


            # 日志
            self.log_user_action(token_info.get("uuid"),"get_managers_in_syndicate",syndicate_uuid)

            result = {
                'result': True,
                'managers': data
            }
        else:
            result = {
                    'result': False,
                    'msg': err_msgs['No_AUTHENTICATION']
                }
            self.set_status(400)
        return result





    @get(_path='/api/v1/managers', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def get_managers_infos(self):
        '''
        获取当前公司所有运营员信息。
        :return:
        '''
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument("sort", "telephone")
        self.logger.info("sort:"+sort)

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()

        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        results = []

        usr_rules_db = UserConfDao(session=self.session)
        mgr_list = usr_rules_db.get_managers_by_company_uuid(company_uuid)
        usr_db = UserDao(session=self.session)
        for mgr in mgr_list:
            usr_info = usr_db.user(mgr['user_id'])
            if usr_info['user_name'].find(search) == -1 and usr_info['telephone'].find(search) == -1:
                continue
            mgr['user_name'] = usr_info['user_name']
            mgr['telephone'] = usr_info['telephone']
            results.append(mgr)
        results.sort(key=lambda manager: manager['telephone'])
        # 日志
        self.log_user_action(token_info.get("uuid"),"get_managers_infos","-")

        result = {
            "result": True,
            "count": len(results),
            "managers": results[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(results) else results[int(beg):]
        }
        return result

    @get(_path='/api/v1/viewers', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_viewer')
    def get_viewers_infos(self):
        # 从query string获取参数
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument("sort","")
        # 组织日志
        self.logger.info("sort:"+sort)

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        results = []

        usr_rules_db = UserConfDao(session=self.session)
        view_list = usr_rules_db.get_viewers_by_company_uuid(company_uuid)

        usr_db = UserDao(session= self.session)
        for viewer in view_list:
            usr_info = usr_db.user(viewer['user_id'])
            if usr_info['user_name'].find(search) == -1 and usr_info['telephone'].find(search) == -1:
                continue
            viewer['user_name'] = usr_info['user_name']
            viewer['telephone'] = usr_info['telephone']
            results.append(viewer)
        results.sort(key=lambda viewer: viewer['telephone'])
        # 日志
        self.log_user_action(token_info.get("uuid"),"get_viewers_infos","-")

        result = {
            "result": True,
            "count": len(results),
            "viewers": results[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(results) else results[int(beg):]
        }
        return result

    # 获取当天新增的用户信息列表
    @get(_path='/api/v1/new_add_users', _produces=mediatypes.APPLICATION_JSON)
    # @rule_require('rule_ac_manager_viewer')
    def get_new_add_users(self):
        date = self.get_argument("date", "") #date 格式为yyyy-mm-dd
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument("sort", "telephone")
        self.logger.info("sort:"+sort)

        date_min = date+" 00:00:00"
        #print date_min

        date_max = date+" 23:59:59"
        #print date_max

        if date == '':
            self.set_status(400)
            return {"result": False, 'msg': err_msgs['PARAMS_MISSING']}

        results = []
        users_list = self.session.query(Users).filter(Users.create_at >= date_min , Users.create_at <= date_max).all()
        for user_info in users_list:
            if user_info.user_name.find(search) == -1 and user_info.telephone.find(search) == -1:
                continue
            user = {
                'user_id': user_info.user_id,
                'user_name': user_info.user_name,
                'telephone': user_info.telephone,
                'role_group_name': user_info.role,
                "role_group_title": Users.MAPPING[user_info.role],
                'created_at': str(user_info.create_at)
            }
            results.append(user)
        results.sort(key=lambda user: user[sort])
        # 日志
        # self.log_user_action(self.get_token().get("uuid"),"get_new_add_users",date)

        result = {
            "result": True,
            "count": len(results),
            "new_add_users": results[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(results) else results[int(beg):]
        }
        return result

    # 获取当前在线用户的信息列表
    @get(_path='/api/v1/online_users', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_list_login')
    def get_online_user_infos(self):
        # 从query string获取参数
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument("sort","user_name")

        results = []
        usr_db = UserDao(session=self.session)
        tokens = self.redis.get_all_tokens()
        users = usr_db.get_distinct_users()
        for token in tokens:
            token_info = json.loads(self.redis.get_value(token))
            if token_info and token_info['status']['code'] == CODE_OK:
                # 手机端特殊处理
                if token_info['platform'] == PLATFORM_MOBILE and advanced_pre_datetime('H',TIME_GAP,convert_to_str=True) > token_info['update_at']:
                    continue
                for user in users:
                    if user.user_id == token_info['uuid']:
                        telephone = user.telephone
                        break
                user_status_db = UserLastStatusDao(session=self.session)
                status = user_status_db.get_status_by_userid_and_role_group(token_info['uuid'],token_info['role_group'])
                for stat in status:
                    if stat.platform == token_info['platform']:
                        online_user_info = {
                            "user_id":token_info['uuid'],
                            "telephone":telephone if telephone else None,
                            "user_name":token_info['name'],
                            "role_group_name":token_info['role_group'],
                            "role_group_title":Users.MAPPING[token_info['role_group']],
                            "last_login_time":str(stat.update_at) if stat else None,
                            "last_login_platform":str(stat.platform) if stat else None,
                        }
                        results.append(online_user_info)
                        break
        results.sort(key=lambda online_user_info: online_user_info[sort])
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_online_user_infos","-")

        result = {
            "result": True,
            "count": len(results),
            "online_users": results[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(results) else results[int(beg):]
        }
        return result

    @post(_path='/api/v1/super', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_super')
    def add_supmanager(self):
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        syndicate = self.get_argument("syndicate","")

        self.logger.info("username:"+user_name+"  telephone:"+telephone+"  syndicate:"+syndicate)

        if user_name == '' or telephone == '' or syndicate== '':
            self.set_status(400)
            return {"result":False,'msg': err_msgs['PARAMS_MISSING']}

        usr_db = UserDao(session= self.session)

        # 一个超级运营员只允许管理一个集团
        if usr_db.exist_role_group_by_tel(telephone, Users.ROLE_SUP_MGR):
            result = {
                    'result': False,
                    'msg': err_msgs['ROLE_SUP_MGR_EXIST']
                }
            self.set_status(400)
            return result

        match, usr_id, user_name = usr_db.insert_user(user_name,telephone, Users.ROLE_SUP_MGR)
        if not match:
            result = {
                    'result': False,
                    'msg': err_msgs['TEL_NAME_NOT_MATCH'],
                    'name': user_name
                }
            self.set_status(400)
            return result

        usr_rle_db = UserConfDao(session=self.session)
        usr_rle_db.insert_role(usr_id,syndicate,UserConf.SUB_ROLE_SUP_MGR,UserConf.TYPE_ROLE_SUPMGR)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"add_supmgr",usr_id)

        result = {
            'result': True,
            'user_id': usr_id
        }
        return result

    @post(_path='/api/v1/admins', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_adminer')
    def add_admin(self):
        user_name = self.get_argument("user_name", "")
        telephone = self.get_argument("telephone", "")
        roles = self.get_arguments("role[]")


        if user_name == '' or telephone == '':
            self.set_status(400)
            return {"result": False, 'msg': err_msgs['PARAMS_MISSING']}

        usr_db = UserDao(session=self.session)
        # 一个手机号只能存在一个管理员角色
        if usr_db.exist_role_group_by_tel(telephone, Users.ROLE_ADMIN):
            result = {
                'result': False,
                'msg': err_msgs['ROLE_ADMIN_EXIST']
            }
            self.set_status(400)
            return result

        match, usr_id, user_name = usr_db.insert_user(user_name, telephone, Users.ROLE_ADMIN)
        if not match:
            result = {
                'result': False,
                'msg': err_msgs['TEL_NAME_NOT_MATCH'],
                'name': user_name
            }
            self.set_status(400)
            return result

        usr_rle_db = UserConfDao(session=self.session)
        for role in roles:
            usr_rle_db.insert_role(usr_id, UserConf.ACC_COM_ID,role, UserConf.TYPE_ROLE_ADMIN)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"add_admin",usr_id)

        result = {
            'result': True,
            'user_id': usr_id
        }
        return result


    @post(_path='/api/v2/managers', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def add_manager_v2(self):
        '''
        增加运营员,此方法的优点是可以一次为运营员增加到多个公司中。
        此方法由于要传递二级数据，所以js端需要将数据转成json后放到body中传到服务端。
        :return:
        '''
        data = json.loads(self.request.body)
        user_name = data.get("user_name",None)
        telephone = data.get("telephone",None)
        # 判空
        if user_name is None or telephone is None:
            result = {
                    'result': False,
                    'msg': err_msgs['PARAMS_MISSING']
                }
            self.set_status(400)
        else:
            roles = data.get("roles",None)
            token_info = self.get_token()

            result = {
                'result': True,
            }
            if(token_info is not None):
                syndicate_uuid = token_info.get("syndicate_uuid")

                result['result'] = self.__add_manager_v2(user_name,telephone, roles,syndicate_uuid)

                if not result['result']:
                    self.set_status(400)
            else:
                result = {
                        'result': False,
                        'msg': err_msgs['No_AUTHENTICATION']
                    }
                self.set_status(400)
        return result


    def __add_manager_v2(self,user_name,telephone,roles, syndicate_uuid):
        '''
        增加用户的内核操作。
        :param user_name:
        :param telephone:
        :param roles:   [dict]  结构为{"company_uuid":[role1,role2],}
        :return:
        '''

        try:
            user_db = UserDao(session=self.session)

            match, user_id, user_name_new = user_db.insert_user(user_name,telephone, Users.ROLE_MANAGER)     #增加用户。

            # 如果是更新则更新用户
            if not match and user_id:
                user_db.update_user(user_id, user_name, telephone)

            #获取当前集团的所有公司
            com_db = CompanyDao(session=self.session)
            company_list = com_db.get_companys(syndicate_uuid)
            cmpy_dict = { com_item['uuid']: com_item['name'] for com_item in company_list}

            company_ids = cmpy_dict.keys()
            #删除用户的原来角色配置。
            usr_rfg_db = UserConfDao(session=self.session)
            usr_rfg_db.delete_manager_by_user_and_companys(user_id,company_ids)

            if(roles is not None):
                #插入新的角色配置。
                usr_rfg_db.insert_manager_roles(user_id,roles)

            # 通知该用户，其已经发生变化。
            redis = RedisBase()
            redis.user_change(user_id,CODE_USER_MODIFIED,Users.ROLE_MANAGER)

        except Exception,e:
            self.logger.error(traceback.format_exc())
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"add_manager_v2",user_name)

        return True



    @post(_path='/api/v1/managers', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def add_manager(self):
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        roles = self.get_arguments("role[]")
        # data = json.loads(self.request.body)
        # user_name = data.get("user_name","")
        # telephone = data.get("telephone","")
        # roles = data.get("role",[])
        self.logger.info("username:"+user_name+"  telephone:"+telephone+"  role:"+','.join(roles))

        if user_name == '' or telephone == '' or roles == []:
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

        match = False
        try:

            token = self.request.headers.get("user_token",None)
            redis = RedisBase()

            token_info = redis.get_token_info(token)
            company_uuid = token_info.get('company_uuid',None)

            usr_db = UserDao(session=self.session)
            match, usr_id, user_name = usr_db.insert_user(user_name,telephone, Users.ROLE_MANAGER)     #增加用户。

        except Exception,e:
            self.logger.error(traceback.format_exc())

        usr_rle_db = UserConfDao(session=self.session)
        if usr_rle_db.manager_is_exist(usr_id, company_uuid):
            result = {
                'result': False,
                'msg': err_msgs['MSG_EXIST']
            }
            self.set_status(400)
            return result

        if not match:
            result = {
                    'result': False,
                    'msg': err_msgs['TEL_NAME_NOT_MATCH'],
                    'name': user_name
                }
            self.set_status(400)
            return result

        company_roles = []
        try:
            for role in roles:
                usr_rle_db.insert_role( user_id=usr_id, company_uuid=company_uuid,role=role, role_type=UserConf.TYPE_ROLE_MGR)

            company_roles = usr_rle_db.get_manager_companies(usr_id)
        except Exception,e:
            self.logger.error(traceback.format_exc())

        # 通知该用户，其已经发生变化。
        redis = RedisBase()
        redis.user_change(usr_id,CODE_USER_MODIFIED,Users.ROLE_MANAGER)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"add_manager",usr_id)

        result = {
            'result': True,
            'user_id': str(usr_id),
            'user_name': user_name,
            'telephone': telephone,
            'roles': company_roles
        }
        return result

    @post(_path='/api/v1/viewers',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_viewer')
    def add_viewer(self):
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        role = self.get_argument("role","")
        qq = self.get_argument("qq","")
        weixin = self.get_argument("weixin","")
        weibo = self.get_argument("weibo","")

        self.logger.info("username:"+user_name+"  telephone:"+telephone+"  roles:"+role+" qq:"+qq+" weixin:"+weixin+" weibo:"+weibo)
        if user_name == "" or telephone == "" or role == "":
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        usr_db = UserDao(session= self.session)
        match, usr_id, user_name = usr_db.insert_user(user_name,telephone, Users.ROLE_VIEWER)     #增加用户。

        usr_rle_db = UserConfDao(session=self.session)
        if usr_rle_db.viewer_is_exist(usr_id,company_uuid):  # 判断当前用户在该公司是否存在观察者角色
            result = {
                'result': False,
                'msg': err_msgs['VIEW_EXIST']
            }
            self.set_status(400)
            return result

        if not match:
            result = {
                'result': False,
                'msg': err_msgs['TEL_NAME_NOT_MATCH'],
                'name': user_name
            }
            self.set_status(400)
            return result

        usr_rle_db.insert_role(user_id=usr_id, company_uuid=company_uuid,role=role, role_type=UserConf.TYPE_ROLE_VIEWER)

        if qq != '':
            usr_rle_db.insert_account(user_id=usr_id, type=UserConf.TYPE_QQ, account=qq)
        if weixin != '':
            usr_rle_db.insert_account(user_id=usr_id, type=UserConf.TYPE_WX, account=weixin)
        if weibo != '':
            usr_rle_db.insert_account(user_id=usr_id, type=UserConf.TYPE_WB, account=weibo)

        # 通知该用户，其已经发生变化。
        redis = RedisBase()
        redis.user_change(usr_id,CODE_USER_MODIFIED,Users.ROLE_VIEWER)
        # 日志
        self.log_user_action(token_info.get("uuid"),"add_viewer",usr_id)

        result = {
            'result': True,
            'user_id': usr_id
        }

        return result

    @get(_path='/api/v1/manager/roles',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def get_manager_roles(self):
        '''
        获取可用的角色。
        :return:
        '''
        role_db = RoleRulesDao(session=self.session)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_manager_roles","-")

        return role_db.get_roles(Users.ROLE_MANAGER)

    @get(_path='/api/v1/viewer/roles',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_viewer')
    def get_viewer_roles(self):
        '''
        获取可用的角色。
        :return:
        '''
        role_db = RoleRulesDao(session=self.session)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_viewer_roles","-")

        return role_db.get_roles(Users.ROLE_VIEWER)

    @get(_path='/api/v1/admin/roles',  _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_adminer')
    def get_admin_roles(self):
        '''
        获取可用的角色。
        :return:
        '''
        role_db = RoleRulesDao(session=self.session)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_admin_roles","-")

        return role_db.get_roles(Users.ROLE_ADMIN)

    @put(_path='/api/v1/super', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_super')
    def edit_super(self):

        user_id = self.get_argument("user_id","")
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        syndicate = self.get_argument("syndicate","")

        self.logger.info("user_id:"+user_id+" username:"+user_name+"  telephone:"+telephone+"  syndicate:"+syndicate)

        if user_id == "" or user_name == "" or telephone == "" or syndicate == "":
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

        # 更新User表中的信息
        usr_db = UserDao(session= self.session)
        user_info = usr_db.user(user_id)
        old_tel = user_info['telephone']
        # 当手机号发生改变时判断该手机号是否存在
        if old_tel != telephone and usr_db.get_user_id_by_tel(telephone):
            result = {
                'result': False,
                'msg': err_msgs['TEL_EXIST']
            }
            self.set_status(400)
            return result

        usr_db.update_user(user_id, user_name, telephone)

        usr_rle_db = UserConfDao(session=self.session)
        old_syn = usr_rle_db.get_companys_by_userid_and_type(user_id,UserConf.TYPE_ROLE_SUPMGR)[0]

        # 当超级运营员集团发生改变时更新其最后一次状态表，如果正登录，改变其登录状态
        if old_syn != syndicate:
            usr_rle_db.update_synid(user_id,syndicate)
            usr_status_db = UserLastStatusDao(session=self.session)
            usr_status_db.set_company(user_id,None,Users.ROLE_SUP_MGR)
            statuses = usr_status_db.get_status_by_userid_and_role_group(user_id, Users.ROLE_SUP_MGR)

            redis = RedisBase()
            for status in statuses:
                if redis.exists_token(status.token):
                    u_token_info = redis.get_token_info(status.token)
                    u_token_info['status'] = {
                        'code': CODE_COM_MODIFIED,
                        'msg': token_status[CODE_COM_MODIFIED]['msg']
                    }
                    redis.set_token(status.token,json.dumps(u_token_info),False)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"edit_super",user_id)

        result = {
            'result': True
        }
        return result

    @put(_path='/api/v1/admins', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_adminer')
    def edit_admins(self):

        user_id = self.get_argument("user_id", "")
        user_name = self.get_argument("user_name", "")
        telephone = self.get_argument("telephone", "")
        roles = self.get_arguments("role[]")
        self.logger.info(
            "user_id:" + user_id + " username:" + user_name + "  telephone:" + telephone)

        if user_id == "" or user_name == "" or telephone == "" :
            self.set_status(400)
            return {"result": False, 'msg': err_msgs['PARAMS_MISSING']}

        # 更新User表中的信息
        usr_db = UserDao(session=self.session)
        user_info = usr_db.user(user_id)
        old_tel = user_info['telephone']
        # 当手机号发生改变时判断该手机号是否存在
        if old_tel != telephone and usr_db.get_user_id_by_tel(telephone):
            result = {
                'result': False,
                'msg': err_msgs['TEL_EXIST']
            }
            self.set_status(400)
            return result

        usr_db.update_user(user_id, user_name, telephone)

        usr_rle_db = UserConfDao(session=self.session)


        # 通知该用户，其已经发生变化。
        redis = RedisBase()
        redis.user_change(user_id, CODE_USER_MODIFIED, Users.ROLE_ADMIN)

        # 删除admin的相关信息
        usr_rle_db.delete_company_user(user_id, UserConf.ACC_COM_ID, UserConf.TYPE_ROLE_ADMIN)

        # 重新插入admin
        for role in roles:
            usr_rle_db.insert_role(user_id, UserConf.ACC_COM_ID, role, UserConf.TYPE_ROLE_ADMIN)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"edit_admin",user_id)

        result = {
            'result': True
        }
        return result

    @put(_path='/api/v1/manager', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def edit_manager(self):

        user_id = self.get_argument("user_id","")
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        roles = self.get_arguments("role[]")

        # data = json.loads(self.request.body)
        # user_id = data.get("user_id","")
        # user_name = data.get("user_name","")
        # telephone = data.get("telephone","")
        # roles = data.get("role",[])

        self.logger.info("user_id:"+user_id+" username:"+user_name+"  telephone:"+telephone+"  roles:"+','.join(roles))

        if user_id == "" or user_name == "" or telephone == "" or roles == []:
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()

        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        # 更新User表中的信息
        usr_db = UserDao(session= self.session)
        user_info = usr_db.user(user_id)
        old_tel = user_info['telephone']
        # 当手机号发生改变时判断该手机号是否存在
        if old_tel != telephone and usr_db.get_user_id_by_tel(telephone):
            result = {
                'result': False,
                'msg': err_msgs['TEL_EXIST']
            }
            self.set_status(400)
            return result

        usr_db.update_user(user_id, user_name, telephone)

        usr_rle_db = UserConfDao(session=self.session)

        # 通知该用户，其已经发生变化。
        redis = RedisBase()
        redis.user_change(user_id,CODE_USER_MODIFIED,Users.ROLE_MANAGER)



        # 下面的是东辉的版本 貌似不能用
        # 获取用户当前角色判断角色是否发生改变
        # roles_old = usr_rle_db.get_spec_roles(user_id,company_uuid,UserConf.TYPE_ROLE_MGR)
        # if sorted(roles_old) != sorted(roles):
        #     usr_status_db = UserLastStatusDao(session=self.session)
        #     statuses = usr_status_db.get_status_by_userid_and_role_group(user_id,Users.ROLE_MANAGER)
        #     for status in statuses:
        #         if company_uuid==status.company_uuid and redis.exists_token(status.token):
        #             mgr_token_info = redis.get_token_info(status.token)
        #             mgr_token_info['status'] = {
        #                 'code': CODE_USER_MODIFIED,
        #                 'msg': token_status[CODE_USER_MODIFIED]['msg']
        #             }
        #             redis.set_token(status.token,json.dumps(mgr_token_info),False)

        # 删除manager的相关信息
        usr_rle_db.delete_company_user(user_id,company_uuid,UserConf.TYPE_ROLE_MGR)

        # 重新插入manager
        for role in roles:
            usr_rle_db.insert_role(user_id, company_uuid, role,UserConf.TYPE_ROLE_MGR)
        # 日志
        self.log_user_action(token_info.get("uuid"),"edit_manager",user_id)

        result = {
            'result': True
        }
        return result

    @put(_path='/api/v1/viewer', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_viewer')
    def edit_viewer(self):
        user_id = self.get_argument("user_id","")
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        role = self.get_argument("role","")
        qq = self.get_argument("qq","")
        weixin = self.get_argument("weixin","")
        weibo = self.get_argument("weibo","")

        self.logger.info("user_id:"+user_id+" username:"+user_name+"  telephone:"+telephone+"  roles:"+role+" qq:"+qq+" weixin:"+weixin+" weibo"+weibo)
        if user_id == "" or user_name == "" or telephone == "" or role == "":
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()

        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        # 更新User表中的信息
        usr_db = UserDao(session= self.session)
        user_info = usr_db.user(user_id)
        old_tel = user_info['telephone']
        # 当手机号发生改变时判断该手机号是否存在
        if old_tel != telephone and usr_db.get_user_id_by_tel(telephone):
            result = {
                'result': False,
                'msg': err_msgs['TEL_EXIST']
            }
            self.set_status(400)
            return result
        usr_db.update_user(user_id,user_name,telephone)

        # 删除user_conf表中对应的角色
        usr_rle_db = UserConfDao(session=self.session)
        usr_rle_db.delete_company_user(user_id,company_uuid,UserConf.TYPE_ROLE_VIEWER)

        # 插入新的角色
        usr_rle_db.insert_role(user_id,company_uuid,role,UserConf.TYPE_ROLE_VIEWER)

        # 删除账户信息
        usr_rle_db.delete_account(user_id)

        # 插入账户信息
        if qq != '':
            usr_rle_db.insert_account(user_id=user_id, type=UserConf.TYPE_QQ, account=qq)
        if weixin != '':
            usr_rle_db.insert_account(user_id=user_id, type=UserConf.TYPE_WX, account=weixin)
        if weibo != '':
            usr_rle_db.insert_account(user_id=user_id, type=UserConf.TYPE_WB, account=weibo)

        # 通知该用户，其已经发生变化。
        redis = RedisBase()
        redis.user_change(user_id,CODE_USER_MODIFIED,Users.ROLE_VIEWER)
        # 日志
        self.log_user_action(token_info.get("uuid"),"edit_viewer",user_id)

        result = {
            'result': True
        }

        return result

    @delete(_path='/api/v1/super/{user_id}',_type=[str], _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_super')
    def delete_super(self,user_id):
        self.logger.info("user_id:"+user_id)

        usr_rle_db = UserConfDao(session=self.session)
        syndicate = usr_rle_db.get_syndicate_by_usrid(user_id)
        supers = usr_rle_db.get_super_by_synid(syndicate)
        if syndicate and len(supers) <= 1:
            result = {
                'result': False,
                'msg': err_msgs['CANT_DEL_LAST_SUP']
            }
            self.set_status(400)
            return result

        usr_rle_db.delete_user_by_usrid_and_type(user_id, UserConf.TYPE_ROLE_SUPMGR)

        redis = RedisBase()
        usr_status_db = UserLastStatusDao(session=self.session)
        statuses = usr_status_db.get_status_by_userid_and_role_group(user_id,Users.ROLE_MANAGER)
        for status in statuses:
            if redis.exists_token(status.token):
                u_token_info = redis.get_token_info(status.token)
                u_token_info['status'] = {
                    'code': CODE_USER_DELETED,
                    'msg': token_status[CODE_USER_DELETED]['msg']
                }
                redis.set_token(status.token,json.dumps(u_token_info),False)

        usr_status_db.del_status(user_id, Users.ROLE_SUP_MGR)

        usr_db = UserDao(session= self.session)
        usr_db.delete_user(user_id,Users.ROLE_SUP_MGR)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"delete_super",user_id)

        result = {
            'result': True
        }

        return result

    @delete(_path='/api/v1/admins/{user_id}', _type=[str], _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_adminer')
    def delete_admins(self, user_id):
        self.logger.info("user_id:" + user_id)

        usr_rle_db = UserConfDao(session=self.session)

        admins = usr_rle_db.get_admins()

        if len(admins) <= 1:
            result = {
                'result': False,
                'msg': err_msgs['CANT_DEL_LAST_ADMIN']
            }
            self.set_status(400)
            return result

        usr_rle_db.delete_user_by_usrid_and_type(user_id, UserConf.TYPE_ROLE_ADMIN)

        redis = RedisBase()
        usr_status_db = UserLastStatusDao(session=self.session)
        statuses = usr_status_db.get_status_by_userid_and_role_group(user_id, Users.ROLE_ADMIN)
        for status in statuses:
            if redis.exists_token(status.token):
                u_token_info = redis.get_token_info(status.token)
                u_token_info['status'] = {
                    'code': CODE_USER_DELETED,
                    'msg': token_status[CODE_USER_DELETED]['msg']
                }
                redis.set_token(status.token, json.dumps(u_token_info), False)

        usr_status_db.del_status(user_id, Users.ROLE_ADMIN)

        usr_db = UserDao(session=self.session)
        usr_db.delete_user(user_id, Users.ROLE_ADMIN)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"delete_admin",user_id)

        result = {
            'result': True
        }

        return result

    @delete(_path='/api/v2/manager/{user_id}',_type=[str], _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def delete_manager_v2(self,user_id):

        token_info = self.get_token()
        # 日志
        self.log_user_action(token_info.get("uuid"),"delete_manager_v2",user_id)

        result = {
            'result': True,
        }
        if(token_info is not None):
            syndicate_uuid = token_info.get("syndicate_uuid")

            #获取当前集团的所有公司
            com_db = CompanyDao(session=self.session)
            company_list = com_db.get_companys(syndicate_uuid)
            cmpy_dict = { com_item['uuid']: com_item['name'] for com_item in company_list}

            company_ids = cmpy_dict.keys()

            #删除用户的原来角色配置。
            usr_rfg_db = UserConfDao(session=self.session)
            usr_rfg_db.delete_manager_by_user_and_companys(user_id,company_ids)

            #判断此用户是否还有其他的角色，如果没有其他角色就删除此用户。
            usr_has_other = usr_rfg_db.has_role(user_id, UserConf.TYPE_ROLE_MGR)
            if(not usr_has_other):
                usr_db = UserDao(session=self.session)
                usr_db.delete_user(user_id, Users.ROLE_MANAGER)

            # 通知该用户，其已经发生变化。
            redis = RedisBase()
            redis.user_change(user_id,CODE_USER_DELETED,Users.ROLE_MANAGER)

        else:
            result = {
                    'result': False,
                    'msg': err_msgs['No_AUTHENTICATION']
                }
            self.set_status(400)
        return result

    @delete(_path='/api/v1/manager/{user_id}',_type=[str], _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_manager')
    def delete_manager(self,user_id):
        self.logger.info("user_id:"+user_id)
        token = self.request.headers.get("user_token",None)
        redis = RedisBase()

        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        usr_rle_db = UserConfDao(session=self.session)
        usr_rle_db.delete_company_user(user_id, company_uuid, UserConf.TYPE_ROLE_MGR)

        usr_status_db = UserLastStatusDao(session=self.session)
        statuses = usr_status_db.get_status_by_userid_and_role_group(user_id,Users.ROLE_MANAGER)
        for status in statuses:
            if company_uuid==status.company_uuid and redis.exists_token(status.token):
                u_token_info = redis.get_token_info(status.token)
                u_token_info['status'] = {
                    'code': CODE_USER_DELETED,
                    'msg': token_status[CODE_USER_DELETED]['msg']
                }
                redis.set_token(status.token,json.dumps(u_token_info), False)

        has_managers = usr_rle_db.has_role(user_id, UserConf.TYPE_ROLE_MGR)
        if not has_managers:
            usr_db = UserDao(session= self.session)
            usr_db.delete_user(user_id,Users.ROLE_MANAGER)
            usr_status_db.del_status(user_id,Users.ROLE_MANAGER)

        # 通知该用户，其已经发生变化。
        redis.user_change(user_id,CODE_USER_MODIFIED,Users.ROLE_VIEWER)
        # 日志
        self.log_user_action(token_info.get("uuid"),"delete_manager",user_id)

        result = {
            'result': True
        }

        return result

    @delete(_path='/api/v1/viewer/{user_id}',_type=[str], _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_viewer')
    def delete_viewer(self,user_id):
        self.logger.info("user_id:"+user_id)
        token = self.request.headers.get("user_token",None)
        redis = RedisBase()

        token_info = redis.get_token_info(token)
        company_uuid = token_info['company_uuid']

        usr_rle_db = UserConfDao(session=self.session)
        if usr_rle_db.delete_viewer(user_id, company_uuid):
            usr_db = UserDao(session= self.session)
            usr_db.delete_user(user_id,Users.ROLE_VIEWER)

        # 通知该用户，其已经发生变化。
        redis.user_change(user_id,CODE_USER_DELETED,Users.ROLE_VIEWER)
        # 日志
        self.log_user_action(token_info.get("uuid"),"delete_viewer",user_id)

        result = {
            'result': True
        }

        return result

    # 踢出用户(强制用户下线)
    @post(_path='/api/v1/user/kickout/{user_id}',  _produces=mediatypes.APPLICATION_JSON)
    # @rule_require('')
    def kick_out_user(self,user_id):
        tokens = self.redis.get_all_tokens()
        platform = self.get_argument("platform","web")
        for token in tokens:
            token_info = json.loads(self.redis.get_value(token))
            if token_info and token_info['uuid'] == user_id and token_info['platform'] == platform:
                self.redis.del_key(token)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"kick_out_user",user_id)

        result = {
            'result': True,
            'msg': "OK"
        }

        return result
