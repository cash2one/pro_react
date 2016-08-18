# -*-coding:utf-8-*-

__author__ = 'commissar'

from util.db import DaoBase
from db.modules import UserConfigs

from sqlalchemy import and_

class UserConfigsDao(DaoBase):
    def __init__(self, **kwargs):
        super(UserConfigsDao, self).__init__(**kwargs)

    def get_config_by_company_uuid(self,company_uuid):
        '''
        通过公司uuid获取公司索引
        :param uuid: 公司uuid
        :return:
        '''
        conf = self.session.query(UserConfigs).filter(UserConfigs.company_uuid == company_uuid).one_or_none()
        if conf:
            return conf
        else:
            return None

    def get_config_by_comuuid_and_type(self, company_uuid, type):
        cond = and_(UserConfigs.company_uuid == company_uuid, UserConfigs.type == type)
        conf = self.session.query(UserConfigs).filter(cond).one_or_none()
        if conf:
            return conf
        else:
            return None


