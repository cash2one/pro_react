#coding:utf-8

__author__ = 'commissar'

from pyrestful import mediatypes
from pyrestful.rest import get, post, put, delete
from app.util.base_handler import BaseHandler
from app.util.html_parser import strip_tags
from app import setting
from app.util.base_rbac import token_require,rule_require
from app.db.dao.es_article import EsArticle,cat_map
from conf.err_msgs import *
import json

class AdminArticlesHandler(BaseHandler):

    @get(_path='/api/v1/article/{uuid}', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_article')
    def article(self,uuid):
        article_info = EsArticle().get_by_index_and_uuid(uuid)
        print article_info
        result = {}
        if article_info:
            result.update({
                "result": True,
                "article_info": article_info
            })
        else:
            result.update({
                "result": False,
                "msg": err_msgs['ARTICLE_NOT_FOUND']
            })

        return result

    @get(_path='/api/v1/article', _produces=mediatypes.APPLICATION_JSON)
    @rule_require('rule_sys_manager_article')
    def article_list(self):
        search_field = self.get_argument("search[search_field]","")
        search_content = self.get_argument("search[search_content]","")
        order = self.get_argument("search[order]","")
        date_range = self.get_argument("search[date_range]","")
        product_form = self.get_argument("search[from.product_form]","")
        platform = self.get_argument("search[from.platform.name]","")
        media = self.get_argument("search[from.mid]","")
        circulation_medium = self.get_argument("search[from.circulation_medium]","")
        create_way = self.get_argument("search[from.create_way]","")
        result_tags_emotion = self.get_argument("search[result_tags_emotion]","")
        result_tags_warn = self.get_argument("search[result_tags_warn]","")
        influence = self.get_argument("search[from.influence]","")
        beg = self.get_argument("beg",None)
        count = self.get_argument("count",None)
        search_data = {
            "search_field": search_field,
            "search_content": search_content,
            "order": order,
            "date_range": date_range,
            "from.product_form": product_form,
            "from.mid": media,
            "from.platform.name": platform,
            "from.circulation_medium": circulation_medium,
            "from.create_way": create_way,
            "result_tags_emotion": result_tags_emotion,
            "result_tags_warn": result_tags_warn,
            "from.influence": influence
        }
        res = EsArticle().get_article_list(search_data,beg,count)
        # 处理查询的结果集
        if res.get("hits").get("total") != 0:
            for data in res.get("hits").get("hits"):
                data['_source']['content'] = strip_tags(data['_source']['content'])
                if data['_source']['emotion']['positive'] > 0.5:
                    data['_source']['emotion'] = "正面"
                elif data['_source']['emotion']['positive'] == 0.5:
                    data['_source']['emotion'] = "中性"
                else:
                    data['_source']['emotion'] = "负面"
                if data['_source']['imgs']:
                    data['_source']['imgs'] = data['_source']['imgs'][0]
                #  高亮
                if data.get("highlight"):
                    for key in data["highlight"]:
                        data["_source"].update({key:strip_tags(data["highlight"][key][0])})
            aggs = []
            for k,v in res.get("aggregations").items():
                if v.get("buckets"):
                    agg = {}
                    values = []
                    agg.update(cat_name=k,cat_title=cat_map.get(k))
                    if k == "from.mid":
                        for key in v.get("buckets"):
                            if key.get("key"):
                                values.append(key.get("key"))
                        values = EsArticle().get_media_names_by_mids(values)
                    else:
                        for key in v.get("buckets"):
                            if key.get("key"):
                                values.append({"k": key.get("key"),"v": key.get("key")})

                    agg.update(items=values)
                    aggs.append(agg)
                    res.update(aggregations=aggs)
        return res
