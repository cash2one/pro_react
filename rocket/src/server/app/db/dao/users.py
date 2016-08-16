#coding:utf-8

__author__ = 'commissar'

from app.util.dao_base import DaoBase
from app.db.model import Users
from app.db.model import UserConf
import uuid
import traceback
from app.setting import getLogging
from sqlalchemy import and_,or_

class UserDao(DaoBase):
    def __init__(self, **kwargs):
        super(UserDao, self).__init__(**kwargs)

    def insert_user(self, name, telephone, role_group):
        '''
        增加用户。如用户已经用telephone创建过其他角色，则需要仍使用之前的user_id
        :param name:
        :param telephone:
        :param role_group:    [string]role_manager|role_viewer
        :return:    user_id     如成功则返回用户ID，否则返回None
        '''

        assert role_group==Users.ROLE_SUP_MGR or role_group == Users.ROLE_MANAGER or role_group == Users.ROLE_VIEWER or role_group == Users.ROLE_ADMIN
        log = getLogging()

        match = True
        user_name = name
        has_role = False
        usr_uuid = None
        openid = None

        usrs = self.session.query(Users).filter(Users.telephone == telephone).all()

        if len(usrs) > 0:
            user_name = usrs[0].user_name
            usr_uuid = usrs[0].user_id
            openid = usrs[0].openid
            if user_name != name:
                match = False
            for usr in usrs:
                if usr.role == role_group:
                    has_role = True

        if match and (not has_role):
            if not usr_uuid:
                usr_uuid = str(uuid.uuid1())
            usr_new = Users(user_id=usr_uuid, user_name=name, telephone=telephone, role=role_group, py=self.convert_py(name), openid=openid)

            try:
                self.session.add(usr_new)
                self.session.commit()

            except Exception as e:
                log.error(traceback.format_exc())

        return match,usr_uuid,user_name

    def delete_user(self, user_id, role):
        '''
        删除用户信息
        :param user_id:
        :param role:
        :return:
        '''
        con = and_(Users.user_id == user_id, Users.role == role)
        self.session.query(Users).filter(con).delete()
        self.session.commit()
        return True

    def get_role_count(self, role_name):
        '''
        获取对应角色的数量
        :return:
        '''
        if role_name == Users.MANAGERS:
            role = Users.ROLE_MANAGER
        else:
            role = Users.ROLE_VIEWER
        return self.session.query(Users).filter(Users.role == role).count()


    # 单个用户信息
    def user(self,user_id, role=None):
        '''
        返回单个用户信息
        :param user_id:用户ID
        :param role:角色组，ROLE_开头的常量。
        :return: user_info 成功返回用户信息，否则返回None
        '''

        cond = Users.user_id == user_id
        if(role is not None):
            cond = and_(Users.user_id == user_id, Users.role == role)
        # 获取用户的邮箱
        cond_user_conf = and_(UserConf.user_id == user_id,UserConf.type == UserConf.TYPE_EMAIL)

        users = self.session.query(Users).filter(cond).all()
        user_conf = self.session.query(UserConf).filter(cond_user_conf).one_or_none()

        user_info = {
            'uuid':user_id,
            'user_name': users[0].user_name,
            'telephone': users[0].telephone,
            'py_full': self.convert_py_full(users[0].user_name) if users[0].user_name else None,
            'role': [user.role for user in users],
            'status': users[0].status,
            'openid':users[0].openid,
            'email': user_conf.rule if user_conf else None,
        }
        return user_info

    def get_user_id_by_tel(self, tel):
        '''
        通过电话查询用户ID
        :param tel: 电话
        :return: user_id|None
        '''
        user = self.session.query(Users).filter(Users.telephone == tel).first()
        if user:
            return user.user_id
        return None

    def get_user_id_by_tel_and_role(self, tel, role):
        '''
        通过电话查询用户ID
        :param tel: 电话
        :return: user_id|None
        '''
        user = self.session.query(Users).filter(Users.telephone == tel,Users.role == role).first()
        if user:
            return user.user_id
        return None

    def exist_user_by_openid(self,openid):
        '''
        根据opendid查询是否存在该用户
        :param openid:
        :return:
        '''
        cond = and_(Users.openid == openid)
        user = self.session.query(Users).filter(cond).all()
        if user:
            return True
        else:
            return False

    def isbind_wx_user(self,user_id):
        '''
        判断用户户是否已经绑定微信，当用户有三个角色，任一个没有绑定，都视为没有绑定，只有三个都绑定才视为绑定。
        :param user_id:
        :return:    True|False  True:已绑定。False代表示
        '''

        cond = and_(Users.user_id == user_id,Users.openid == None)

        user = self.session.query(Users).filter(cond).first()

        return user is None



    def get_user_by_uuid(self,user_id):
        '''
        通过user_id查询用户信息
        :param user_id:
        :return:
        '''
        cond = and_(Users.user_id == user_id)
        user = self.session.query(Users).filter(cond).first()
        return user

    def get_user_by_openid_and_role(self,openid,role):
        '''
        查询拥有指定openid和role的用户
        :param openid:
        :param role:
        :return:
        '''
        cond = and_(Users.openid == openid,Users.role == role)
        user = self.session.query(Users).filter(cond).first()
        return user

    def get_users_by_role_group(self,role_group):
        '''
        根据角色组查询用户
        :param role_group: 角色组名称
        :return: 用户列表
        '''
        cond = and_(Users.role == role_group)
        users = self.session.query(Users).filter(cond).all()
        return users


    def bind_user_with_openid(self,user_id,openid,role_group):
        """
        绑定用户的openid
        :param user_id:
        :param openid:
        :param role_group:
        :return:
        """
        # TODO 目前是根据role_group来绑定,这里以后可能还是会变动,因为viewer以后可能也要访问web
        if role_group == Users.ROLE_VIEWER:
            cond = and_(Users.user_id == user_id,Users.role == role_group)
        else:
            cond = and_(Users.user_id == user_id,Users.role != role_group)
        update = {
            Users.openid: openid,
        }
        self.session.query(Users).filter(cond).update(update)
        self.session.commit()

    def unbind_user_with_openid(self,user_id,role_group):
        '''
        解绑微信号
        :param user_id:
        :param openid:
        :param role_group:
        :return:
        '''
        # TODO 目前是根据role_group来绑定,这里以后可能还是会变动,因为viewer以后可能也要访问web
        if role_group == Users.ROLE_VIEWER:
            cond = and_(Users.user_id == user_id,Users.role == role_group)
        else:
            cond = and_(Users.user_id == user_id,Users.role != role_group)
        update = {
            Users.openid: None,
        }
        self.session.query(Users).filter(cond).update(update)
        self.session.commit()

    def bind_user_with_tel(self,user_id,tel):
        '''

        :param user_id:
        :param tel:
        :return:
        '''
        update = {
            Users.telephone: tel,
        }
        self.session.query(Users).filter(Users.user_id == user_id).update(update)
        self.session.commit()

    def exist_role_group(self, user_id, role_group):
        '''
        查询用户是否有该角色
        :param user_id: 用户ID
        :return:
        '''
        cond = and_(Users.user_id == user_id, Users.role == role_group)
        user = self.session.query(Users).filter(cond).one_or_none()
        if user:
            return True
        else:
            return False

    def exist_role_group_by_tel(self, tel, role_group):
        '''
        查询用户是否有该角色
        :param user_id: 用户ID
        :return:
        '''
        cond = and_(Users.telephone == tel, Users.role == role_group)
        user = self.session.query(Users).filter(cond).one_or_none()
        if user:
            return True
        else:
            return False

    def update_user_v2(self, user_id, user_name):
        '''
        通过user_id更新用户信息
        :param user_id:
        :param user_name:
        :return:
        '''
        user_update = {
            Users.user_name: user_name,
            Users.py: self.convert_py(user_name)
        }
        self.session.query(Users).filter(Users.user_id == user_id).update(user_update)
        self.session.commit()

    def update_user(self, user_id, user_name, telephone):
        '''
        通过user_id更新用户信息
        :param user_id:
        :param user_name:
        :param telephone:
        :return:
        '''
        user_update = {
            Users.user_name: user_name,
            Users.telephone: telephone,
            Users.py: self.convert_py(user_name)
        }
        self.session.query(Users).filter(Users.user_id == user_id).update(user_update)
        self.session.commit()

    def get_users_by_uuids(self,uuids, role = None, order_by="telephone",search=None):
        '''
        根据用户ID获取用户信息。
        :param uuids:
        :param role         [string]其值为ROLE_开头的常量。
        :param order_by:    [string]按哪种方式排序，telephone为手机号码，py为拼音排序。
        :return:    list(Users)
        '''

        if(len(uuids) == 0):
            return []

        cond_ord = Users.telephone.desc()

        if(order_by == 'py'):
            cond_ord = Users.py.desc()

        cond_filter = Users.user_id.in_(uuids)
        if(role is not None):
            cond_filter = and_(Users.user_id.in_(uuids), Users.role == role)

        if(search is not None):
            like_str = "%%%s%%"%search
            cond_filter = and_(or_(Users.user_name.like(like_str),Users.telephone.like(like_str)),cond_filter)

        records = self.session.query(Users).filter(cond_filter).order_by(cond_ord).all()
        return records

    def get_distinct_users(self,order_by="telephone"):
        if order_by == 'telephone':
            cond_ord = Users.telephone.desc()
        elif order_by == 'py':
            cond_ord = Users.py.desc()
        else:
            cond_ord = Users.id.desc()

        users = self.session.query(Users).order_by(cond_ord).distinct().all()
        return users