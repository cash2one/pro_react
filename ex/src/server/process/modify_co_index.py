#!/usr/bin/env python
# -*- coding:utf-8 -*-

import urllib2
import re
import json

IPAddress = 'http://120.76.74.21:9200'

def http_get():
    url=IPAddress+'/_cat/indices'   #页面的地址
    response = urllib2.urlopen(url)         #调用urllib2向服务器发送get请求
    return response.read()                     #获取服务器返回的页面信息
 
#将co中的各个索引字段添加到post路径中，提交更改map的json文件
def http_post(url):
    values =  {'properties': {'imgs': {'index': 'not_analyzed',  'type': 'string' },'reship': {'type': 'long'}}}
    jdata = json.dumps(values)             # 对数据进行JSON格式化编码
    req = urllib2.Request(url, jdata)       # 生成页面请求的完整数据
    response = urllib2.urlopen(req)       # 发送页面请求
    return response.read()                    # 获取服务器返回的页面信息
 
 
if __name__ == "__main__":
    ret = http_get()#返回路径中的所有索引名

    #正则表达式匹配索引名，添加到list
    co_indexs = []
    IndexsName = ret.split() 
    
    print '匹配到的索引名：'
    for st in IndexsName:
        pattern  = re.compile(r"co_.|articles*")
        match = pattern.match(st)
        if match:
            co_indexs.append(st)
            print st+'\t',
    print 
    
    print '路径和对应的返回结果：'
    for items in co_indexs:
        post_url = IPAddress+'/'+items+'/_mapping/article'
        print post_url
        post_response = http_post(post_url)
        print post_response


