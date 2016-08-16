#coding:utf-8

__author__ = 'yudh'

from elasticsearch import *

from app import setting
from app.util.dao_base import DaoBase
from app.util.datetime_util import *
from app.db.dao.company import CompanyDao
import json

cat_map = {
    "from.product_form": "产品分类",
    "from.platform.name": "托管平台",
    "from.mid": "媒体名称",
    "from.circulation_medium": "媒体分类",
    "from.create_way": "生产方式",
    "from.influence": "媒体等级",
    "result_tags_emotion": "情感筛选",
    "result_tags_warn": "预警状态",
}

class EsArticle(object):
    def __init__(self):
        self.es = Elasticsearch(hosts=setting.ES_HOST)

    def get_by_index_and_uuid(self,uuid):
        """
        通过index和uuid查询文章
        :param uuid: str|文章的uuid
        :return: dict{}|文章详情
        """
        body = {
            "query":{
                "term":{"uuid": uuid}
            }
        }
        article_info = {}
        res = self.es.search("*",body=body,ignore=[400, 404])
        if not res.get("status") and res.get("hits").get("total") != 0:
            related_coms = []
            for article in res.get("hits").get("hits"):
                related_coms.append(article.get("_index"))
            article_info = res.get("hits").get("hits")[0]
            print article_info
            article_info.update(related_coms=related_coms)
            if float(article_info.get("_source").get("emotion").get("positive")) > 0.5:
                article_info.get("_source").update(emotion="正面")
            elif float(article_info.get("_source").get("emotion").get("positive")) == 0.5:
                article_info.get("_source").update(emotion="中性")
            else:
                article_info.get("_source").update(emotion="负面")

        return article_info

    # 查找mid对应的media名称
    def get_media_names_by_mids(self,mids):
        body = {
          "query": {
            "terms": {
              "mid": mids
            }
          }
        }
        res = self.es.search(setting.GLOBAL_INDEX_MEDIA,body=json.dumps(body),doc_type='media',ignore=[400, 404])
        media_names = []
        if not res.get("status") and res.get("hits").get("total") != 0:
            for media in res.get("hits").get("hits"):
                media_names.append({"k":media.get("_source").get("name"),"v":media.get("_source").get("mid")})
        return media_names

    # 注意,文章的搜索,全文搜索和标题搜索是分开的:全文是文章内容,标题是标题
    def get_article_list(self,search_data,beg=0,count=10,sort="publish_at"):
        body = {"from": beg, "size": count, "sort": {sort:{"order": search_data.get("order") if search_data.get("order") else "desc"}}}
        if search_data['search_field'] and search_data['search_content']:
            body.update(highlight={
                "pre_tags": [
                  "<em class='search'>"
                ],
                "post_tags": [
                  "</em>"
                ],
                "fields": {
                  search_data['search_field']: {}
                }
            })
        names = cat_map.keys()
        aggs_names,search_names,tags = split_name_list(search_data,names)
        filtered = {}
        querys = {}
        filters = {}
        aggs=aggs_con(aggs_names)
        if search_data and search_data.get("date_range"):
            from_date = str_to_datetime(search_data["date_range"].split(" - ")[0],"%m/%d/%Y").strftime('%Y-%m-%d %H:%M:%S')
            to_date = str_to_datetime(search_data["date_range"].split(" - ")[1],"%m/%d/%Y").strftime('%Y-%m-%d 23:59:59')
            filters.update(range={
                sort : {
                    "from" : from_date,
                    "to" : to_date
                }
            })
        bool_cond = get_bool_cond(search_data,search_names,type="must")
        if bool_cond:
            querys.update(bool=bool_cond)
        if querys:
            filtered.update(query=querys)
        if filters:
            filtered.update(filter=filters)
        if filtered:
            body.update(query={"filtered":filtered})
        if aggs:
            body.update(aggs=aggs)
        print json.dumps(body)
        res = self.es.search(setting.GLOBAL_INDEX_ARTICLE,body=json.dumps(body),doc_type='article',ignore=[400, 404])
        res.update(tags=tags)
        return res

# 分割列表
def split_name_list(search_data,names):
    search_names = []
    tags = []
    for key in search_data.keys():
        if key in names and search_data[key]:
            tags.append({"tag_title":cat_map[key],"tag_name":key,"tag_k":search_data[key].split("|")[1],"tag_v":search_data[key].split("|")[0]})
            search_names.append(key)
            names.remove(key)
    return names,search_names,tags

# 组装聚合条件
def aggs_con(names):
    aggs = {}
    for name in names:
        if name == "from.influence":
            aggs.update({name:{
                "range":{
                    "field": name,
                    "ranges": [{ "from" : 1, "to" : 1000 },{ "from" : 1000, "to" : 10000 },{ "from" : 10000, "to" : 200000 },{ "from" : 200000}]
                }
            }})
        elif "result_tags" in name:
            type = name.split("_")[2]
            if type == "emotion":
                include = "_emo_.*"
            elif type == "warn":
                include = "_warn_.*"
            aggs.update({name:{
                "terms":{
                    "field": "result_tags",
                    "include": include if include else ".*",
                    "size": 20
                }
            }})
        else:
            aggs.update({name:{
                "terms":{
                    "field": name,
                    "size": 20
                }
            }})
    return aggs

# 影响力范围
def get_range(rank):
    if rank.split("-")[1] == "*":
        return float(rank.split("-")[0]),None
    else:
        return float(rank.split("-")[0]),float(rank.split("-")[1])

# 获取逻辑运算条件
def get_bool_cond(search_data,fields,type="must"):
    bool_cond = []
    if search_data["search_field"] and search_data["search_content"]:
        bool_cond.append({"match":{search_data["search_field"]: search_data["search_content"]}})
    for field in fields:
        if search_data[field]:
            if field != "from.influence":
                if "result_tags" in field:
                    bool_cond.append({"term":{"result_tags": search_data[field].split("|")[0]}})
                else:
                    bool_cond.append({"term":{field: search_data[field].split("|")[0]}})
            else:
                lower,upper = get_range(search_data[field].split("|")[0])
                if upper is not None:
                    bool_cond.append({"range":{field:{"from":lower,"to":upper}}})
                else:
                    bool_cond.append({"range":{field:{"from":lower}}})

    if bool_cond:
        return {type:bool_cond}
    else:
        return None

