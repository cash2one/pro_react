# -*-coding:utf-8-*-

__author__ = 'commissar'

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import event, Column, String, Integer, VARCHAR,ForeignKey, Float,DateTime,text,Enum,Text,Index

BaseModel = declarative_base()
BaseModelRocket = declarative_base()

class EmailSendQueue(BaseModel):
    __tablename__ = 'email_send_queue'

    id = Column(Integer, primary_key=True)
    company_uuid = Column(VARCHAR(64), nullable=False)
    type = Column(Enum("report", "warn"), nullable=False)
    user_id = Column(VARCHAR(64))
    email = Column(VARCHAR(256), nullable=False)
    uuid =  Column(VARCHAR(64), nullable=False)
    body = Column(Text, nullable=True)
    send_at = Column(DateTime, nullable=True)
    send_status = Column(Integer, nullable=False, default=0)
    send_count = Column(Integer, nullable=False, default=0)
    creator_id = Column(VARCHAR(64))
    create_at = Column(DateTime, default=text('NOW()'))
    plan_send_at = Column(DateTime, nullable=True)

    idx_normal = Index("idx_normal", company_uuid, type, user_id, uuid)
    idx_send_status = Index("idx_send_status",email,send_status,create_at)

    #这三个状态值用于send_status
    SEND_READY = 0
    SEND_SUCCESS = 1
    SEND_FAILED = 2

    SEND_MAX_COUNT = 5  #最大发送次数

    # 类型
    TYPE_WARN = 'warn'

class UserConfigs(BaseModel):
    __tablename__ = "user_configs"

    id = Column(Integer, primary_key=True)
    company_uuid = Column(VARCHAR(64), nullable=False)
    creator_id = Column(VARCHAR(64), nullable=False)
    version = Column(Integer, nullable=False)
    type = Column(VARCHAR(64), nullable=False)
    value = Column(VARCHAR(128),nullable=False)
    created_at = Column(DateTime, server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime, nullable=False)

    TYPE_WARN = 'warn'

    STATUS_OPEN = "1"
    STATUS_CLOSED = "0"


class Company(BaseModelRocket):
    __tablename__ = "company"

    id = Column(Integer, primary_key=True)
    uuid = Column(VARCHAR(64), nullable=False)
    name = Column(VARCHAR(45), nullable=False)
    creator_id = Column(VARCHAR(64), nullable=False)
    py = Column(VARCHAR(45))
    parent_uuid = Column(VARCHAR(64), nullable=False)
    create_at = Column(DateTime, server_default=text('NOW()'))
    media_solution = Column(VARCHAR(1024))
    desc = Column(VARCHAR(256))
    property = Column(VARCHAR(16), default=None)
    status = Column(VARCHAR(16), nullable=False, default='open')
    index = Column(VARCHAR(64))

    NO_PARENT = "0"
    PROP = {
        'sub': '子公司',
        'branch': '分公司',
        'competitor': '竞争对手',
        'associated': '关联公司'
    }

class Users(BaseModelRocket):

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    user_id = Column(VARCHAR(64), nullable=False)
    user_name = Column(VARCHAR(45), nullable=False)
    telephone = Column(VARCHAR(13), nullable=False)
    py = Column(VARCHAR(45))
    role = Column(VARCHAR(45), nullable=False)
    status = Column(Integer, default=2)

    #角色可以用变更。
    ROLE_ADMIN = "role_super_manager"
    ROLE_MANAGER = "role_manager"
    ROLE_VIEWER = "role_viewer"

    MANAGERS = 'managers'

    MAPPING = {
        ROLE_ADMIN: '超级运营员',
        ROLE_MANAGER: '运营员',
        ROLE_VIEWER: '观察者'
    }


