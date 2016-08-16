#coding:utf-8

__author__ = 'commissar'

from app.util.base_db import get_session
from datetime import *
from xpinyin import Pinyin

class DaoBase(object):
    def __init__(self, session):
        self.session = session

    # 当前时间
    def cur_date(self):
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 首字母大写
    @staticmethod
    def convert_py(s):
        p = Pinyin()
        return p.get_initials(s, '').upper()

    # 全拼音
    @staticmethod
    def convert_py_full(s):
        p = Pinyin()
        return p.get_pinyin(s, '')
