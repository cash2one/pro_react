#coding: utf-8

__author__ = 'commissar'

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import traceback
from settings import REPORT_RENDER_HOST
from tornado.template import Loader
import os

class EMail(object):
    def __init__(self,user,passwd, smtp,port=23):
        self.smtp_conf = smtp
        self.smtp_port = port
        self.user = user
        self.passwd = passwd

        self.smtp_srv = None

        parent_path = os.path.split(os.path.dirname(__file__))[0]
        alert_mail_tmp_path = os.path.join(parent_path, "templates")
        self.alert_mail_tmpl = Loader(alert_mail_tmp_path).load("email_warn.html")
        self.daily_mail_tmpl = Loader(alert_mail_tmp_path).load("email_daily.html")



    @property
    def smtp(self):
        if(self.smtp_srv is None):
            smtp = smtplib.SMTP_SSL()

            smtp.connect(self.smtp_conf,self.smtp_port)
            smtp.login(self.user,self.passwd)
            self.smtp_srv = smtp
        return self.smtp_srv

    def __build_alert_mail_body(self,recev_name,uuid,title,media,uuid_at,link):
        '''
        构建预警Mail的实体
        :return:    [string]邮件实体
        '''

        link_in_sys = 'http://%s/base#/article/%s'%(REPORT_RENDER_HOST,uuid)

        data = {"user_name":recev_name,
                "title":title,
                "link":link,
                "media":media,
                "create_at":uuid_at,
                "link_in_sys": link_in_sys
                }
        return self.alert_mail_tmpl.generate(**data)

        pass


    def send_alert_msg(self,recev,recev_name,uuid,title,media,uuid_at,link):
        '''
        发送预警信息。
        :param recev:   [str]接收邮件的邮箱
        :param recev_name:     [str]接收邮件的人昵称
        :param uuid:            [str]报警文章的UUID，用于生成系统内唯一连接。
        :param title:           [str]报警文章标题。
        :param media:           [str]报警文章出处，媒体名称。
        :param media_level      [int]媒体等级。
        :param uuid_at          [datetime]文章发现时间
        :param link:            [str]文章原始链接。
        :return:    True|False
        '''

        ret = False

        try:
            msg = MIMEMultipart()
            msg['From'] = self.user
            msg['To'] = recev
            msg['Subject'] = u"预警-%s-%s"%(media,title)

            # txt_part = u'''
            # <b>预警通知：</b><br>
            # 普智星爵舆情发现重要舆情信息如下：<br>
            # <a href=http://%s/news-daily-detail?id=%s>%s</a>
            # '''%(REPORT_RENDER_HOST,uuid,uuid_title)

            txt_part = self.__build_alert_mail_body(recev_name,uuid,title,media,uuid_at,link)

            txt = MIMEText(txt_part,'html','utf-8')
            msg.attach(txt)

            # fp = open('h:\\python\\1.jpg', 'rb')
            # msgImage = MIMEImage(fp.read())
            # fp.close()
            #
            # msgImage.add_header('Content-ID', '<image1>')
            # msg.attach(msgImage)


            self.smtp.sendmail(self.user, recev, msg.as_string())
            ret = True
        except Exception as e:
            traceback.print_exc()
            ret = False

        return ret

    def __build_daily_mail_body(self,info,info_str):
        '''
        构建预警Mail的实体
        :return:    [string]邮件实体
        '''

        data = {
            "info": info,
            "info_str": info_str
                }
        return self.daily_mail_tmpl.generate(**data)

        pass

    def send_daily_msg(self,recev,daliy_date,image_name,info,info_str):
        '''
        发送预警信息。
        :param recev:   [str]接收邮件的邮箱
        :param user_id:        [str]日报创建人id
        :param image_name:     [str]日报图片路径
        :param info:           [str]日报相关信息
        :param info_str:           [str]日报相关信息字符串
        :return:    True|False
        '''

        ret = False

        try:
            msg = MIMEMultipart()
            msg['From'] = self.user
            msg['To'] = recev
            msg['Subject'] = u"舆情日报-%s" % daliy_date

            txt_part = self.__build_daily_mail_body(info, info_str)

            txt = MIMEText(txt_part,'html','utf-8')
            msg.attach(txt)

            #二进制模式读取图片，并绑定到邮件头
            fp = open(image_name, 'rb')
            msgImage = MIMEImage(fp.read())
            msgImage.add_header('Content-ID','daily')
            msg.attach(msgImage)
            fp.close()

            fp = open('webserver/static/images/title_focus.png', 'rb')
            title_focus = MIMEImage(fp.read())
            title_focus.add_header('Content-ID','title_focus')
            msg.attach(title_focus)
            fp.close()

            self.smtp.sendmail(self.user, recev, msg.as_string())
            ret = True
        except Exception as e:
            traceback.print_exc()
            ret = False

        return ret
