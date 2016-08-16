# -*-coding:utf-8-*-

__author__ = 'yudh'

import app.setting as settings
import redis
from app.setting import getLogging
import json
from datetime import *
from app.db.model import Users
from conf.err_msgs import token_status

class RedisBase(object):

    KEY_OP_ADD = 1
    KEY_OP_DEL = 0

    def __init__(self,**usr_conf):
        conf = {
            "host":settings.REDIS_IP,
            "port":settings.REDIS_PORT,
            "db"  :settings.REDIS_DB,
            #"password":settings.REDIS_PASSWORD

            }

        if isinstance(usr_conf,dict):
            conf.update(usr_conf)

        self.redis_con = redis.Redis(**conf)

    def expire(self,key,second):
        '''
        更新某个关键字的过期时间
        :param key: 关键字
        :param second: 多少秒后过期
        :return:
        '''
        self.redis_con.expire(key,second)

    def expireat(self, key, time=None):
        '''
        设置关键字的过期时间为一个具体的时间
        :param key: 关键字
        :param time: 时间(默认为当天最后一秒)
        :return:
        '''
        if not time:
            now = datetime.now()
            time = datetime(now.year,now.month,now.day,23,59,59)
        else:
            time = datetime.strptime(time,'%Y-%m-%d %H:%M:%S')
        self.redis_con.expireat(key,time)

    def set_value(self,key,value):
        '''
        设置某个关键字的值
        :param key: 关键字
        :param value: 值
        :return:
        '''
        self.redis_con.set(key,value)

    def set_state(self,state,redirect_uri,role):
        '''
        设置微信认证中state参数，并设置超时时间
        :param state:
        :param redirect_uri:
        :param role:
        :return:
        '''
        info = {
            'redirect_uri': redirect_uri,
            'role': role,
        }
        r_state = self.get_r_state(state)
        self.set_value(r_state,json.dumps(info))
        self.expire(r_state,settings.STATE_EXPIRE_TIME)

    def get_state_info(self,state):
        '''
        从state中获取redirect_uri和role信息
        :param state:
        :return:
        '''
        r_state = self.get_r_state(state)
        info = self.get_value(r_state)
        if info:
            return json.loads(info)
        else:
            return None

    def get_r_state(self,state):
        '''
        加上state_前缀
        :param state: state
        :return:
        '''
        return settings.STATE_STR + state

    def get_value(self,key):
        '''
        获取某个关键字的值
        :param tel: 电话
        :return: [str] 验证码
        '''
        return self.redis_con.get(key)

    def del_key(self,key):
        '''
        删除关键字
        :param tel: 电话
        :return:
        '''
        self.redis_con.delete(key)

    def exists_key(self,key):
        '''
        某个关键字是否存在
        :param key: 关键字
        :return:
        '''
        return self.redis_con.exists(key)

    def error_num_over(self,tel):
        '''
        判断该用户连续输入验证码错误次数是否到5次
        :param tel: 电话
        :return: True|False (True表示连续出错已达5次)
        '''
        key = settings.ERROR_NUM_STR + tel
        error_num = self.get_value(key)
        if error_num:
            error_num = int(error_num)
            self.set_value(key,error_num+1)
            self.expireat(key)
        else:
            self.set_value(key,1)
            self.expireat(key)
        if error_num < settings.CAPTCHA_ERR_LIMIT_NUM:
            return False
        return True

    def captcha_num_over(self,tel):
        '''
        检查该用户验证码次数是否达到上限
        :param tel:
        :return:
        '''
        key = settings.CAPTCHA_NUM_STR + tel
        captcha_num = self.get_value(key)
        if captcha_num:
            captcha_num = int(captcha_num)
            ttl = self.redis_con.ttl(key)
            self.set_value(key, captcha_num+1)
            self.expire(key,ttl)
        else:
            self.set_value(key, 1)
            self.expire(key,settings.CAPTCHA_GET_LIMIT_TIME)
        if captcha_num < settings.CAPTCHA_GET_LIMIT_NUM:
            return False
        return True

    def get_token_info(self,token):
        '''
        返回token中的信息
        :param token:
        :return:
        '''
        r_token = self.get_r_token(token)
        token_info = self.get_value(r_token)
        if token_info:
            return json.loads(token_info)
        else:
            return None

    def exists_token(self,token):
        '''
        检查token是否存在
        :param token:
        :return:
        '''
        r_token = self.get_r_token(token)
        return self.redis_con.exists(r_token)

    def expire_token(self,token,platform='web'):
        '''
        重置token的过期时间
        :param token:
        :return:
        '''
        r_token = self.get_r_token(token)
        token_info = self.get_value(r_token)
        expire_time = json.loads(token_info).get('expire_time')
        self.expire(r_token, expire_time)

    def set_token(self,token,token_info,ok=True,platform='web'):
        '''
        设置token
        :param token:
        :return:
        '''
        r_token = self.get_r_token(token)
        self.set_value(r_token, token_info)
        expire_time = json.loads(token_info).get('expire_time')
        if ok:
            self.expire(r_token, expire_time)
        else:
            self.expire(r_token, settings.KICKED_EXPIRE_TIME)

    def set_ticket(self,key,value,expire_time):
        """
        票据超时时间
        :param key:
        :param value:
        :param expire_time:
        :return:
        """
        self.set_value(key,value)
        self.expire(key,expire_time)

    def get_r_token(self, token):
        return settings.TOKEN_STR + token

    def get_all_tokens(self):
        return self.redis_con.keys(settings.TOKEN_STR+'*')


    def user_change(self,user_id, change_code, role_group):
        '''
        某用户发生了变化，需要通知其他终端。
        :param user_id:
        :param change_code:     为变化代码，值见token_status常量定义
        :param role 用户角色
        :return:
        '''

        # 查询token，更改状态
        tokens = self.get_all_tokens()
        for r_token in tokens:
            t_info = json.loads(self.get_value(r_token))
            # 找到对应的用户
            if t_info.get('role_group') == role_group and t_info.get('uuid') == user_id:
                t_info['status'] = {
                    'code': change_code,
                    'msg': token_status[change_code]['msg']
                }
                self.set_value(r_token,json.dumps(t_info))
                self.expire(r_token,settings.KICKED_EXPIRE_TIME)

    def del_company(self, uuid, company_uuid):
        '''
        删除公司发送的消息
        :param company_uuid:
        :return:
        '''
        logger = getLogging()
        try:
            msg = {
                "creator_id": uuid,
                "action": "delete",
                "object": "company",
                "value": company_uuid,
                "extra": ""
            }
            channel = "mod_home"
            send_str = json.dumps(msg)
            self.redis_con.publish(channel,send_str)
        except Exception,e:
            logger.exception(str(e))

    def key_change(self, operator, data):
        '''
        指定某个关键字发生了变化时发送的消息。
        :param operator:    [int]增加或删除，值见KEY_OP_开头常量
        :param data:        [str]关键字名。
        :return:
        '''

        logger = getLogging()
        try:
            msg = {
                "action": "add" if operator == RedisBase.KEY_OP_ADD else "del",
                "data":data
            }

            channel = "keyword"

            send_str = json.dumps(msg)

            self.redis_con.publish(channel,send_str)
        except Exception,e:
            logger.exception(str(e))


    def key_listen(self):
        ps = self.redis_con.pubsub()
        ps.subscribe(["keyword",])  #订阅一个频道，"keywords"
        for item in ps.listen():
            yield item

    def is_fb_overtime(self,user_id):
        '''
        反馈限制是否超时
        :param user_id:
        :return:
        '''
        return self.redis_con.exists(settings.FEEDBACK_STR+user_id)

    def set_fb_restrict_key(self,user_id):
        '''
        存入反馈限制key
        :param user_id:
        :return:
        '''
        self.set_value(settings.FEEDBACK_STR+user_id,user_id)

    def expire_fb_key(self,user_id):
        '''
        使反馈限制key超时
        :param user_id:
        :return:
        '''
        self.expire(settings.FEEDBACK_STR+user_id,settings.FEEDBACK_EXPIRE_TIME)



if __name__ == '__main__':
    print RedisBase().get_all_tokens()