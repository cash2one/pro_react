# -*-coding:utf-8-*-
import logging
REDIS_HOST = '192.168.1.202'
CHANNEL = 'mod_home'

DB_HOST = '192.168.1.202'
DB_PORT = 3306
DB_NAME = 'starLordEx'
DB_NAME_ROCKET = 'rocket_db'
DB_USER = 'root'
DB_PASS = 'pzzh123456'

SMTP_SERVER = "smtp.exmail.qq.com"
SMTP_PORT = 465
SMTP_USER = "rdev@puzhizhuhai.com"
SMTP_PASSWORD = "Rdev123456"

ES_HOST = 'http://192.168.1.202:9200/'

REPORT_RENDER_HOST = "info.puzhizhuhai.com"

ADD_SEND_INTERVAL = 10

TOP_CAT = ['_cat_print','_cat_network','_cat_new','_cat_tv','_cat_bbs',
           '_cat_blog','_cat_wiki','_cat_video','_cat_weibo','_cat_weixin']

EMOTIONS = ['_emo_positive','_emo_negative','_emo_neutral','_warn_']

def getLogging():
    return logging.getLogger("star-lord-ex")
