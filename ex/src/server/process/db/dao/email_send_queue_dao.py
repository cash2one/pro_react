# -*-coding:utf-8-*-

__author__ = 'commissar'

from util.db import DaoBase
from db.modules import EmailSendQueue as ESQ

from sqlalchemy import and_

class EmailSendDao(DaoBase):
    def __init__(self, **kwargs):
        super(EmailSendDao, self).__init__(**kwargs)

    def get_need_send_item(self,count=10):
        '''
        获取指定条需要发送的纪录。
        :param count:   [int]   需要发送的纪录条数。
        :return:    EmailSendQueue纪录列表
        '''
        cond = and_(ESQ.send_status != ESQ.SEND_SUCCESS, ESQ.send_count <= ESQ.SEND_MAX_COUNT)

        return self.session.query(ESQ).filter(cond).order_by(ESQ.send_status.asc(),ESQ.create_at.asc()).limit(count).all()

    def update_status(self, id, status):
        '''
        更新邮件队列的状态
        :param id:
        :param status:
        :return:
        '''
        update = {
            ESQ.send_status: status,
            ESQ.send_at: self.cur_date(),
            ESQ.send_count: ESQ.send_count+1,
        }
        self.session.query(ESQ).filter(ESQ.id == id).update(update)
        self.session.commit()

    def article_exists(self, uuid):
        articles = self.session.query(ESQ).filter(ESQ.uuid == uuid).all()
        if len(articles) > 0:
            return True
        return False

    def insert_send_item(self,company_uuid,type,email,uuid):
        item = ESQ(company_uuid=company_uuid,type=type,email=email,uuid=uuid,create_at=self.cur_date())
        self.session.add(item)
        self.session.commit()
