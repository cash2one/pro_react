#coding:utf-8

__author__ = 'commissar'

# import app.setting
import tornado
import pyrestful.rest
from tornado.options import define, options
import logging.handlers
import logging.config

from app.setting import *
from app.handler import *
from app.util.rocket_logging_one_line import OneLineExceptionFormatter


define('port', default=18623, help='Run server on a specific port', type=int)
define('debug',default=True,  help='Use debug settings for test purpose', type=bool)
options.parse_command_line()


rest_handlers = [
    user.UserHandler,
    company.CompanyHandler,
    rules.RulesHandler,
    login.LoginHandler,
    setting.SettingHandler,
    user_feedback.UserFeedbackHandler,
    admin_articles.AdminArticlesHandler,
    media.MediaHandler,
    ]

handlers = [
    (r'/api/v1/report/png',page.PageHandler),
    (r'/wx.html',page.WXCallBackHandler)
]



def main(wsgi=True):
    logging.config.fileConfig('conf/log.conf')
    logger = getLogging()
    # 将错误信息一行输出的配置
    trfh = logging.handlers.TimedRotatingFileHandler('./log/rocket_raccoon_log_err_oneline', 'midnight')
    f = OneLineExceptionFormatter('[%(asctime)s-%(name)s(%(levelname)s)%(filename)s:%(lineno)d]%(message)s')
    trfh.setFormatter(f)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(trfh)

    if wsgi:
        pass
        #from flup.server.fcgi_fork import WSGIServer
        # application = tornado.wsgi.WSGIApplication(routes)
        #application = pyrestful.rest.WSGIRestService(handlers)
        #logger.info('api server start at %d' % options.port)
        #WSGIServer(application=application, bindAddress=('', options.port)).run()
    else:
        # 客户端异常-4开头状态码的traceback信息是否打印
        settings = {
            # "serve_traceback":True,
        }
        # application = tornado.web.Application(routes)
        application = pyrestful.rest.RestService(rest_handlers = rest_handlers, handlers=handlers,**settings)
        application.listen(options.port)
        logger.info('api server start at %d' % options.port)
        tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
    main(not options.debug)