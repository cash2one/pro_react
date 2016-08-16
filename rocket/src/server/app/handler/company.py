#coding:utf-8

__author__ = 'commissar'

import json
import random

from pyrestful import mediatypes
from pyrestful.rest import get, post, put, delete
from app.util.base_handler import BaseHandler
from app.db.dao.users import UserDao
from app.db.dao.company import CompanyDao
from app.db.dao.user_last_status import UserLastStatusDao
from app.db.dao.user_conf import UserConfDao
from app.db.dao.redis_base import RedisBase
from app.db.model import Users,UserConf,Company
from app import setting
from app.util.base_rbac import token_require,rule_require
from app.util.base_es import EsBase
from conf.err_msgs import *

class CompanyHandler(BaseHandler):

    @get(_path='/api/v1/company', _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def list(self):
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument('sort','py')
        self.logger.info("beg:"+str(beg)+"count:"+str(count))

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()

        token_info = redis.get_token_info(token)

        user_id = token_info['uuid']
        role_group = token_info['role_group']
        role_type = self.get_user_conf_type(role_group)
        usr_conf_db = UserConfDao(session=self.session)
        companys = usr_conf_db.get_companys_by_userid_and_type(user_id, role_type)

        company_list = []
        com_db = CompanyDao(session=self.session)
        if role_group == Users.ROLE_SUP_MGR:
            company_list = com_db.get_companys(companys[0], search) # 一个超级管理员只能管理一个集团

        else:
            for com_uuid in companys:
                company = com_db.get_company_by_uuid(com_uuid,False)
                if company['name'].find(search) == -1:
                    continue
                result = {
                    'uuid': com_uuid,
                    'name': company['name'],
                    'desc': company['desc'],
                    'property': company['property'],
                    'py': company['py'],
                    'id': company['id']
                }
                company_list.append(result)
        company_list.sort(key=lambda com: com[sort])
        self.log_user_action(token_info.get("uuid"),"company_list","-")
        result = {
            'result': True,
            'count': len(company_list),
            'companys': company_list[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(company_list) else company_list[int(beg):]
        }
        return result

    # 优化API  之前的API访问数据库次数太多
    @get(_path='/api/v1/syndicate', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_syndicate')
    def syndicate_list(self):
        beg = self.get_argument("beg",0)
        count = self.get_argument("count",30)
        search = self.get_argument("search","")
        sort = self.get_argument('sort','id')
        self.logger.info("beg:"+str(beg)+"count:"+str(count))

        com_db = CompanyDao(session=self.session)
        usr_conf_db = UserConfDao(session=self.session)
        syndicate_list = com_db.get_companys(Company.NO_PARENT, search)
        spr_mgrs = usr_conf_db.get_sprmgrs()

        for syndicate in syndicate_list:
            supers_info = []
            for spr_mgr in spr_mgrs:
                if spr_mgr['syndicate_uuid'] == syndicate['uuid']:
                    supers_info.append(spr_mgr['user_name'])
            syndicate['supers'] = supers_info

        syndicate_list.sort(key=lambda com: com[sort])
        self.log_user_action(self.get_token().get("uuid"),"syndicate_list","-")
        result = {
            'result': True,
            'count': len(syndicate_list),
            'syndicates': syndicate_list[int(beg):int(beg)+int(count)] if (int(beg)+int(count)) <= len(syndicate_list) else syndicate_list[int(beg):]
        }
        return result

    @post(_path='/api/v1/company', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_company')
    def create_company(self):
        name = self.get_argument("name","")
        desc = self.get_argument("desc","")
        uuid = self.get_argument("uuid","").lower()
        prop = self.get_argument("property","")
        self.logger.info("name:"+name+"  desc:"+desc)

        if name == "" or uuid == "":
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']
        parent_uuid = token_info['syndicate_uuid']

        com_db = CompanyDao(session=self.session)
        es_index = self.build_es_index(parent_uuid,uuid)

        # 当uuid已存在时添加失败，返回推荐uuid
        if not com_db.insert_company(name,desc,prop,user_id,parent_uuid,uuid,es_index):
            result = {
                'result': False,
                'msg': err_msgs['COM_UUID_EXIST'],
                'recommendation': self.build_company_uuid(uuid)
            }
            self.set_status(400)
            return result

        # 在es中创建公司索引，当公司索引创建失败时删除公司返回错误信息
        if not EsBase().create_index(es_index):
            com_db.delete_company(uuid)
            result = {
                'result': False,
                'msg': err_msgs['INDEX_CREATE_ERR']
            }
            self.set_status(400)
            return result

        # 在grout中设置公司的配置信息，设置失败删除公司和es中的索引，返回错误信息
        if not self.post_company_grout(uuid,es_index):
            com_db.delete_company(uuid)
            EsBase().delete_index(es_index)
            result = {
                'result': False,
                'msg': err_msgs['COM_CONF_ERR']
            }
            self.set_status(400)
            return result

        # 设置公司的关注媒体类型
        self.set_com_media(uuid)
        self.log_user_action(self.get_token().get("uuid"),"create_company","-")
        result = {
            'result': True
        }
        return result

    @post(_path='/api/v1/syndicate', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_syndicate')
    def create_syndicate(self):
        name = self.get_argument("name","")
        desc = self.get_argument("desc","")
        uuid = self.get_argument("uuid","")
        user_name = self.get_argument("user_name","")
        telephone = self.get_argument("telephone","")
        self.logger.info("name:"+name+"  desc:"+desc+"  user_name:"+user_name+"  telephone:"+telephone)

        if name == "" or user_name == "" or telephone == "" or uuid == "":
            self.set_status(400)
            return {"result":False,'msg':err_msgs['PARAMS_MISSING']}

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

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']

        com_db = CompanyDao(session=self.session)
        # 当uuid已存在时插入失败，返回推荐uuid
        if not com_db.insert_company(name,desc,None,user_id,Company.NO_PARENT,uuid,None):
            result = {
                'result': False,
                'msg': err_msgs['COM_UUID_EXIST'],
                'recommendation': self.build_company_uuid(uuid)
            }
            self.set_status(400)
            return result

        usr_rle_db = UserConfDao(session=self.session)
        usr_rle_db.insert_role(usr_id,uuid,UserConf.SUB_ROLE_SUP_MGR,UserConf.TYPE_ROLE_SUPMGR)
        # 日志
        self.log_user_action(token_info.get("uuid"),"create_syndicate",uuid)

        result = {
            'result': True
        }
        return result

    @put(_path='/api/v1/company/{uuid}', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_company')
    def edit_company(self,uuid):
        name = self.get_argument("name","")
        desc = self.get_argument("desc","")
        prop = self.get_argument("property","")
        self.logger.info("uuid:"+uuid+" company:"+name+"  desc:"+desc+"  property:"+prop)

        if name == "" or prop == "":
            self.set_status(400)
            return {"result":False,'msg': err_msgs['PARAMS_MISSING']}

        com_db = CompanyDao(session=self.session)
        com_db.update_company(uuid, name, desc, prop)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"edit_company",uuid)

        result = {
            'result': True
        }

        return result

    @put(_path='/api/v1/syndicate/{uuid}', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_syndicate')
    def edit_syndicate(self,uuid):
        name = self.get_argument("name","")
        desc = self.get_argument("desc","")
        self.logger.info("uuid:"+uuid+" company:"+name+"  desc:"+desc)

        if name == "":
            self.set_status(400)
            return {"result":False,'msg': err_msgs['PARAMS_MISSING']}

        com_db = CompanyDao(session=self.session)
        com_db.update_company(uuid, name, desc, None)
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"edit_syndicate",uuid)

        result = {
            'result': True
        }

        return result

    @delete(_path='/api/v1/company/{uuid}', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_ac_manager_company')
    def delete_company(self,uuid):
        self.logger.info("uuid:"+uuid)

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        usr_id = token_info['uuid']
        company_uuid = token_info.get('company_uuid')
        parent_uuid = token_info['syndicate_uuid']

        # 获取该公司下的所有运营员
        user_conf_db = UserConfDao(session=self.session)
        mgrs = user_conf_db.get_managers_by_company_uuid(uuid)
        views = user_conf_db.get_viewers_by_company_uuid(uuid)

        com_db = CompanyDao(session=self.session)
        usr_status_db = UserLastStatusDao(session=self.session)
        if com_db.delete_company(uuid):
            # 删除该公司下的运营员
            user_conf_db.delete_company_users(uuid)
            usr_db = UserDao(session=self.session)
            # 遍历该公司下的运营员，如果在其他公司不存在角色在用户表中删除该运营员
            for mgr in mgrs:
                mgr_id = mgr['user_id']
                if not user_conf_db.has_role(mgr_id,UserConf.TYPE_ROLE_MGR):
                    usr_db.delete_user(mgr_id,Users.ROLE_MANAGER)
                    usr_status_db.del_status(mgr_id,Users.ROLE_MANAGER)
            for view in views:
                view_id = view['user_id']
                if not user_conf_db.has_role(view_id,UserConf.TYPE_ROLE_VIEWER):
                    user_conf_db.delete_account(view_id)
                    usr_db.delete_user(view_id,Users.ROLE_VIEWER)

            # 删除ES中的公司索引
            es_index = self.build_es_index(parent_uuid,uuid)
            EsBase().delete_index(es_index)
            # 在grout中删除公司
            self.delete_company_grout(uuid)
            # 删除公司时发送消息到频道中
            redis.del_company(usr_id,uuid)
            # 查询token，更改状态
            tokens = redis.get_all_tokens()
            for r_token in tokens:
                t_info = json.loads(redis.get_value(r_token))
                # 将当前已登录用户com_uuid为被删除公司的用户token状态重置
                if t_info.get('company_uuid') == uuid and t_info.get('uuid') != usr_id:
                    t_info['status'] = {
                        'code': CODE_COM_MODIFIED,
                        'msg': token_status[CODE_COM_MODIFIED]['msg']
                    }
                    redis.set_value(r_token,json.dumps(t_info))
                    redis.expire(r_token,setting.KICKED_EXPIRE_TIME)

            platform = usr_status_db.get_from_by_token(token)
            # 当超级运营员把当前选择公司删除，返回301
            if uuid == company_uuid:
                kwargs = {
                    "update_at": token_info.get("update_at"),
                }
                info = json.dumps(self.gen_token_info(usr_id, Users.ROLE_SUP_MGR, platform,**kwargs))
                redis.set_token(token, info)
                self.set_status(301)
            # 日志
            self.log_user_action(token_info.get("uuid"),"delete_company",uuid)

            result = {
                'result': True
            }

        # 只有删除集团并且集团下还有公司才会删除失败
        else:
            result = {
                'result': False,
                'msg': err_msgs['HAS_COMS']
            }
            self.set_status(400)

        return result

    @delete(_path='/api/v1/syndicate/{uuid}', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_syndicate')
    def delete_syndicate(self,uuid):
        self.logger.info("uuid:"+uuid)
        com_db = CompanyDao(session=self.session)
        if com_db.delete_company(uuid):
            redis = RedisBase()
            # 改变当前登录超级运营员的token状态
            tokens = redis.get_all_tokens()
            for r_token in tokens:
                t_info = json.loads(redis.get_value(r_token))
                if t_info.get('syndicate_uuid') == uuid and t_info.get('role_group') == Users.ROLE_SUP_MGR:
                    t_info['status'] = {
                        'code': CODE_COM_MODIFIED,
                        'msg': token_status[CODE_COM_MODIFIED]['msg']
                    }
                    redis.set_value(r_token,json.dumps(t_info))
                    redis.expire(r_token,setting.KICKED_EXPIRE_TIME)

            # 删除其他表里该集团超级管理员的相关信息
            user_db = UserDao(session=self.session)
            user_status_db = UserLastStatusDao(session=self.session)
            user_conf_db = UserConfDao(session=self.session)
            supers = user_conf_db.get_super_by_synid(uuid)
            for super in supers:
                # 改变当前登录的超级运营员的状态
                user_status_db.del_status(super.user_id, Users.ROLE_SUP_MGR)
                user_conf_db.delete_user_by_usrid_and_type(super.user_id, UserConf.TYPE_ROLE_SUPMGR)
                user_db.delete_user(super.user_id, Users.ROLE_SUP_MGR)
            # 日志
            self.log_user_action(self.get_token().get("uuid"),"delete_syndicate",uuid)

            return {'result': True}

        # 集团下还有公司删除失败
        else:
            result = {
                'result': False,
                'msg': err_msgs['HAS_COMS']
            }
            self.set_status(400)
            return result

    @put(_path='/api/v1/user/com', _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def edit_user_company(self):

        company_uuid = self.get_argument("uuid","")

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)
        user_id = token_info['uuid']
        role_group = token_info['role_group']
        role_type = self.get_user_conf_type(role_group)

        user_conf_db = UserConfDao(session=self.session)
        user_com_uuids = user_conf_db.get_companys_by_userid_and_type(user_id,role_type)
        com_db = CompanyDao(session=self.session)

        if len(user_com_uuids) > 0 and role_group == Users.ROLE_SUP_MGR:
            companies = com_db.get_companys(user_com_uuids[0]) # 一个超级管理员只能管理一个集团
            com_uuids = []
            for company in companies:
                com_uuids.append(company['uuid'])
            user_com_uuids = com_uuids

        # 日志
        self.log_user_action(token_info.get("uuid"),"edit_user_company",company_uuid)

        result = {
            'result': True
        }
        if company_uuid and company_uuid not in user_com_uuids:
            result = {
                'result': False,
                'msg':err_msgs["ACCESS_COMPANY_DENIED"],
            }
            self.set_status(403,err_msgs["ACCESS_COMPANY_DENIED"])
        else:
            user_status_db = UserLastStatusDao(session=self.session)
            user_status_db.set_company_by_token(token, company_uuid)
            platform = user_status_db.get_from_by_token(token)

            # 更新token
            kwargs = {
                "update_at":token_info.get("update_at"),
            }
            new_token = json.dumps(self.gen_token_info(user_id, role_group, platform,**kwargs))
            redis.set_token(token, new_token)

        return result

    @get(_path='/api/v1/company/property', _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def get_company_property(self):
        props = sorted(Company.PROP.keys())
        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_company_property","-")

        result = []
        for prop in props:
            r = {
                'type': prop,
                'name': Company.PROP[prop]
            }
            result.append(r)
        return result
