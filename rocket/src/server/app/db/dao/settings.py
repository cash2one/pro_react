#coding:utf-8

__author__ = 'commissar'

from app.util.dao_base import DaoBase
from app.db.model import Settings
from app.setting import *
from app.db.model import UserConf
import traceback
from app.setting import getLogging
from sqlalchemy import and_,or_

class SettingsDao(DaoBase):
    def __init__(self, **kwargs):
        super(SettingsDao, self).__init__(**kwargs)


    def get_modal_base_path(self):
        '''
        获取模块的基础路径
        :return:{
                mode_name:base_path,
            }
        '''
        rows = self.session.query(Settings.name, Settings.value).filter(Settings.name.like("mod_%")).all()

        ret = {}

        for item in rows:
            ret[item.name] = item.value
        return ret

    def is_newest_version(self,version,m_platform):
        '''
        根据参数查询是否为最新版本
        :param m_platform: 平台
        :param version: 版本号
        :return: True:是最新版本;False:不是最新版本;None:表示版本号超前或者不存在版本信息
        '''
        cond = and_(Settings.name == m_platform+"_"+SUFFIX_VERSION)
        row = self.session.query(Settings.name,Settings.value).filter(cond).first()
        if row:
            if int(row.value) <= int(version):
                ret = True
            # elif int(row.value) > int(version):
            #     ret = False
            else:
                ret = False
        else:
            ret = None
        return ret

    def newest_version_download_url(self,m_platform):
        '''
        获取指定平台下最新的版本下载地址
        :param m_platform: 平台
        :return:有下载地址就返回下载地址，没有则返回None
        '''
        cond = and_(Settings.name == m_platform+"_"+SUFFIX_URL)
        row = self.session.query(Settings.name,Settings.value).filter(cond).first()
        if row:
            ret = row.value
        else:
            ret = None

        return ret
