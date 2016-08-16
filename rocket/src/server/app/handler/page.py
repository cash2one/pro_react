# coding=utf-8

__author__ = 'commissar'

from app.util.base_handler import BaseHandler

from app.db.dao.settings import SettingsDao
import os.path
import tornado
from tornado.concurrent import run_on_executor
import hashlib
from concurrent.futures import ThreadPoolExecutor
import base64
from conf.err_msgs import *
from urlparse import urlparse,urljoin,urlunparse

class PageHandler(BaseHandler):
    '''
    此类将传入一个URL，将其转化成一张图片输出。
    请求路径为：/page/draw
    '''
    executor = ThreadPoolExecutor(4)        #此类为futures包中，如在python3.4中，则自带。

    '''
    此类用于将报表生成
    '''
    @tornado.gen.coroutine
    def get(self):
        refer = self.request.headers.get('Referer')
        token = self.request.headers.get("user_token",None)
        hostname = urlparse(refer).hostname

        url = 'http://%s/report_download?%s&user_token=%s'%(hostname,self.request.query,token)


        yield self.run_capser(url)

    @run_on_executor
    def run_capser(self,url):

        url_md5 = hashlib.md5(url).hexdigest()

        filename = 'test/'+url_md5 + '.png'
        cmd = "casperjs app/phantomjs/render_report.js --url='%s' --output='%s'" % (url, filename)

        self.logger.info(cmd)

        ret = os.system(cmd)

        if(os.path.exists(filename)):
            with open(filename, "rb") as f:
                self.set_header('Content-Type', 'image/png')
                self.write('data:image/png;base64,')
                self.write(base64.b64encode(f.read()))
            os.remove(filename)
            self.finish()
        else:
            raise tornado.web.HTTPError(404,u"The report file is not exist!")
        return



class WXCallBackHandler(BaseHandler):
    '''
    用于接收微信验证后的回调。
    '''
    def get(self):
        code = self.get_argument("code",None)
        state = self.get_argument("state",None)

        if state is not None :
            state_info = self.redis.get_state_info(state)
            if not state_info:#此状态码不存在。
                self.set_status(404,err_msgs['STATE_TIME_OUT'])
                self.finish()
            else:
                redirect_url = state_info.get("redirect_uri")
                (scheme, netloc, path, parameters, query, fragment) = urlparse(redirect_url)

                tmp_qry = "state=%s&code=%s"%(state,code)

                if(query != ""):
                    query = "%s&%s"%(query,tmp_qry)
                else:
                    query = tmp_qry

                end_url = urlunparse((scheme, netloc, path, parameters, query, fragment))

                self.redirect(end_url)
        else:
            self.set_status(400,err_msgs["PARAMS_MISSING"])
            self.finish()