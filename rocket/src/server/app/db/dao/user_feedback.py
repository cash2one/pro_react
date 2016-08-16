#coding:utf-8

__author__ = 'commissar'

from app.util.dao_base import DaoBase
from app.db.model import UserFeedback
from app.db.model import UserConf
import traceback
from app.setting import getLogging

class UserFeedbackDao(DaoBase):
    def __init__(self, **kwargs):
        super(UserFeedbackDao, self).__init__(**kwargs)


    def insert_user_feedback(self, user_id, content, company_uuid, platform, typeid):
        '''
        增加用户反馈。
        :param user_id:
        :param content:
        :param company_uuid:
        :param platform:
        :return:
        '''
        logger = getLogging()
        ret = False
        try:
            uf_new = UserFeedback(user_id=user_id, company_uuid=company_uuid, content=content, platform=platform, type=typeid)
            self.session.add(uf_new)
            self.session.commit()
            ret = True
        except Exception,e:
            logger.exception(str(e))

        return ret

