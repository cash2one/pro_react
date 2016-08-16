#coding:utf-8

__author__ = 'commissar'

from elasticsearch import *

from app import setting

class EsMedia(object):
    def __init__(self):
        self.es = Elasticsearch(hosts=setting.ES_HOST)

    #(按页)查询媒体，需自定义查询结构
    def search_by_page(self, size=20, bool_json={}, page=None, index="medias", doc_type="media"):

        body_json = {
             'size': size,
             "query": {
                "bool": bool_json
             }
        }
        if page:
            body_json.update({'from': int(page) * size})
        res = self.es.search(index=index,
                             doc_type=doc_type,
                             body=body_json
        )
        return res

    #根据查询参数是否为空得到查询结构
    def get_bool_json_for_search(self,query,platform="",create_way="",product_form="",circulation_medium="",start_time="",end_time=""):
        bool_json = {
            "must": [],
            "should": [
                {"match": {"desc": query}},
                {"match": {"name": query}},
                {"match": {"tags": query}}
            ],
            "minimum_should_match": 1

        }

        if platform:
            bool_json['must'].append({"match": {"platform.name": platform}})
        if create_way:
            bool_json['must'].append({"match": {"create_way": create_way}})
        if product_form:
            bool_json['must'].append({"match": {"product_form": product_form}})
        if circulation_medium:
            bool_json['must'].append({"match": {"circulation_medium": circulation_medium}})
        if start_time and end_time:
            start_time = start_time + " 00:00:00"
            end_time = end_time + " 00:00:00"
            bool_json['must'].append({ "range": { "crawler.crawler_at":{ "gte":start_time,
                                                                         "lt":end_time} }})

        return bool_json

    def search_for_media(self, body_json={}, index="medias", doc_type="media"):
        res = self.es.search(index="medias",
                             doc_type="media",
                             body=body_json
                             )
        return res

    def delete_for_media(self, mid="", index="medias", doc_type="media"):
        res = self.es.delete(index="medias",
                        doc_type="media",
                        id=mid
                        )
        return res

    def create_for_media(self, body_json={}, index="medias", doc_type="media"):
        res = self.es.create(index="medias",
                             doc_type="media",
                             id=body_json['mid'],
                             body=body_json
                             )
        return res