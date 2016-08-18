# -*-coding:utf-8-*-
import redis
import util.settings
import json
from util.db import DBConnection,cur_date_str,cur_day_str



def listen_redis():
    rc = redis.Redis(host=util.settings.REDIS_HOST)
    ps = rc.pubsub()
    ps.subscribe([util.settings.CHANNEL])

    print 'listen on '+util.settings.REDIS_HOST+':'+util.settings.CHANNEL
    for item in ps.listen():

        if item['type'] == 'message':
            print item['data']
            data = json.loads(item['data'])
            action = data['action']

            if action == 'delete' and data['object'] == 'company':
                print data['value']
                del_company(data['value'])
            else:
                print 'not company'



def del_company(company_uuid):
    db = DBConnection()
    cond = [("company_uuid",company_uuid)]

    print cond
    cp_row = db.del_data('company_keywords', cond)
    cat_row = db.del_data('category', cond)
    mid_row = db.del_data('company_medias', cond)
    print cp_row


if __name__ == "__main__":
    listen_redis()