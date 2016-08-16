#coding:utf-8

__author__ = 'commissar'


import traceback
from app.setting import getLogging
from app.util.dao_base import DaoBase
from app.db.model import RoleRules,Users
from sqlalchemy import and_

class RoleRulesDao(DaoBase):
    def __init__(self, **kwargs):
        super(RoleRulesDao, self).__init__(**kwargs)

    def get_role_rules(self,role):
        rules = self.session.query(RoleRules).filter(RoleRules.name == role).all()
        rule_list = [rule.rule for rule in rules]
        return rule_list

    def get_rules_by_roles(self,roles):
        '''
        根据角色去获取所有的权限。
        :param roles:   [list|string],角色组或角色名。
        :return:    [list]这些角色的权限列表。
        '''

        par_roles = roles
        if isinstance(roles,str):
            par_roles = [roles,]

        rules = self.session.query(RoleRules).filter(RoleRules.name.in_(par_roles)).all()

        rule_list = [rule.rule for rule in rules]
        return list(set(rule_list))



    def get_roles(self, role_group):
        '''
        根据角色组获取可供使用的角色。
        :param role_group:
        :return:
        '''

        like_str = "aaa%"
        if(role_group == Users.ROLE_MANAGER):
            like_str = "manager_%"
        elif role_group == Users.ROLE_VIEWER:
            like_str = "viewer_%"
        elif role_group == Users.ROLE_ADMIN:
            like_str = "admin_%"

        roles_info = []
        roles = self.session.query(RoleRules.title,RoleRules.name).filter(RoleRules.name.like(like_str)).distinct().all()
        for role in roles:
            role_info = {
                'title': role.title,
                'name': role.name
            }
            roles_info.append(role_info)
        return roles_info

    def get_roles_dict(self):
        roles_info = {}
        roles = self.session.query(RoleRules.title,RoleRules.name).distinct().all()
        for role in roles:
            roles_info[role.name] = role.title
        return roles_info
