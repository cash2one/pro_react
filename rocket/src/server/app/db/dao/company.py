#coding:utf-8

__author__ = 'commissar'

import json

from app.util.dao_base import DaoBase
from app.db.model import Company

from sqlalchemy import and_


class CompanyDao(DaoBase):
    def __init__(self, **kwargs):
        super(CompanyDao, self).__init__(**kwargs)

    # 公司列表
    def get_companys(self,parent_uuid,search=""):
        '''
        公司列表
        :param beg:
        :param count:
        :return: company_list 成功返回公司列表，否则None
        '''
        like_str = "%" + search + "%"
        cond = and_(Company.parent_uuid == parent_uuid,Company.name.like(like_str))
        company_list = self.session.query(Company).filter(cond).all()
        coms = []
        for company in company_list:
            com = {
                'id': company.id,
                'name': company.name,
                'desc': company.desc,
                'property': {
                    'type': company.property,
                    'name': Company.PROP.get(company.property) if company.property else None
                },
                'uuid': company.uuid,
                'py': company.py
            }
            coms.append(com)

        return coms

    def get_com_names_by_com_indices(self,com_indices):
        """

        :param com_indices:
        :return:
        """
        companys = self.get_all_companys_with_index()
        com_names = []
        for index in com_indices:
            for com in companys:
                if com.index == index:
                    com_names.append(com.name)
        return com_names

    def get_all_companys_with_index(self):
        return self.session.query(Company).filter(Company.index != None).all()

    def get_company_by_uuid(self, com_uuid, need_parent=True):
        '''
        通过id查询公司信息
        :param com_uuid:
        :return:
        '''
        company = self.session.query(Company).filter(Company.uuid == com_uuid).one_or_none()
        company_info = {}
        if company:
            company_info = {
                'id': company.id,
                'name': company.name,
                'creator_id': company.creator_id,
                'py': company.py,
                'parent_uuid': company.parent_uuid,
                'create_at': company.create_at,
                'media_solution': json.loads(company.media_solution) if company.media_solution else None,
                'desc': company.desc,
                'property': {
                    'type': company.property,
                    'name': Company.PROP.get(company.property) if company.property else None
                },
                'status': company.status,
                'uuid': company.uuid,
                'index': company.index
            }
            if company_info['parent_uuid'] != Company.NO_PARENT and need_parent:
                company_info['parent'] = self.get_company_by_uuid(company_info['parent_uuid'])
        return company_info

    def insert_company(self, name, desc, prop, creator_id, parent_uuid, uuid, index):
        '''
        添加公司
        :param name:
        :param desc:
        :return:
        '''
        ret = False
        if not self.com_exists(uuid):
            com = Company(name=name, creator_id=creator_id, parent_uuid=parent_uuid, desc=desc, property=prop, uuid=uuid, py=self.convert_py(name), index=index)
            self.session.add(com)
            self.session.commit()
            ret = True
        return ret

    def update_company(self, com_uuid, name, desc, prop):
        '''
        修改公司信息
        :param com_uuid:
        :param name:
        :param desc:
        :return:
        '''
        update = {
            Company.name: name,
            Company.desc: desc,
            Company.property: prop,
            Company.py: self.convert_py(name)
        }
        self.session.query(Company).filter(Company.uuid == com_uuid).update(update)
        self.session.commit()

    def delete_company(self, com_uuid):
        '''
        删除公司，如果有子公司，则无法删除，返回false.
        :param com_uuid:
        :return: True|False
        '''
        ret = True
        com = self.get_company_by_uuid(com_uuid, False)
        if com:
            if com['parent_uuid'] == Company.NO_PARENT:
                com_list = self.get_companys(com_uuid)
                if len(com_list) == 0:
                    self.session.query(Company).filter(Company.uuid == com_uuid).delete()
                else:
                    ret = False
            else:
                self.session.query(Company).filter(Company.uuid == com_uuid).delete()
            self.session.commit()

        return ret

    def com_exists(self, com_uuid):
        '''
        检查公司是否存在
        :param com_uuid:
        :return:
        '''
        com = self.session.query(Company).filter(Company.uuid == com_uuid).one_or_none()
        if com:
            return True
        return False

