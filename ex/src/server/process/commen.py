# -*-coding:utf-8-*-

from apscheduler.schedulers.blocking import BlockingScheduler
import logging
logging.basicConfig()
import urllib
import StringIO
import re
import json
from util.db import DBConnection,cur_date_str,cur_day_str
from datetime import *
# import time
import requests
import util.settings

base_url = util.settings.ES_HOST
def get_cpys():
    # c = pycurl.Curl()
    # c.setopt(pycurl.URL, 'http://192.168.1.202:9200/_stats/index?pretty')
    # b = StringIO.StringIO()
    # c.setopt(pycurl.WRITEFUNCTION, b.write)
    # c.setopt(pycurl.FOLLOWLOCATION, 1)
    # c.setopt(pycurl.MAXREDIRS, 5)
    # c.perform()
    # cpStrs=b.getvalue()
    # cpObjs = json.loads(cpStrs)
    #
    # # print cpStrs
    # cpys = []
    # for c in cpObjs['indices']:
    #     if(c.find('co_') != -1):
    #         cpys.append(c)
    r = requests.get(base_url+"_stats/index?pretty")
    cpObjs = json.loads(r.text)
    cpys = []
    for c in cpObjs['indices']:
        if(c.find('co_') != -1):
            cpys.append(c)
            print c

    return cpys

def get_urls(cpys):
    urls = []
    for cp in cpys:
        urls.append(base_url+cp+'/_count? -d')

    return urls


def get_end_time():
    day = cur_day_str()
    day_end_str = day+' 23:59:50'
    day_end_date = datetime.strptime(day_end_str,'%Y-%m-%d %H:%M:%S')
    # year = day_end_str[:4]
    # month = day_end_str[5:7]
    # day = day_end_str[8:10]
    # hour = day_end_str[11:13]
    # min = day_end_str[14:16]
    # sec = day_end_str[17:19]
    # day_end_date = datetime(int(year),int(month),int(day),int(hour),int(min),int(sec))
    return day_end_date


