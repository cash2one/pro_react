# -*-coding:utf-8-*-

__author__ = 'commissar'

from util.db import DaoBase
from db.modules import Company

class CompanyDao(DaoBase):
    def __init__(self, **kwargs):
        super(CompanyDao, self).__init__(**kwargs)

    def get_company_by_uuid(self,uuid):
        '''
        通过公司uuid获取公司索引
        :param uuid: 公司uuid
        :return:
        '''
        company = self.session.query(Company).filter(Company.uuid == uuid).one_or_none()
        if company:
            return company
        else:
            return None

