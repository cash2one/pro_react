#coding:utf-8

__author__ = 'commissar'

from pyrestful import mediatypes
from pyrestful.rest import post
from app.db.dao.user_feedback import UserFeedbackDao
from app.db.dao.user_last_status import UserLastStatusDao
from app.util.base_handler import BaseHandler
from app.db.dao.redis_base import RedisBase
from app.util.base_rbac import token_require
from app import setting
from conf.err_msgs import err_msgs

class UserFeedbackHandler(BaseHandler):

    @post(_path='/api/v1/feedback',  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def upload_feedback(self):

        token = self.request.headers.get("user_token",None)
        redis = RedisBase()
        token_info = redis.get_token_info(token)

        user_id = token_info.get("uuid",None)
#        if not redis.is_fb_overtime(user_id):
        if True:
            content = self.get_argument("content",None)
            company_uuid = self.get_argument("company_uuid",None)
            typeid = self.get_argument("type", None)

            # 根据token查询用户最后状态表中的终端信息
            usr_status_db = UserLastStatusDao(session=self.session)
            platform = usr_status_db.get_from_by_token(token)

            self.logger.info("user_id:"+user_id+"  content:"+content+"  company_uuid:"+company_uuid+"  platform:"+platform)

            uf_db = UserFeedbackDao(session=self.session)
            if uf_db.insert_user_feedback(user_id,content,company_uuid,platform,typeid):
                # 限制用户两分钟内只允许发一条反馈
                redis.set_fb_restrict_key(user_id)
                redis.expire_fb_key(user_id)
                # 日志
                self.log_user_action(token_info.get("uuid"),"upload_feedback","-")

                result = {
                    "result": True
                }
                return result
        else:
            result = {
                "msg":err_msgs["QUERY_TOO_FAST"],
                "result": False
            }
            self.set_status(400)
            return result





