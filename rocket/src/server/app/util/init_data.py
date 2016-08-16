#coding:utf-8

__author__ = 'commissar'

from  app.db.model import *
from app.util.base_db import get_session

def init_settings():
    '''
    初始化setting表中的数据。
    :return:
    '''

    data = []

    for item in Settings.data:
        data.append(Settings(name=item['name'], value=item['value'], type=item['type'], company_uuid=item['company_uuid'],creator_id=item['creator_id']))

    session = get_session()
    session.add_all(data)
    session.commit()

def init_rules():
    '''
    初始化rules表中的数据。
    :return:
    '''

    data = []

    idx = 0
    for item in Rules.data:
        idx = idx + 1
        display = item.get("display",Rules.DISPLAY_ON)

        temp_data = Rules(name=item['name'], title=item['title'], link=item['link'], parent=item['parent'], module = item['module'], order = idx, display=display)
        temp_data.level = item.get('level',Rules.LV_COMPANY)
        data.append(temp_data)

    session = get_session()
    session.add_all(data)
    session.commit()


def init_roles():
    '''
    初始化角色表。
    :return:
    '''

    data = []
    for item in RoleRules.data:
        for rule in item["rules"]:
            data.append(RoleRules(name=item["name"], title=item["title"],rule=rule,creator_id='system'))

    session = get_session()
    session.add_all(data)
    session.commit()