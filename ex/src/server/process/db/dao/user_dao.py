# -*-coding:utf-8-*-

__author__ = 'commissar'

from util.db import DaoBase
from db.modules import Users

class UserDao(DaoBase):
    def __init__(self, **kwargs):
        super(UserDao, self).__init__(**kwargs)

    def get_user_by_usrid(self,uuid):
        '''
        通过公司uuid获取公司索引
        :param uuid: 公司uuid
        :return:
        '''
        user = self.session.query(Users).filter(Users.user_id == uuid).first()
        if user:
            return user
        else:
            return None

