# encoding=utf8
import sys
reload(sys)
sys.setdefaultencoding('utf8')

import time
import hashlib
import random
import requests
import json
from app.setting import *
from conf.err_msgs import err_msgs

class AuthCode(object):
    def send_msg(self, telephone):
        authcode = self.get_random()
        data = {
            'method': METHOD,
            'app_key': APPKEY,
            'timestamp': str(long(time.time() * 1000)),
            'format': 'json',
            'v': '2.0',
            'sign_method': 'md5',
            'sms_type': 'normal',
            'sms_free_sign_name': SIGN_NAME,
            'rec_num': telephone,
            'sms_template_code': TEMPLATE_CODE,
            'sms_param': TEMPLATE_PARAM % authcode
        }

        data['sign'] = self.build_sign(data)
        res = json.loads(requests.get(SMS_SEND_URL,params=data).text)
        if res.get('error_response'):
            sub_code = res['error_response'].get('sub_code')
            # 触发业务流控限制
            if sub_code == 'isv.BUSINESS_LIMIT_CONTROL':
                result = {
                    'result': False,
                    'msg': err_msgs['SMS_GET_FREQUENT']
                }
            else:
                result = {
                    'result': False,
                    'msg': res['error_response'].get('sub_msg')
                }
        else:
            result = {
                'result': True,
                'code': authcode
            }
        return result

    def build_sign(self,data):
        keys = sorted(data.keys())
        string = ''
        for key in keys:
            string += '%s%s' % (key,data[key])
        sign = self.md5('%s%s%s' % (SECRET,string,SECRET))
        return sign

    @staticmethod
    def md5(text):
        m = hashlib.md5()
        m.update(text)
        return m.hexdigest().upper()

    @staticmethod
    def get_random():
        numbers = '1234567890'
        return ''.join(random.sample(numbers,6))


if __name__ == '__main__':
    AuthCode().send_msg('13631217803')