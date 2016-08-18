
import logging
logging.basicConfig()
import json
import requests

from commen import get_cpys

base_article_url = 'http://192.168.1.202:9200/%s/article/%s?pretty'
base_search_url = 'http://192.168.1.202:9200/%s/_search?pretty'


def get_alert_article(index, article_uuid):
    res = requests.get(base_article_url % (index, article_uuid)).text
    return json.loads(res)


def get_articles_by_index(index, beg, end):
    post_data_dic = {
         "filter" : {
            "and" : [
                {
                    "range" : {
                        "crawler_at" : {
                            "from" : beg,
                            "to" : end
                        }
                    }
                },
                {
                    "term" : { "result_tags":"_warn_"}
                }
            ]
        }
    }

    strs = requests.post(base_search_url % index, data=json.dumps(post_data_dic)).text
    res = json.loads(strs)
    articles = []
    for hit in res['hits']['hits']:
        articles.append(hit['_id'])
    return articles


def get_warning_articles(beg_time, end_time):
    indexs = get_cpys()
    warnings = {}
    for index in indexs:
        company_uuid = get_company_uuid_by_index(index)
        warnings[company_uuid] = get_articles_by_index(index, beg_time, end_time)
    return warnings


def get_company_uuid_by_index(index):
    return index.split('_')[2]

if __name__ == "__main__":
    # get_alert_article('co_mi_xiaomitv','632488e0-fd70-11e5-aa6f-00163e000e01')
    print get_warning_articles('2016-04-01 00:00:00','2016-04-22 23:59:59')