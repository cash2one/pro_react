#coding:utf-8

__author__ = 'commissar'

from pyrestful import mediatypes
from pyrestful.rest import get
from app.db.dao.rules import RuleDao
from app.util.base_handler import BaseHandler

from app.db.dao.settings import SettingsDao
import os.path
from app.util.base_rbac import rule_require,token_require


class RulesHandler(BaseHandler):

    @get(_path='/api/v1/rules',  _produces=mediatypes.APPLICATION_JSON)
    @token_require
    def get_all_rules(self):

        set_db = SettingsDao(session=self.session)
        mod_path = set_db.get_modal_base_path()

        rule_db = RuleDao(session=self.session)
        rule_list = rule_db.get_rules()

        # 日志
        self.log_user_action(self.get_token().get("uuid"),"get_all_rules","-")

        results = []
        for rule in rule_list:
            result = {}
            result['name'] = rule.name
            result['title'] = rule.title
            result['parent'] = rule.parent
            result['link'] = rule.link
            # if(mod_path.has_key(rule.module)):
            #     result['link'] = "http://"+ mod_path[rule.module] + rule.link


            results.append(result)

        return results

