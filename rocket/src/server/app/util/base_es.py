#coding:utf-8

__author__ = 'yudh'

from elasticsearch import *

from app import setting

class EsBase(object):
    def __init__(self):
        self.es = Elasticsearch(hosts=setting.ES_HOST)

    def create_index(self,index):
        body = {
            "settings":{
                "number_of_shards":4,
                "number_of_replicas":1,
                "analysis" : {
                    "analyzer" : {
                        "pinyin_analyzer" : {
                            "tokenizer" : "my_pinyin"
                        },
                        "whole_tokenizer": {
                            "type": "custom",
                            "tokenizer": "whole_tokenizer"
                        }
                    },
                    "tokenizer" : {
                        "my_pinyin" : {
                            "type" : "pinyin",
                            "first_letter" : "none",
                            "padding_char" : " "
                        },
                        "whole_tokenizer": {
                            "type": "pattern",
                            "group": 0,
                            "pattern": "(.*)"
                         }
                    }
                }
            },

            "mappings":{
                "article_opertor_log":{
                    "properties": {
                        "user_id": {
                            "type": "string",
                             "index": "not_analyzed"
                        },
                        "article_uuid": {
                            "type": "string",
                             "index": "not_analyzed"
                        },
                        "create_at": {
                            "index": "not_analyzed",
                            "type": "date",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "type":{
                            "type":"string",
                            "index": "not_analyzed"
                        },
                        "action":{
                            "type":"string",
                            "index": "not_analyzed"
                        },
                        "tag":{
                            "type":"string",
                            "index": "not_analyzed"
                        }
                    }
                },
                "article": {
                    "properties": {
                        "uuid": {
                            "type": "string",
                             "index": "not_analyzed"
                        },
                        "url": {
                            "type": "string",
                             "index": "not_analyzed"
                        },
                        "hostname": {
                            "type": "string",
                             "index": "not_analyzed"
                        },
                        "domain": {
                            "type": "string",
                             "index": "not_analyzed"
                        },
                        "link_title": {
                            "type": "string",
                            "analyzer":"ik_max_word",
                            "fields" : {
                              "title_pinyin" : {
                                "analyzer" : "pinyin_analyzer",
                                "type" : "string"
                              }
                            }
                        },
                        "content": {
                            "type": "string",
                            "analyzer":"ik_smart"
                        },
                        "slug": {
                            "type": "string",
                            "analyzer":"ik_smart"
                        },
                        "from": {
                            "type": "object",
                            "properties": {
                                "media": {
                                    "type": "string",
                                    "analyzer":"ik_smart"
                                },
                                "mid": {
                                    "index": "not_analyzed",
                                    "type": "string"
                                },
                                "tags":{
                                    "type": "string",
                                    "index": "not_analyzed"
                                },
                                "product_form": {
                                    "index": "not_analyzed",
                                    "type": "string"
                                },
                                "circulation_medium": {
                                    "index": "not_analyzed",
                                    "type": "string"
                                },
                                "influence": {
                                    "type": "long"
                                },
                                "create_way": {
                                    "index": "not_analyzed",
                                    "type": "string"
                                },
                                "platform": {
                                    "properties": {
                                        "name": {
                                            "index": "not_analyzed",
                                            "type": "string"
                                        },
                                        "mid": {
                                            "index": "not_analyzed",
                                            "type": "string"
                                        }
                                    }
                                }
                            }
                        },
                        "author":{
                             "type": "string"
                        },
                        "crawler_at": {
                            "index": "not_analyzed",
                            "type": "date",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "publish_at": {
                            "index": "not_analyzed",
                            "type": "date",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "delete_at":{
                            "index": "not_analyzed",
                            "type": "date",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "origin": {
                            "type":"object",
                            "properties": {
                                "url": {
                                    "type": "string",
                                     "index": "not_analyzed"
                                }
                            }
                        },
                        "emotion": {
                            "type": "object",
                            "properties": {
                                "positive": {
                                    "index": "not_analyzed",
                                    "type": "float"
                                },
                                "negative": {
                                    "index": "not_analyzed",
                                    "type": "float"
                                }
                            }
                        },
                        "title_sign": {
                            "index": "not_analyzed",
                            "type": "string"
                        },
                        "tags": {
                            "type": "string",
                            "index": "not_analyzed"
                        },
                        "result_tags": {
                            "type": "string",
                            "index": "not_analyzed"
                        },
                        "reship": {
                            "type": "long"
                        },
                        "reship_exactly": {
                            "type": "long"
                        },
                        "imgs": {
                            "type": "string",
                            "index": "not_analyzed"
                        }
                    }
                }
            }
        }
        res = self.es.indices.create(index=index,body=body,ignore=400)
        if res.get('status') == 400:
            return False
        return True

    def close_index(self, index):
        self.es.indices.close(index)

    def delete_index(self, index):
        try:
            self.es.indices.delete(index)
        except exceptions.NotFoundError:
            pass

if __name__ == '__main__':
    # EsBase().create_index('co_mi_3')
    EsBase().delete_index('co_mi_2')