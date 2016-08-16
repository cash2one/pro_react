#coding:utf-8

__author__ = 'commissar'

import unittest
from app.util.base_db import init_db, get_session
from app.db.model import Users,RoleRules,UserConf
from app.setting import *
from app.db.dao.users import UserDao
from app.db.dao.user_conf import UserConfDao
from app.db.dao.settings import SettingsDao
from app.util.init_data import *

class DBDaoTest(unittest.TestCase):
    ##初始化工作
    def setUp(self):
        self.session = get_session()

        pass

    #退出清理工作
    def tearDown(self):
        pass

    def test_init_db_struct(self):
        init_db()

    def test_init_setting(self):
        init_db()
        init_settings()

    def test_init_rules(self):
        init_db()
        init_rules()

    def test_init_roles(self):
        init_db()
        init_roles()



    def test_init_db(self):
        init_db()
        init_settings()
        init_rules()
        init_roles()

    def test_insert_company(self):
        # syndicate = Company(name=u'小米集团',creator_id=u'xxxx-xxx-xx',py='XMJT',parent_uuid=Company.NO_PARENT,media_solution='{"type":"media_all","count":"20"}',uuid='mi',status='open')
        company = Company(name=u'小米电视',creator_id=u'xxxx-xxx-xx',py='XMDS',parent_uuid='mi',uuid='xiaomitv',status='open',property='sub',index='co_mi_xiaomitv')
        session = get_session()
        session.add(company)
        session.commit()
        session.close()

    def test_insert_usrconf(self):
        conf = UserConf(user_id='xxxx-xxx-xx',type=UserConf.TYPE_ROLE_SUPMGR,rule='super_manager',company_uuid='mi')
        session = get_session()
        session.add(conf)
        session.commit()
        session.close()

    def test_insert_last_status(self):
        status = UserLastStatus(user_id='xxxx-xxx-xx',company_uuid='mi',role_group='role_super_manager')
        session = get_session()
        session.add()
        session.commit()
        session.close()




    def test_insert_user_1(self):
        usr = Users(user_id='xxxx-xxx-xx', user_name='tomJim',telephone="1234567890",role="role_super_manager")
        session = get_session()
        res = session.add(usr)
        session.commit()
        session.close()

    def test_insert_user(self):
        usr_db = UserDao(session=self.session)
        print usr_db.insert_user(u"小gg", "133132132132",Users.ROLE_ADMIN)

    def test_insert_manager(self):
        usr_rle_db = UserConfDao(session=self.session)
        usr_rle_db.insert_manager( user_id="xxxx-xxx-xx", company_id="2")

    def test_get_modal_path(self):
        set_db = SettingsDao(session= self.session)
        print set_db.get_modal_base_path()
