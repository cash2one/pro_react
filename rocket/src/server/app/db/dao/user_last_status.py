# -*-coding:utf8-*-
__author__ = 'yudh'


import traceback
from app.setting import getLogging
from app.util.dao_base import DaoBase
from app.db.model import UserConf,RoleRules,UserLastStatus,Users
from app.db.dao.role_rules import RoleRulesDao

from sqlalchemy import and_

class UserLastStatusDao(DaoBase):
    def __init__(self, **kwargs):
        super(UserLastStatusDao, self).__init__(**kwargs)

    def set_company(self, user_id, company_uuid, role_group):
        '''
        设置用户操作的公司
        :param user_id:
        :param company_id:
        :return:
        '''
        status = self.get_status_by_userid_and_role_group(user_id, role_group)
        if status:
            update = {
                UserLastStatus.company_uuid: company_uuid,
                UserLastStatus.update_at: self.cur_date()
            }
            cond = and_(UserLastStatus.user_id == user_id, UserLastStatus.role_group==role_group)
            self.session.query(UserLastStatus).filter(cond).update(update)
        else:
            self.insert_status(user_id, company_uuid=company_uuid, role_group=role_group)
        self.session.commit()

    def set_company_by_token(self, token, company_uuid):
        update = {
            UserLastStatus.company_uuid: company_uuid,
            UserLastStatus.update_at: self.cur_date()
        }
        self.session.query(UserLastStatus).filter(UserLastStatus.token == token).update(update)
        self.session.commit()

    def get_from_by_token(self, token):
        platform = self.session.query(UserLastStatus.platform).filter(UserLastStatus.token == token).one_or_none()
        if platform:
            return platform[0]
        else:
            return None

    def set_companys(self, company_uuid, syndicate_uuid):
        update = {
            UserLastStatus.company_uuid: syndicate_uuid,
            UserLastStatus.update_at: self.cur_date()
        }
        cond = and_(UserLastStatus.role_group == Users.ROLE_SUP_MGR, UserLastStatus.company_uuid == company_uuid)
        self.session.query(UserLastStatus).filter(cond).update(update)
        self.session.commit()

    def insert_status(self, user_id, **data):
        '''
        插入一条记录
        :param user_id:
        :param data:
        :return:
        '''
        t_status = UserLastStatus(user_id=user_id,**data)
        self.session.add(t_status)
        self.session.commit()

    def get_status_by_userid_and_role_group(self, user_id, role_group):
        '''
        通过user_id获取状态信息
        :param user_id:
        :return:
        '''
        cond = and_(UserLastStatus.user_id == user_id, UserLastStatus.role_group == role_group)
        status = self.session.query(UserLastStatus).filter(cond).all()
        return status

    def get_specific_status(self, user_id, role_group, platform):
        cond = and_(UserLastStatus.user_id == user_id, UserLastStatus.role_group == role_group, UserLastStatus.platform == platform)
        status = self.session.query(UserLastStatus).filter(cond).one_or_none()
        if status:
            return status
        return None

    def set_token(self, user_id, role_group, token, platform):
        status = self.get_specific_status(user_id, role_group, platform)
        if status:
            update = {
                UserLastStatus.token: token,
                UserLastStatus.update_at: self.cur_date()
            }
            self.session.query(UserLastStatus).filter(UserLastStatus.id == status.id).update(update)
        else:
            self.insert_status(user_id, token=token, role_group=role_group, platform=platform)
        self.session.commit()

    def del_status(self, user_id, role_group):
        cond = and_(UserLastStatus.user_id==user_id, UserLastStatus.role_group == role_group)
        self.session.query(UserLastStatus).filter(cond).delete()
        self.session.commit()

