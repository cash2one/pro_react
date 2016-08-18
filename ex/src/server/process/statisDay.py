# -*-coding:utf-8-*-


from apscheduler.schedulers.blocking import BlockingScheduler
import logging
logging.basicConfig()
# import pycurl
import urllib
import StringIO
import re
import json
from util.db import DBConnection,cur_date_str,cur_day_str
import util.settings
import commen
from datetime import *
import time
import threading
import requests

statis_names = {
    '_emo_positive':'article_positive_cnt',
    '_emo_negative':'article_negative_cnt',
    '_emo_neutral':'article_neutral_cnt',
    '_warn_':'article_warn_cnt',
}

def get_article_count(urls,cpys):
    artCnt = {}
    for index in range(len(urls)):
        cp_index = cpys[index]
        # ch = 'c'+ str(index)
        # ch = pycurl.Curl()
        # ch.setopt(pycurl.URL, urls[index])
        url = urls[index]
        emotoins = util.settings.EMOTIONS
        ems = {}
        cons = {
            "from":cur_day_str()+' 00:00:00',
            "to":cur_day_str()+' 23:59:59'
            }
        for em in emotoins:
            # b = StringIO.StringIO()
            # ch.setopt(pycurl.WRITEFUNCTION, b.write)

            post_data_dic = {
            "filter" : {
                "and":[
                        {
                            "range" : {
                                "crawler_at" : cons
                            }
                        },
                        {
                            "term" : {"result_tags":em}
                        }
                    ]
                }
            }

            r = requests.post(url, data = json.dumps(post_data_dic))
            res = json.loads(r.text)
            # ch.setopt(ch.POSTFIELDS,  json.dumps(post_data_dic))
            # ch.perform()
            # strs = b.getvalue()
            # res = json.loads(strs)
            print  res
            ems[em] = res["count"]

        artCnt[cp_index] = ems

    return  artCnt


def save_data(data):
    db = DBConnection()
    for key,val in data.items():
        art_cnt = 0     #文章总数
        for em,cnt in val.items():
            data = []
            n_item = {
                    "type" : 5,
                    "st_id": key,
                    "name":statis_names[em],
                    'value':cnt,
                    'record_at':cur_day_str(),
                    'update_at':cur_date_str()
                }

            #文章总数=正负中加和,不加预警
            if em != '_warn_':
                art_cnt = art_cnt+cnt

            data.append(n_item)
            row = db.add_datas('statis_day', data)
            print(row)

        data = []
        n_item = {
                "type" : 5,
                "st_id": key,
                "name":'article_cnt',
                'value':art_cnt,
                'record_at':cur_day_str(),
                'update_at':cur_date_str()
            }
        data.append(n_item)
        row = db.add_datas('statis_day', data)



def my_job():
    cpys = commen.get_cpys()
    urls = commen.get_urls(cpys)
    data = get_article_count(urls,cpys)
    save_data(data)

def queue():
    sched = BlockingScheduler()
    sched.add_job(my_job,'cron', hour=23, minute=59, second=55);
    sched.start()


if __name__ == "__main__":

    # my_job()
    queue()




