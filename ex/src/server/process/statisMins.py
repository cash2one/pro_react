# -*-coding:utf-8-*-

import commen
from apscheduler.schedulers.blocking import BlockingScheduler
import logging
logging.basicConfig()
# import pycurl
import urllib
import StringIO
import re
import json
from util.db import DBConnection,cur_date_str,cur_day_str,date_to_str
import util.settings
import time
import threading
import datetime
import requests
from elasticsearch import Elasticsearch

interval = 5

def get_day_article_count(urls):
    cons = {"from" : "now-1d"}
    cpys = commen.get_cpys()
    return get_article_count(urls,cpys,cons)

def get_min_article_count(urls,cpys):
    # cons = {"from" : "now-5m"}
    now = datetime.datetime.now()
    rg = now + datetime.timedelta(minutes=-interval)
    cons = {"from":cur_day_str()+' 00:00:00'}
    return get_article_count(urls,cpys,cons)

def get_emotion_article_count(urls,cpys):
    # cons = {"from" : "now-5m"}
    now = datetime.datetime.now()
    rg = now + datetime.timedelta(minutes=-interval)
    # cons = {"from" : date_to_str(rg)}
    # cons = {"gt" : date_to_str(rg),"lte" : date_to_str(now)}
    cons = {"from":cur_day_str()+' 00:00:00'}
    return get_em_article_count(urls,cpys,cons)

def get_article_count(urls,cpys,cons):
    artCnt = {}
    es = Elasticsearch()
    for index in range(len(urls)):
        cp_index = cpys[index]
        url = urls[index]
        mids = {}
        for mid in util.settings.TOP_CAT:
            # b = StringIO.StringIO()
            # ch.setopt(pycurl.WRITEFUNCTION, b.write)
            post_data_dic = {
                "filter" : {
                "and" : [
                        {
                            "range" : {
                                "crawler_at" : cons
                            }

                        },
                        {
                            "term" : {"from.tags":mid}
                        }
                    ]
                }
            }

            r = requests.post(url, data = json.dumps(post_data_dic)).text
            res = json.loads(r)
            print  res
            mids[mid] = res["count"]

        artCnt[cp_index] = mids

    print artCnt
    return  artCnt

def get_em_article_count(urls,cpys,cons):
    artCnt = {}
    for index in range(len(urls)):
        cp_index = cpys[index]
        url = urls[index]
        print url
        ems = {}
        for em in util.settings.EMOTIONS:
            post_data_dic = {
                "filter" : {
                "and" : [
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

            r = requests.post(url, data = json.dumps(post_data_dic)).text
            res = json.loads(r)
            print  res
            ems[em] = res["count"]
            # return  artCnt
        artCnt[cp_index] = ems

    print artCnt
    return  artCnt


def saveMinData(mid_data,em_data):
    db = DBConnection()
    for cpIndex,val in mid_data.items():
        art_cnt = 0
        data = []
        n_item = {}
        for mid,cnt in val.items():
            mid_name = mid[5:]+'_cnt'
            n_item[mid_name] = cnt

        for em,cnt in em_data[cpIndex].items():
            if em == '_warn_':
                n_item['warn_cnt'] = cnt
            else:
                em_name = em[5:]+'_cnt'
                n_item[em_name] = cnt

        n_item['company_uuid'] = cpIndex
        n_item['create_at'] = cur_date_str()


        data.append(n_item)
        row = db.add_datas('statis_min', data)
        print row

def saveDayData(data):
    db = DBConnection()
    for cpIndex,val in data.items():
        art_cnt = 0

        for mid,cnt in val.items():
            n_data = []
            n_item = {}
            n_item = {
                "type" : 5,
                "st_id": cpIndex,
                "name": mid[5:]+'_cnt',
                'value':cnt,
                'record_at':cur_day_str(),
                'update_at':cur_date_str()
            }
            n_data.append(n_item)
            row = db.add_datas('statis_day', n_data)
            print row



def min_job():
    cpys = commen.get_cpys()
    urls = commen.get_urls(cpys)
    mid_data = get_min_article_count(urls,cpys)
    em_data = get_emotion_article_count(urls,cpys)

    saveMinData(mid_data,em_data)

def day_job():
    cpys = commen.get_cpys()
    urls = commen.get_urls(cpys)
    data = get_day_article_count(urls)
    saveDayData(data)


def queue():
    sched = BlockingScheduler()
    sched.add_job(min_job, 'interval', minutes=interval)
    sched.add_job(day_job,'cron', hour=23, minute=59, second=55);
    sched.start()



if __name__ == "__main__":
    queue()

