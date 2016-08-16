#coding:utf-8

__author__ = 'commissar'

from app.util.model_base import BaseModel

from sqlalchemy import event, Column, String, Integer, VARCHAR,ForeignKey, Float,DateTime,text,UniqueConstraint
import datetime
from sqlalchemy.sql import func

class Users(BaseModel):

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    user_id = Column(VARCHAR(64), nullable=False)
    user_name = Column(VARCHAR(45), nullable=False)
    telephone = Column(VARCHAR(13), nullable=False)
    py = Column(VARCHAR(45))
    role = Column(VARCHAR(45), nullable=False)
    status = Column(Integer, default=2)
    openid = Column(VARCHAR(64))
    create_at = Column(DateTime, default=func.now())

    unique_key = UniqueConstraint(telephone, role, name='unique_key')

    #角色可以用变更。
    ROLE_ADMIN = "role_admin"
    ROLE_SUP_MGR = "role_super_manager"
    ROLE_MANAGER = "role_manager"
    ROLE_VIEWER = "role_viewer"

    MANAGERS = 'managers'

    MAPPING = {
        ROLE_ADMIN: '系统管理员',
        ROLE_SUP_MGR: '超级运营员',
        ROLE_MANAGER: '运营员',
        ROLE_VIEWER: '观察者'
    }


class UserConf(BaseModel):
    '''
    用户配置信息
    '''
    __tablename__ = 'user_conf'

    id = Column(Integer, primary_key=True)
    user_id = Column(VARCHAR(64), nullable=False)
    type = Column(Integer, nullable=False)
    rule = Column(VARCHAR(45), nullable=False)
    create_at = Column(DateTime, default=func.now())
    company_uuid = Column(VARCHAR(64), nullable=False)

    unique_key = UniqueConstraint(user_id, type,rule,company_uuid, name='unique_key')

    TYPE_RULE = 1       #功能
    TYPE_ROLE_VIEWER = 2       #Viewer角色
    TYPE_ROLE_MGR = 3       #Manager角色
    TYPE_ROLE_SUPMGR = 4       #SupManager角色
    TYPE_ROLE_ADMIN = 9  # Admin角色
    TYPE_QQ = 5
    TYPE_WX = 6
    TYPE_WB = 7
    TYPE_EMAIL = 8

    ACC_COM_ID = -1

    SUB_ROLE_SUP_MGR = "super_manager"

    MAPPING = {
        Users.ROLE_SUP_MGR: TYPE_ROLE_SUPMGR,
        Users.ROLE_MANAGER: TYPE_ROLE_MGR,
        Users.ROLE_VIEWER: TYPE_ROLE_VIEWER,
        Users.ROLE_ADMIN: TYPE_ROLE_ADMIN
    }


class RoleRules(BaseModel):
    __tablename__ = 'role_rules'

    id = Column(Integer, primary_key=True)
    name = Column(VARCHAR(45), nullable=False)
    title = Column(VARCHAR(45), nullable=False)
    create_at = Column(DateTime, default=func.now())
    rule = Column(VARCHAR(45), nullable=False)
    creator_id = Column(VARCHAR(64), nullable=False)

    unique_key = UniqueConstraint(name, rule, name='unique_key')

    data = [{
        "title":u"舆情运营员",
        "name":"manager_advices",
        "rules":["rule_analy_profile","rule_analy_media","rule_analy_trend","rule_analy_spread","rule_analy_event",
                 "rule_analy_event_vein","rule_analy_event_hot","rule_analy_event_spread","rule_analy_event_media",
                "rule_ac_manager_tag","rule_ac_manager_viewer","rule_ac_manager_media","rule_ac_all_articles",
                "rule_ac_news_audit","rule_ac_event_operator","rule_ac_warn_store","rule_ac_report_build","rule_ac_report_show",
                 "rule_setting_personal","rule_setting_warning","rule_analy_spread_company"
        ]
        },{
        "title":u"行情运营员",
        "name":"manager_situation",
        "rules":["rule_sc_index_info","rule_sc_index_setting","rule_ng_authority","rule_ng_industry","rule_ng_index",
                 "rule_ng_sales","rule_dn_brand_list"]
        },{
        "title":u"话题运营员",
        "name":"manager_subject",
        "rules":[]
        },{
        "title":u"新闻运营员",
        "name":"manager_news",
        "rules":["rule_nc_overview","rule_nc_koujin_news","rule_nc_koujin_crisis","rule_nc_manuscript",
                 "rule_nc_keywords","rule_setting_personal"]
        },{
        "title":u"知识库运营员",
        "name":"manager_wiki",
        "rules":[]
        },{
        "title":u"总监观察员",
        "name":"viewer_director",
        "rules":["rule_analy_profile","rule_analy_media","rule_analy_trend","rule_analy_spread","rule_analy_event",
                 "rule_ac_news_audit","rule_ac_event_operator","rule_ac_warn_store","rule_ac_report_show",
                 "rule_setting_personal","rule_setting_warning","rule_analy_spread_company"]
        },{
        "title":u"经理观察员",
        "name":"viewer_manager",
        "rules":["rule_analy_profile","rule_analy_media","rule_analy_trend",
                 "rule_ac_news_audit","rule_ac_event_operator","rule_ac_warn_store","rule_ac_report_show",
                 "rule_setting_personal","rule_analy_spread_company"]
        },{
        "title":u"超级运营员",
        "name":"super_manager",
        "rules":["rule_ac_manager_manager","rule_ac_manager_company","rule_setting_personal","rule_ac_manager_manager_v2",
                 "rule_gm_manager_company"]
        },{
        "title":u"普通系统管理员",
        "name":"admin_normal",
        "rules":["rule_sys_media_audit","rule_sys_list_login","rule_sys_manager_super","rule_sys_manager_syndicate","rule_sys_manager_article","rule_sys_list_newly_added"]
        },{
        "title":u"超级系统管理员",
        "name":"admin_super",
        "rules":["rule_sys_manager_adminer","rule_sys_media_audit","rule_sys_list_login","rule_sys_manager_super","rule_sys_manager_syndicate","rule_sys_manager_article","rule_sys_list_newly_added"]
        },{
        "title":u"媒体系统管理员",
        "name":"admin_media",
        "rules":["rule_sys_media_audit"]
        },{
        "title":u"文章系统管理员",
        "name":"admin_article",
        "rules":["rule_sys_manager_article"]
        }
    ]



class Company(BaseModel):
    '''
    公司
    '''

    __tablename__ = "company"

    id = Column(Integer, primary_key=True)
    uuid = Column(VARCHAR(64), nullable=False)
    name = Column(VARCHAR(45), nullable=False)
    creator_id = Column(VARCHAR(64), nullable=False)
    py = Column(VARCHAR(45))
    parent_uuid = Column(VARCHAR(64), nullable=False)
    create_at = Column(DateTime, default=func.now())
    media_solution = Column(VARCHAR(1024))
    desc = Column(VARCHAR(256))
    property = Column(VARCHAR(16), default=None)
    status = Column(VARCHAR(16), nullable=False, default='open')
    index = Column(VARCHAR(64), nullable=False)

    NO_PARENT = "0"
    PROP = {
        'sub': '子公司',
        'branch': '分公司',
        'competitor': '竞争对手',
        'client': '客户公司',
        'associated': '关联公司'
    }



class Settings(BaseModel):
    '''
    设置
    '''

    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    name = Column(VARCHAR(45), nullable=False)
    creator_id = Column(VARCHAR(64), nullable=False)
    value = Column(VARCHAR(128), nullable=False)
    create_at = Column(DateTime, default=func.now())
    company_uuid = Column(VARCHAR(64))
    type = Column(Integer,nullable=False)

    unique_key = UniqueConstraint(name, company_uuid, type, name='unique_key')


    TYPE_GLOBAL = 0  #全局性的
    TYPE_SYNDICATE = 1  #集团级别的
    TYPE_COMPANY = 2  #公司级别的

    NAME_MOD_HOME = "mod_home"
    NAME_MOD_DOC = "mod_document"
    NAME_MOD_ADVICE = "mod_advices"
    NAME_MOD_ADMIN = "mod_admin"
    NAME_MOD_INDEX = "mod_index"


    data = [{"name":NAME_MOD_HOME, "value":"home.puzhizhuhai.com", "type":TYPE_GLOBAL, "company_uuid":0,"creator_id": "system"},
            {"name":NAME_MOD_ADVICE, "value":"info.puzhizhuhai.com", "type":TYPE_GLOBAL, "company_uuid":0,"creator_id": "system"},
            {"name":NAME_MOD_DOC, "value":"document.puzhizhuhai.com", "type":TYPE_GLOBAL, "company_uuid":0,"creator_id": "system"},
            {"name":NAME_MOD_ADMIN, "value":"admin.puzhizhuhai.com", "type":TYPE_GLOBAL, "company_uuid":0,"creator_id": "system"},
            {"name":NAME_MOD_INDEX, "value":"index.puzhizhuhai.com", "type":TYPE_GLOBAL, "company_uuid":0,"creator_id": "system"},

    ]



class Rules(BaseModel):
    '''
    权限
    '''

    __tablename__ = "rules"

    DISPLAY_ON = 1
    DISPLAY_OFF = 0

    LV_COMPANY = 'company'
    LV_SYNDICATE = "syndicate"

    id = Column(Integer, primary_key=True)
    name = Column(VARCHAR(45), nullable=False, unique=True)
    title = Column(VARCHAR(45), nullable=False)
    link = Column(VARCHAR(1024))
    parent = Column(VARCHAR(45))
    module = Column(VARCHAR(45))
    order = Column(Integer)
    display = Column(Integer, default=DISPLAY_ON)
    level = Column(VARCHAR(45),default=LV_COMPANY,doc=u"显示此目录的级别")


    data = [{"name":"rule_advices_center", "title":u"舆情中心", "link":"#", "parent":"","module": Settings.NAME_MOD_ADVICE},
            {"name":"rule_ac_parse_group", "title":u"分析组", "link":"#", "parent":"rule_advices_center","module": Settings.NAME_MOD_ADVICE},
            {"name":"rule_analy_profile", 'title':u"分析概况", 'link':"/analy#/profile", 'parent':"rule_ac_parse_group",'module': Settings.NAME_MOD_ADVICE},
            {"name":"rule_analy_media", 'title':u"媒体分布", 'link':"/analy#/media", 'parent':"rule_ac_parse_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_analy_trend", 'title':u"热度分析", 'link':"/analy#/trend", 'parent':"rule_ac_parse_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_analy_spread", 'title':u"传播分析", 'link':"/analy#/spread", 'parent':"rule_ac_parse_group",'module': Settings.NAME_MOD_ADVICE,'display': DISPLAY_OFF},
            {'name':"rule_analy_event", 'title':u"事件分析", 'link':"/analy#/event", 'parent':"rule_ac_parse_group",'module': Settings.NAME_MOD_ADVICE},


            {"name":"rule_analy_event_vein",'title':u"事件脉络", 'link':"/analy#/event/vein", 'parent':"rule_analy_event",'module': Settings.NAME_MOD_ADVICE},
            {"name":"rule_analy_event_hot",'title':u"热度分析", 'link':"/analy#/event/hot", 'parent':"rule_analy_event",'module': Settings.NAME_MOD_ADVICE},
            {"name":"rule_analy_event_spread",'title':u"传播分析", 'link':"/analy#/event/spread", 'parent':"rule_analy_event",'module': Settings.NAME_MOD_ADVICE,'display': DISPLAY_OFF},
            {"name":"rule_analy_event_media",'title':u"媒体分布", 'link':"/analy#/event/media", 'parent':"rule_analy_event",'module': Settings.NAME_MOD_ADVICE},

            {'name':"rule_analy_spread_company", 'title':u"公司传播分析", 'link':"/analy#/spread/company", 'parent':"rule_ac_parse_group",'module': Settings.NAME_MOD_ADVICE,'display': DISPLAY_OFF},

            {'name':"rule_ac_manager_group",'title':u"管理组", 'link':"#", 'parent':"rule_advices_center",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_manager_tag", 'title':u"标签管理", 'link':"/manager-tag#/tag", 'parent':"rule_ac_manager_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_manager_manager", 'title':u"人员管理", 'link':"/manager#/manager", 'parent':"rule_ac_manager_group",'module': Settings.NAME_MOD_HOME},
#            {'name':"rule_ac_manager_manager_v2", 'title':u"运营员管理", 'link':"/manager#/allmgr", 'parent':"rule_ac_manager_group",'module': Settings.NAME_MOD_HOME},
            {'name':"rule_ac_manager_company", 'title':u"公司管理", 'link':"/manager#/company", 'parent':"rule_ac_manager_group",'module': Settings.NAME_MOD_HOME, 'display': DISPLAY_OFF},
            {'name':"rule_ac_manager_viewer", 'title':u"人员管理", 'link':"/manager#/viewer", 'parent':"rule_ac_manager_group",'module': Settings.NAME_MOD_HOME},
            {'name':"rule_ac_manager_media", 'title':u"媒体管理", 'link':"/manager-mid#/media", 'parent':"rule_ac_manager_group",'module': Settings.NAME_MOD_ADVICE},

            {'name':"rule_global_manager", 'title':u'日常管理', "link":"#", "parent":"","module": Settings.NAME_MOD_HOME},
            {'name':"rule_gm_base_group", 'title':u'日常管理组', "link":"#", "parent":"rule_global_manager","module": Settings.NAME_MOD_HOME},
            {'name':"rule_gm_manager_company", 'title':u"公司管理", 'link':"/manager#/company", 'parent':"rule_gm_base_group",'module': Settings.NAME_MOD_HOME,'level':LV_SYNDICATE},
            {'name':"rule_ac_manager_manager_v2", 'title':u"运营员管理", 'link':"/manager#/allmgr", 'parent':"rule_gm_base_group",'module': Settings.NAME_MOD_HOME,'level':LV_SYNDICATE},

            {'name':"rule_ac_base_group", 'title':u"基础功能组", 'link':"#", 'parent':"rule_advices_center",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_all_articles", 'title':u"所有文章", 'link':"/base#/news/audit", 'parent':"rule_ac_base_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_news_audit", 'title':u"文章审计", 'link':"/base#/news/audit2", 'parent':"rule_ac_base_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_event_operator", 'title':u"事件处理", 'link':"/base#/event/operator", 'parent':"rule_ac_base_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_warn_store", 'title':u"预警处理", 'link':"/base#/warn/store", 'parent':"rule_ac_base_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_report_build", 'title':u"报表生成", 'link':"/base#/report/build", 'parent':"rule_ac_base_group",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_ac_report_show", "title":u"报表显示", 'link':"/base#/report/show", 'parent':"rule_ac_base_group",'module': Settings.NAME_MOD_ADVICE,'display': DISPLAY_OFF},

            {'name':"rule_situation_center", 'title':u"行情中心", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_INDEX},
            {'name':"rule_sc_base_group", 'title':u"设置组", 'link':"#", 'parent':"rule_situation_center",'module': Settings.NAME_MOD_INDEX},
            {'name':"rule_sc_index_info", 'title':u"搜索指数", 'link':"/index-base#/info", 'parent':"rule_sc_base_group",'module': Settings.NAME_MOD_INDEX},
            {'name':"rule_sc_index_setting", 'title':u"指数设置", 'link':"/index-base#/setting", 'parent':"rule_sc_base_group",'module': Settings.NAME_MOD_INDEX,'display': DISPLAY_OFF},



            {'name':"rule_subject_center", 'title':u"话题中心", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_news_center", 'title':u"新闻中心", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_nc_group", 'title':u"基础功能组", 'link':"#", 'parent':"rule_news_center",'module': Settings.NAME_MOD_HOME},
            {'name':"rule_nc_overview", 'title':u"项目概览", 'link':"/news#/overview", 'parent':"rule_nc_group",'module': Settings.NAME_MOD_HOME,'display': DISPLAY_OFF},
            {'name':"rule_nc_koujin_news", 'title':u"新闻口径", 'link':"/news#/news", 'parent':"rule_nc_group",'module': Settings.NAME_MOD_HOME,'display': DISPLAY_OFF},
            {'name':"rule_nc_koujin_crisis", 'title':u"危机口径", 'link':"/news#/crisis", 'parent':"rule_nc_group",'module': Settings.NAME_MOD_HOME,'display': DISPLAY_OFF},
            {'name':"rule_nc_manuscript", 'title':u"稿件库", 'link':"/news#/manuscript", 'parent':"rule_nc_group",'module': Settings.NAME_MOD_HOME,'display': DISPLAY_OFF},
            {'name':"rule_nc_keywords", 'title':u"关键词库", 'link':"/news#/keywords", 'parent':"rule_nc_group",'module': Settings.NAME_MOD_HOME,'display': DISPLAY_OFF},


            {'name':"rule_wiki_center", 'title':u"知识中心", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_ADVICE},

            {'name':"rule_setting", 'title':u"设置", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_setting_group", 'title':u"设置组", 'link':"#", 'parent':"rule_setting",'module': Settings.NAME_MOD_ADVICE},
            {'name':"rule_setting_personal", 'title':u"个人设置", 'link':"/setting/personal", 'parent':"rule_setting_group",'module': Settings.NAME_MOD_HOME,'display': DISPLAY_OFF},
            {'name':"rule_setting_warning", 'title':u"通知设置", 'link':"/setting/warning", 'parent':"rule_setting_group",'module': Settings.NAME_MOD_ADVICE},

            {'name':"rule_sys_manager", 'title':u"系统管理", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_ADMIN},
            {'name':"rule_sys_manager_group", 'title':u"系统管理组", 'link':"#", 'parent':"rule_sys_manager",'module': Settings.NAME_MOD_ADMIN},
            {'name':"rule_sys_manager_syndicate", 'title':u"集团管理", 'link':"/admin_syn_list.html", 'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},
            {'name':"rule_sys_manager_super", 'title':u"超级运营员管理", 'link':"/admin_spr_mgr_list.html", 'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},
            {'name':"rule_sys_manager_adminer", 'title':u"管理员的管理（增删改）", 'link':"/admin_admin_list.html",  'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},
            {'name':"rule_sys_media_audit", 'title':u"媒体审计", 'link':"/admin_media_manage.html", 'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},
            {'name':"rule_sys_list_login", 'title':u"用户登陆系统状态查看", 'link':"/admin_user_online_list.html", 'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},
            {'name':"rule_sys_list_newly_added", 'title':u"新增用户查看", 'link':"/admin_new_add_list.html", 'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},
            {'name':"rule_sys_manager_article", 'title':u"文章管理", 'link':"/admin_article_detail.html", 'parent':"rule_sys_manager_group",'module': Settings.NAME_MOD_ADMIN,'level':LV_SYNDICATE},


            {'name':"rule_navigate", 'title':u'大数据导航', "link":"#", "parent":"","module": Settings.NAME_MOD_INDEX},
            {'name':"rule_navigate_group",'title':u'大数据导航工具组', "link":"#", "parent":"rule_navigate","module": Settings.NAME_MOD_INDEX},
            {'name':"rule_ng_authority",'title':u'权威机构', "link":"/big-data#/navigate/authority", "parent":"rule_navigate_group","module": Settings.NAME_MOD_INDEX,'level':LV_SYNDICATE},
            {'name':"rule_ng_industry",'title':u'行业报告', "link":"/big-data#/navigate/industry", "parent":"rule_navigate_group","module": Settings.NAME_MOD_INDEX,'level':LV_SYNDICATE},
            {'name':"rule_ng_index",'title':u'指数榜单', "link":"/big-data#/navigate/index", "parent":"rule_navigate_group","module": Settings.NAME_MOD_INDEX,'level':LV_SYNDICATE},
            {'name':"rule_ng_sales",'title':u'销量流量', "link":"/big-data#/navigate/sales", "parent":"rule_navigate_group","module": Settings.NAME_MOD_INDEX,'level':LV_SYNDICATE},

            {'name':"rule_data_news", 'title':u"数据新闻", 'link':"#", 'parent':"",'module': Settings.NAME_MOD_INDEX},
            {'name':"rule_dn_group", 'title':u"数据新闻组", 'link':"#", 'parent':"rule_data_news",'module': Settings.NAME_MOD_INDEX},
            {'name':"rule_dn_brand_list", 'title':u"品牌风云榜", 'link':"/big-data#/brand", 'parent':"rule_dn_group",'module': Settings.NAME_MOD_INDEX,'level':LV_SYNDICATE}

    ]



class UserLastStatus(BaseModel):
    '''
    用户最后状态表
    '''

    __tablename__ = "user_last_status"

    id = Column(Integer, primary_key=True)
    user_id = Column(VARCHAR(64), nullable=False)
    company_uuid = Column(VARCHAR(64))
    module = Column(VARCHAR(45))
    role = Column(VARCHAR(45))
    role_group = Column(VARCHAR(45))
    url = Column(VARCHAR(64))
    update_at = Column(DateTime, default=func.now())
    token = Column(VARCHAR(64))
    platform = Column(VARCHAR(16))
    
    
class UserFeedback(BaseModel):
    '''
    用户反馈表
    '''

    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True)
    user_id = Column(VARCHAR(64), nullable=False)
    company_uuid = Column(VARCHAR(64), nullable=False)
    type = Column(VARCHAR(64), nullable=False)
    content = Column(VARCHAR(512), nullable=False)
    platform = Column(VARCHAR(24), nullable=False)
    operator = Column(VARCHAR(24))
    operator_at = Column(DateTime, default=func.now())
    create_at = Column(DateTime, default=func.now())
