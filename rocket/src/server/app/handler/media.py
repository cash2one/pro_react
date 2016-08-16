#coding:utf-8

__author__ = 'commissar'

import json
import random
from app import setting
from elasticsearch import *
from pyrestful import mediatypes
from pyrestful.rest import get, post, put, delete
import os.path
from app.util.base_handler import BaseHandler
from app.db.dao.es_media import EsMedia
from app.util.base_rbac import token_require,rule_require
from app.db.dao.settings import SettingsDao
import tornado
from tornado.concurrent import run_on_executor
import hashlib
from concurrent.futures import ThreadPoolExecutor
import base64
from conf.err_msgs import *
from urlparse import urlparse,urljoin,urlunparse

class MediaHandler(BaseHandler):
    @get(_path='/api/v1/media/search', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_media_audit')
    def media_search(self):
        query = self.get_argument("query", "")
        page = self.get_argument("page", 0)
        platform = self.get_argument("platform", "")
        create_way = self.get_argument("create_way", "")
        product_form = self.get_argument("product_form", "")
        circulation_medium = self.get_argument("circulation_medium", "")
        search_all = self.get_argument("search_all", "false")
        start_time = self.get_argument("start_time", "")#时间格式为yyyy-mm-dd
        end_time = self.get_argument("end_time", "")#截止时间应大于起始时间

        es = EsMedia()
        source_list = []

        if search_all == "true":
            body_json = {"query":{
                                "match_all":{}
                         }}
            res = es.search_for_media(body_json)
            result = {
                "result": True,
                "media": res['hits']['hits'],
                "count": res['hits']['total']
            }
            return result

        bool_json = es.get_bool_json_for_search(query,platform,create_way,product_form,circulation_medium,start_time,end_time)

        #按页查询
        res = es.search_by_page(20, bool_json, page)
        media_info = res['hits']['hits'];

        for media in media_info:
            source_list.append(media["_source"])

        result = {
            "result": True,
            "media": source_list,
            "count": res['hits']['total']
        }
        return result


    @put(_path='/api/v1/media/edit_media', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_media_audit')
    def adddd_media(self):
        code = self.get_argument("code", "")
        mid = self.get_argument("mid", "")
        name = self.get_argument("name", "")
        tags = self.get_arguments("tags[]")
        url = self.get_argument("url", "")
        create_way = self.get_argument("create_way", "")
        influence = self.get_argument("influence", "")
        rank = self.get_argument("rank", "")
        crawler_at = self.get_argument("crawler_at", "")
        crawler_status = self.get_argument("crawler_status", "")
        platform_name = self.get_argument("platform_name", "")
        platform_mid = self.get_argument("platform_mid", "")
        auth = self.get_argument("auth", "")
        channel = self.get_arguments("channel[]")
        avater = self.get_argument("avater", "")
        desc = self.get_argument("desc", "")
        product_form = self.get_argument("product_form", "")
        circulation_medium = self.get_argument("circulation_medium", "")

        es = EsMedia()
        media_body = {
                        "code": code,
                        "name": name,
                        "tags": tags,
                        "url": url,
                        "create_way": create_way,
                        "influence": influence,
                        "mid": mid,
                        "rank": rank,
                        "crawler": {
                            "crawler_at": crawler_at,
                            "crawler_status": crawler_status
                        },
                        "platform": {
                            "name": platform_name,
                            "mid": platform_mid
                        },
                        "auth": auth,
                        "channel": channel,
                        "avater": avater,
                        "desc": desc,
                        "product_form": product_form,
                        "circulation_medium": circulation_medium
                    }

        res = es.delete_for_media(mid)
        if res["_shards"]["successful"] == 1:
            res = es.create_for_media(media_body)

        result = {
            "result": True,
            "response": res
        }

        return result

    @delete(_path='/api/v1/media/del_media', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_media_audit')
    def delete_media(self):
        mid = self.get_argument("mid", "")
        es = EsMedia()
        res = es.delete_for_media(mid)
        result = {
            "result": True,
            "response": res
        }
        return result