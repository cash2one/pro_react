# -*-coding:utf-8-*-

__author__ = 'commissar'
from datetime import *
import os
import json
import traceback
from apscheduler.schedulers.blocking import BlockingScheduler
from util.base_db import *
from util.Emails import EMail
from db.dao.email_send_queue_dao import EmailSendDao
from db.dao.company_dao import CompanyDao
from db.dao.user_dao import UserDao
from db.dao.user_configs_dao import UserConfigsDao
from db.modules import *
from alertArticles import *
from util.settings import *
log = getLogging()

from tornado.options import define, options

define('debug', default=True, help='Use debug settings for test purpose', type=bool)
options.parse_command_line()

def send_mail_job():
    email = EMail(SMTP_USER,SMTP_PASSWORD,SMTP_SERVER,SMTP_PORT)
    email_send_db = EmailSendDao(session=get_session())
    com_db = CompanyDao(session=get_session_rocket())
    user_db = UserDao(session=get_session_rocket())
    while True:
        try:
            send_items = email_send_db.get_need_send_item()
            if len(send_items) == 0:
                break
            for item in send_items:
                if item.type == EmailSendQueue.TYPE_WARN:
                    company = com_db.get_company_by_uuid(item.company_uuid)
                    if company:
                        if item.user_id:
                            user = user_db.get_user_by_usrid(item.user_id)
                            if user:
                                name = user.user_name
                            else:
                                continue
                        else:
                            name = company.name
                        index = company.index
                        article = get_alert_article(index, item.uuid)
                        title = article['_source']['link_title'].strip()
                        media = article['_source']['from']['media']
                        crawler_at = article['_source']['crawler_at']
                        link = article['_source']['url']
                        email_ret = email.send_alert_msg(item.email,name,item.uuid,title,media,crawler_at,link)
                        if email_ret:
                            email_send_db.update_status(item.id, EmailSendQueue.SEND_SUCCESS)
                        else:
                            email_send_db.update_status(item.id, EmailSendQueue.SEND_FAILED)
        except Exception as e:
            log.error(traceback.print_exc())


def add_email_send():
    email_send_db = EmailSendDao(session=get_session())
    user_conf_db = UserConfigsDao(session=get_session())

    now = datetime.now()
    begin_time = (now - timedelta(minutes=ADD_SEND_INTERVAL+1)).strftime('%Y-%m-%d %H:%M:%S')
    end_time = now.strftime('%Y-%m-%d %H:%M:%S')
    warns = get_warning_articles(begin_time,end_time)

    for company in warns.keys():
        if warns[company]:
            conf = user_conf_db.get_config_by_comuuid_and_type(company,UserConfigs.TYPE_WARN)
            if conf:
                value = json.loads(conf.value)
                if value.get('status') == UserConfigs.STATUS_OPEN:
                    email = value['email']
                    for article_id in warns[company]:
                        if email_send_db.article_exists(article_id):
                            continue
                        email_send_db.insert_send_item(company,EmailSendQueue.TYPE_WARN,email,article_id)


if __name__ == '__main__':
    # send_daily_mail_job()
    # alert_dispatch_job()

    # usr_set_db = SettingsDao()
    #
    # cur_date = cur_date_str()
    # usr_mail_dict = usr_set_db.get_mails_by_users(["12",],cur_date)
    #
    # send_alert_mail_job()
    # ============
    from util.base_db import *

    scheduler = BlockingScheduler()

    scheduler.add_job(send_mail_job, 'interval', minutes=10, id="send_mail_job")
    scheduler.add_job(add_email_send, 'interval', minutes=ADD_SEND_INTERVAL, id="add_email_send")
    print('Press Ctrl+{0} to exit'.format('Break' if os.name == 'nt' else 'C'))

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass