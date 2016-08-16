#coding:utf-8

__author__ = 'commissar'

from app.util.dao_base import DaoBase
from app.db.model import Rules
import uuid
import traceback
from app.setting import getLogging
from sqlalchemy import and_

class RuleDao(DaoBase):
    def __init__(self, **kwargs):
        super(RuleDao, self).__init__(**kwargs)

    def get_rules(self):
        return self.session.query(Rules).filter(Rules.display == Rules.DISPLAY_ON).order_by(Rules.order).all()

    def get_rules_by_level(self,level,rules=None):
        '''
        根据等级获取一权限。此方法当前实现没有查询数据库。
        :param level:   [string]可选值为Rules.LV_开头的常量。
        :param rules:   [list]在指定权限集中过滤。如果为None，则代表是从所有中过滤。
        :return:    [list]权限列表。
        '''

        if level != Rules.LV_COMPANY and level != Rules.LV_SYNDICATE:
            return []

        cond = and_(Rules.level == level,True)

        if (rules is not None) and len(rules) > 0:
            cond = and_(Rules.level == level,Rules.name.in_(rules))

        rule_datas = self.session.query(Rules.name).filter(cond).all()

        ret_rules = [rule.name for rule in rule_datas]
        # for t_rule in rule_datas:
        #
        #     t_level = t_rule.get('level',Rules.LV_COMPANY)  #这里一定要与数据库定义一致。
        #     t_name = t_rule['name']
        #
        #     if(t_level == level):
        #         if(rules is None) or (len(rules) == 0):
        #             ret_rules.append(t_name)
        #
        #         else:
        #             if t_name in rules:
        #                 ret_rules.append(t_name)

        return ret_rules
