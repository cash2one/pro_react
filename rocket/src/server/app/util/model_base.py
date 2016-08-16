#coding:utf-8

__author__ = 'commissar'

from sqlalchemy.ext.declarative import declarative_base

BaseModel = declarative_base()

class BaseModel(BaseModel):
    __abstract__ = True
    __table_args__ = { # 可以省掉子类的 __table_args__ 了
        'mysql_engine': 'InnoDB',
        'mysql_charset': 'utf8'
    }
    #