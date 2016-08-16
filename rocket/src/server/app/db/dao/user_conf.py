#coding:utf-8

__author__ = 'commissar'


import traceback
from app.setting import getLogging
from app.util.dao_base import DaoBase
from app.db.model import UserConf,RoleRules,Users,Company
from app.db.dao.role_rules import RoleRulesDao
from app.db.dao.company import CompanyDao
from app.db.dao.rules import RuleDao
from app.db.dao.users import UserDao
from app.db.dao.user_last_status import UserLastStatusDao

from sqlalchemy import and_, or_

class UserConfDao(DaoBase):
    def __init__(self, **kwargs):
        super(UserConfDao, self).__init__(**kwargs)

    def insert_manager_roles(self,user_id, roles):
        '''
        为某用户插入一批运营员角色
        :param user_id:
        :param roles:       [dict],其结构为{company_uuid:[role1,role2]}
        :return:
        '''

        for cmpy_uuid,company_roles in roles.items():
            for cmpy_role in company_roles:
                t_rule = UserConf(user_id=user_id, company_uuid=cmpy_uuid, type=UserConf.TYPE_ROLE_MGR, rule=cmpy_role)
                self.session.add(t_rule)
                self.session.commit()

        return True

    def insert_role(self,user_id,company_uuid,role,role_type):
        '''
        增加一个角色
        :param user_id:
        :param company_id:
        :param role:
        :param type:
        :return:
        '''
        ret = False

        cond = and_(UserConf.user_id == user_id, UserConf.company_uuid == company_uuid, UserConf.type == role_type, UserConf.rule == role)

        role_row = self.session.query(UserConf).filter(cond).first()
        if role_row is None:
            #此角色不存在 ，需要插入。
            t_rule = UserConf(user_id=user_id, company_uuid=company_uuid, type=role_type, rule=role)
            self.session.add(t_rule)
            self.session.commit()

            ret = True

        return ret

    def insert_account(self,user_id,type,account):
        '''
        增加一个QQ或微信或微博账户或者邮箱
        :param user_id:
        :param type:
        :param account:
        :return:
        '''
        ret = False

        cond = and_(UserConf.user_id == user_id, UserConf.type == type, UserConf.rule == account )

        role_row = self.session.query(UserConf).filter(cond).first()
        if role_row is None:
            # 此账户不存在 ，将账号信息插入数据表中
            t_rule = UserConf(user_id=user_id, company_uuid=UserConf.ACC_COM_ID, type=type, rule=account)
            self.session.add(t_rule)
            self.session.commit()

            ret = True

        return ret

    def update_account(self,user_id,type,account):
        '''
        更新用户QQ或微信或微博账户或者邮箱
        :param user_id:
        :param type:
        :param account:
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.type == type)

        role_row = self.session.query(UserConf).filter(cond).first()
        if role_row is None:
            # 此账户不存在 ，将账号信息插入数据表中
            ret = self.insert_account(user_id,type,account)
        else:
            user_conf = {
                UserConf.rule: account,
            }
            self.session.query(UserConf).filter(cond).update(user_conf)
            self.session.commit()

            ret=True

        return ret

    def delete_viewer(self,user_id, company_uuid):
        '''
        删除观察员
        :param user_id:
        :param role:
        :return: True|Fasle Ture表示该用户信息已全部删除
        '''
        ret = False
        self.delete_company_user(user_id,company_uuid,UserConf.TYPE_ROLE_VIEWER)

        # 查询该用户是否还有其他type=2的记录
        has_viewers = self.has_role(user_id, UserConf.TYPE_ROLE_VIEWER)
        if not has_viewers:
            # 说明该用户没有其他的观察者角色，删除账户信息
            self.delete_account(user_id)
            ret = True
        return ret

    def delete_company_user(self, user_id, company_uuid, role_type):
        '''
        删除公司下的某个人员(运营员|观察员)
        :param user_id:
        :param company:
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.company_uuid == company_uuid, UserConf.type == role_type)
        self.session.query(UserConf).filter(cond).delete()
        self.session.commit()

    def delete_manager_by_user_and_companys(self,user_id, company_uuids=[]):
        '''
        删除某个运营员在某些个公司中的角色。
        :param user_id:
        :param company_uuids:
        :return:
        '''

        cond = and_(UserConf.user_id == user_id, UserConf.company_uuid.in_(company_uuids), UserConf.type == UserConf.TYPE_ROLE_MGR)

        if(len(company_uuids) == 0):
            cond = and_(UserConf.user_id == user_id, UserConf.type == UserConf.TYPE_ROLE_MGR)


        self.session.query(UserConf).filter(cond).delete(synchronize_session=False)
        self.session.commit()


    def delete_company_users(self, company_uuid):
        '''
        删除公司下所有所有人员
        :param company_id:
        :return:
        '''
        self.session.query(UserConf).filter(UserConf.company_uuid==company_uuid).delete()
        self.session.commit()

    def delete_account(self, user_id):
        '''
        删除用户的角色信息
        :param user_id: 用户ID
        :return:
        '''
        types = or_(UserConf.type == UserConf.TYPE_QQ,UserConf.type == UserConf.TYPE_WX,UserConf.type == UserConf.TYPE_WB)
        con_acc = and_(UserConf.user_id == user_id, types)
        self.session.query(UserConf).filter(con_acc).delete()
        self.session.commit()

    def delete_user_by_usrid_and_type(self, user_id, role_type):
        cond = and_(UserConf.user_id == user_id, UserConf.type == role_type)
        self.session.query(UserConf).filter(cond).delete()
        self.session.commit()

    def get_manager_companies(self,user_id,company_ids=None):
        '''
        获取某运营员所管理的公司ID列表。
        :param user_id:
        :param company_ids: list|None   公司列表。
        :return:    {company_id2:[role_1,role_2],company_id2:[role_2]}
        '''

        cond = and_(UserConf.user_id == user_id, UserConf.type == UserConf.TYPE_ROLE_MGR )

        if(company_ids is not None) or (len(company_ids) > 0):
            cond = and_(UserConf.user_id == user_id, UserConf.type == UserConf.TYPE_ROLE_MGR, UserConf.company_uuid.in_(company_ids) )


        rows = self.session.query(UserConf).filter(cond).order_by(UserConf.company_uuid).all()

        result = {}
        for r in rows:
            if not result.has_key(r.company_uuid):
                result[r.company_uuid] = []

            result[r.company_uuid].append(r.rule)

        return result


    def get_viewers_by_company_uuid(self, company_uuid):
        '''
        查询该公司的所有观察者(观察者对一个公司只有一个角色)
        :param company_id: 公司ID
        :return:
        '''
        viewers_info = []
        role_rule_db = RoleRulesDao(session=self.session)
        roles_info = role_rule_db.get_roles_dict()
        cond = and_(UserConf.company_uuid == company_uuid, UserConf.type == UserConf.TYPE_ROLE_VIEWER)
        viewers = self.session.query(UserConf).filter(cond).all()
        for viewer in viewers:
            role_info = {
                'name': viewer.rule,
                'title': roles_info[viewer.rule]
            }
            viewer_info = {
                'role':role_info,
                'user_id': viewer.user_id
            }
            accounts = self.get_account(viewer.user_id)
            for account in accounts:
                if account.type == UserConf.TYPE_QQ:
                    viewer_info['qq'] = account.rule
                if account.type == UserConf.TYPE_WX:
                    viewer_info['weixin'] = account.rule
                if account.type == UserConf.TYPE_WB:
                    viewer_info['weibo'] = account.rule
            viewers_info.append(viewer_info)

        return viewers_info

    def get_managers_by_company_uuids(self,company_uuids):
        '''
        获取这批公司下的所有运营员。
        :param company_uuids:   [list]  公司uuid列表。
        :return: dict(user_id:set(company_uuid))
        '''

        if(len(company_uuids) == 0):
            return {}

        cond = and_(UserConf.company_uuid.in_(company_uuids), UserConf.type == UserConf.TYPE_ROLE_MGR)
        user_conf_list = self.session.query(UserConf).filter(cond).all()

        managers = {}   #{user_id:set(company_id)}
        for usr_conf in user_conf_list:

            if not managers.has_key(usr_conf.user_id):
                managers[usr_conf.user_id] = set()

            managers[usr_conf.user_id].add(usr_conf.company_uuid)

        return managers



    def get_managers_by_company_uuid(self, company_uuid):
        '''
        查询该公司下的所有运营者
        :param company_id:
        :return:
        '''
        managers_info = {}
        com_db = CompanyDao(session=self.session)
        company_name = com_db.get_company_by_uuid(company_uuid,False)['name']
        role_rule_db = RoleRulesDao(session=self.session)
        roles_info = role_rule_db.get_roles_dict()
        cond = and_(UserConf.company_uuid == company_uuid, UserConf.type == UserConf.TYPE_ROLE_MGR)
        managers = self.session.query(UserConf).filter(cond).all()
        for manager in managers:
            role_info = {
                'name': manager.rule,
                'title': roles_info[manager.rule]
            }
            if managers_info.get(manager.user_id):
                managers_info[manager.user_id]['roles'].append(role_info)
            else:
                managers_info[manager.user_id] = {
                    'roles':[role_info],
                    'company': company_name,
                    'user_id': manager.user_id
                }
        return managers_info.values()

    def get_admins(self):
        '''
        查询得到所有的管理员信息(姓名,电话号码,user_id)及其拥有权限
        :return:
        '''
        role_rule_db = RoleRulesDao(session=self.session)
        user_db = UserDao(session=self.session)
        admin_roles = role_rule_db.get_roles(Users.ROLE_ADMIN)
        admins = user_db.get_users_by_role_group(Users.ROLE_ADMIN)
        admin_confs = self.session.query(UserConf).filter(UserConf.type == UserConf.TYPE_ROLE_ADMIN).all()
        admin_infos = []
        for admin in admins:
            role_info_list = []
            for admin_conf in admin_confs:
                if admin.user_id == admin_conf.user_id:
                    for admin_role in admin_roles:
                        if admin_role['name'] == admin_conf.rule:
                            role_info_list.append({
                                'role_name': admin_role['name'],
                                'role_title': admin_role['title']
                            })
            admin_info = {
                'user_id': admin.user_id,
                'user_name': admin.user_name,
                'telephone': admin.telephone,
                'roles': role_info_list
            }
            admin_infos.append(admin_info)
        return admin_infos

    # 如果出现不一直的情况那就是数据库中的数据有问题 这个函数的执行速度是之前的100多倍
    def get_sprmgrs(self):
        '''
        查询得到所有的超级运营员信息(姓名,user_id,管理集团的uuid)
        :return:
        '''
        user_db = UserDao(session=self.session)
        com_db = CompanyDao(session=self.session)
        sup_mgrs_info = []
        user_confs = self.session.query(UserConf).filter(UserConf.type == UserConf.TYPE_ROLE_SUPMGR).all()
        spr_mgrs = user_db.get_users_by_role_group(Users.ROLE_SUP_MGR)
        syndicate_list = com_db.get_companys(Company.NO_PARENT)
        for user_conf in user_confs:
            for spr_mgr in spr_mgrs:
                if spr_mgr.user_id == user_conf.user_id:
                    for syndicate in syndicate_list:
                        if user_conf.company_uuid == syndicate['uuid']:
                            sup_mgr_info = {
                                'user_id': user_conf.user_id,
                                'user_name': spr_mgr.user_name,
                                'syndicate_uuid': user_conf.company_uuid,
                                'syndicate_name': syndicate['name'],
                                'telephone': spr_mgr.telephone,
                            }
                            sup_mgrs_info.append(sup_mgr_info)
        return sup_mgrs_info

    def get_syndicate_by_usrid(self, usr_id):
        cond = and_(UserConf.type == UserConf.TYPE_ROLE_SUPMGR, UserConf.user_id == usr_id)
        syndicate = self.session.query(UserConf.company_uuid).filter(cond).one_or_none()
        if syndicate:
            return syndicate[0]
        else:
            return None

    def get_super_by_synid(self, synid):
        cond = and_(UserConf.type == UserConf.TYPE_ROLE_SUPMGR, UserConf.company_uuid == synid)
        sup_mgrs = self.session.query(UserConf).filter(cond).all()
        return sup_mgrs

    def get_admin_by_synid(self, synid):
        cond = and_(UserConf.type == UserConf.TYPE_ROLE_ADMIN, UserConf.company_uuid == synid)
        admins = self.session.query(UserConf).filter(cond).all()
        return admins

    def viewer_is_exist(self,user_id,company_uuid):
        '''
        检查该用户在某公司是否存在观察者
        :param user_id: 用户ID
        :param company_id: 公司ID
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.company_uuid == company_uuid, UserConf.type == UserConf.TYPE_ROLE_VIEWER)
        viewer = self.session.query(UserConf).filter(cond).one_or_none()
        if viewer:
            return True
        return False

    def manager_is_exist(self,user_id,company_uuid):
        '''
        检查该用户在某公司是否存在运营员
        :param user_id: 用户ID
        :param company_id: 公司ID
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.company_uuid == company_uuid, UserConf.type == UserConf.TYPE_ROLE_MGR)
        mgr = self.session.query(UserConf).filter(cond).first()
        if mgr:
            return True
        return False

    def has_role(self, user_id, role_type=None):
        '''
        检查用户是否存在type为role_type的记录
        :param role_type:
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.type == role_type)

        if(role_type is None):
            cond = UserConf.user_id == user_id

        count = self.session.query(UserConf).filter(cond).count()
        if count > 0:
            return True
        return False

    def get_companys_by_userid_and_type(self, user_id, role_type):
        '''
        通过user_id和type获得公司列表
        :param user_id:
        :param role_type:
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.type == role_type)
        records = self.session.query(UserConf.company_uuid).filter(cond).distinct().all()
        companys = [record[0] for record in records]
        return companys

    def get_spec_roles(self, user_id, company_uuid, role_type):
        '''
        获得该用户在该公司下特定类型的角色
        :param user_id:
        :param company_id:
        :param role_type:
        :return:
        '''
        cond = and_(UserConf.user_id == user_id, UserConf.company_uuid == company_uuid, UserConf.type == role_type)
        roles = self.session.query(UserConf).filter(cond).all()
        role_list = [role.rule for role in roles]
        return role_list

    def get_account(self, user_id):
        '''
        获取用户的账户信息
        :param user_id:
        :return:
        '''
        acc_type = or_(UserConf.type==UserConf.TYPE_QQ,UserConf.type==UserConf.TYPE_WB,UserConf.type==UserConf.TYPE_WX)
        cond = and_(UserConf.user_id == user_id, acc_type)
        accounts = self.session.query(UserConf).filter(cond).all()
        return accounts

    def update_synid(self, usr_id, syn_id):
        update = {
            UserConf.company_uuid: syn_id
        }
        self.session.query(UserConf).filter(UserConf.user_id == usr_id).update(update)
        self.session.commit()
