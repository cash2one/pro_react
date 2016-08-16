#coding:utf-8

__author__ = 'commissar'

from app.setting import *
from tornado.options import define, options


from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.util.model_base import BaseModel

DB_CONNECT_STRING = 'mysql+mysqldb://%s:%s@%s:%d/%s?charset=utf8'%(DB_USER,DB_PASS,DB_HOST,DB_PORT,DB_NAME)
engine = create_engine(DB_CONNECT_STRING, echo = True)
db_session = sessionmaker(bind=engine)#,autocommit=True)


def get_session():
    session = db_session()
    return session

def init_db():
    BaseModel.metadata.create_all(engine)



def drop_db():
    BaseModel.metadata.drop_all(engine)