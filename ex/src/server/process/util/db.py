# -*-coding:utf-8-*-

from DBUtils.PersistentDB import PersistentDB
import MySQLdb
import traceback
import settings
# from handler.base import logger
from datetime import *
import re


from datetime import *


class DaoBase(object):
    def __init__(self, session):
        self.session = session

    def cur_date(self):
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def object2dict(obj):
    #convert object to a dict
    d = {}
    d['__class__'] = obj.__class__.__name__
    d['__module__'] = obj.__module__
    d.update(obj.__dict__)
    return d

def cur_date_str():
    return str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

def cur_day_str():
    return str(datetime.now().strftime("%Y-%m-%d"))

def date_to_str(date):
    return date.strftime("%Y-%m-%d %H:%M:%S")

def date_to_day_str(date):
    return date.strftime("%Y-%m-%d")

def str_to_date(date_str):
    m = re.match(r'(\d{2,4})-(\d{1,2})-(\d{1,2})', date_str)
    if m:
        year = int(m.group(1))
        month = int(m.group(2))
        day = int(m.group(3))
        return datetime(year,month,day)


class DBConnection(object):
    persist = None

    # maxusage: the maximum number of reuses of a single connection
    # (the default of 0 or None means unlimited reuse)
    @classmethod
    def get_persistent(cls, maxusage=0):
        return PersistentDB(MySQLdb, maxusage,
                            host=settings.DB_HOST,
                            port=settings.DB_PORT,
                            user=settings.DB_USER,
                            passwd=settings.DB_PASS,
                            db=settings.DB_NAME,
                            charset='utf8')

    @classmethod
    def connection(cls):
        if not cls.persist:
            cls.persist = cls.get_persistent()
        return cls.persist.connection()

    @classmethod
    def sql_fetch(cls, fetch_one, sql, *parameters):
        result = []
        db = cls.connection()
        try:
            cursor = db.cursor()
            cursor.execute(sql, parameters)
            db.commit()
            if fetch_one:
                result = cursor.fetchone()
            else:
                result = cursor.fetchall()
            cursor.close()
        except Exception as e:
            traceback.print_exc()
            db.rollback()
            db.close()
            raise Exception, e
        db.close()
        return result

    @classmethod
    def sql_fetch_one(cls, sql, *parameters):
        return cls.sql_fetch(True, sql, *parameters)

    @classmethod
    def sql_fetch_all(cls, sql, *parameters):
        return cls.sql_fetch(False, sql, *parameters)

    @classmethod
    def sql_execute(cls, sql, *parameters):
        result = True
        db = cls.connection()
        try:
            row = db.cursor().execute(sql, parameters)
            if (row > 0):
                result = True
            db.commit()
        except Exception as e:
            traceback.print_exc()
            result = False
            db.rollback()
            db.close()
            raise Exception, e
        db.close()
        return result

    def update_data(self, tb_name, values, conditions):
        '''
        更新纪录。
        :param tb_name:
        :param values:      [dict]字段与其对应值。
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :return:            True/False
        '''
        cond_str = self.__build_where_str__(conditions)

        #构建update语句中的set字符串
        set_item_tmpl = []
        for key, val in values.items():
            if(val is None):
                item_tmpl = u'''%s=null'''%key
            elif( isinstance(val,datetime)):
                item_tmpl = u'''%s="%s"''' % (key, date_to_str(val))
            else:
                item_tmpl = u'''%s="%s"''' % (key, val)

            set_item_tmpl.append(item_tmpl)

        # set_item_tmpl = [u'''%s="%s"''' % (key, val) for key, val in values.items()]
        set_str = ",".join(set_item_tmpl)
        sql = '''update %s set %s where %s''' % (tb_name, set_str, cond_str)
        return self.sql_execute(sql)

    def del_data(self, tb_name, conditions):
        '''
        删除数据
        :param tb_name:     [str] 表名，
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :return:            [int]删除的行数。
        '''
        cond_str = self.__build_where_str__(conditions)
        sql = ''' delete from %s where %s ''' % (tb_name, cond_str)

        return self.sql_execute(sql)

        pass

    def add_datas(self, tb_name, data):
        '''
        向一个表中批次插入数据。
        :param tb_name:
        :param data:    [array(dict)]数据列表。dict为字段名及其对应值。
        :return:    [int]插入数据的条数。
        '''

        if (len(data) == 0):
            return 0

        t_row = data[0]
        keys = t_row.keys()

        val_tmpl = []
        for key in keys:
            val_tmpl.append(u'''"%s"''')

        val_tmpl = '(' + (',').join(val_tmpl) + ')'  # 每条值的字符模块。

        val_array = []
        for item in data:
            item_val_ary = []
            for key in keys:
                item_val_ary.append(item[key])
            item_val = val_tmpl % tuple(item_val_ary)
            val_array.append(item_val)

        sql = u'''insert into %s(%s) values %s''' % (tb_name, (', ').join(keys), (', ').join(val_array))

        return self.sql_execute(sql)

    # 添加一条数据到指定表中
    def add_data(self, tb_name, **data):
        """

        :param tb_name:
        :param data:    [dict] 表字段及相对应值。
        :return:
        """
        keys = data.keys()

        str_vals = [];
        for key in keys:
            str_vals.append(r'%s')

        sql = r'insert into %s(%s) values (%s)' % (tb_name, (', ').join(keys), (', ').join(str_vals))

        return self.sql_execute(sql, *data.values())

    def find_one_by_fields(self, tb_name, fields, conditions=None, order_by='id desc'):
        '''
        通过多个条件来获取某一条信息。
        :param tb_name:
        :param fields:      [string/tuple]需要获取的字段名。
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :return:            [None|dict]结果对象。
        '''

        # 将字段进行拼接。
        if (isinstance(fields, str)):
            fields = [fields, ]
        if (isinstance(fields, tuple)):
            fields = list(fields)

        fields_str = ",".join(fields)

        sql = ""
        if(conditions is None):
            sql = "select %s from %s order by %s limit 1"%(fields_str, tb_name,order_by)
        else:
            cond_str = self.__build_where_str__(conditions)
            sql = "select %s from %s where %s order by %s limit 1"%(fields_str, tb_name,cond_str,order_by)

#        sql = MySQLdb.escape_string(sql)

        row = self.sql_fetch(True, sql)

        ret = None
        if (row):
            ret = {}
            for i in range(len(fields)):
                ret[fields[i]] = row[i]

        return ret

    def find_one_by_field(self, tb_name, fields, conditions):
        '''
        获取根据与条件获取数据。
        :param tb_name:     [string]表名。
        :param fields:      [string/tuple]需要获取的字段名。
        :param conditions:  [dict]  条件，
        :return:    [dict]  key为fields值。
        '''
        if (isinstance(fields, str)):
            fields = (fields,)

        fields_str = "*"
        if isinstance(fields, tuple) or isinstance(fields,list):
            fields_str = (',').join(fields)

        cond_tmp = ['%s="%s" ' % (key, conditions[key]) for key in conditions]

        cond_str = ("AND ").join(cond_tmp);

        sql = """select %s from %s where %s """ % (fields_str, tb_name, cond_str)
        row = self.sql_fetch(True, sql)
        ret = None
        if (row):
            ret = {}
            for i in range(len(fields)):
                ret[fields[i]] = row[i]

        return ret

    def __build_where_str__(self, conditions):
        '''
        构建where子语句。
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :return:            [str]where子语句。
        '''
        # 将各个条件组合起来。
        cond_str_array = []
        for cond_item in conditions:
            temp_str = '''%s%s"%s" '''

            if len(cond_item) == 1:
                cond_str_array.append(cond_item[0]+" ")
            else:
                t_field = cond_item[0]
                t_value = cond_item[1]
                t_cond = "="

                if(isinstance(t_value,datetime)):
                    t_value = date_to_str(t_value)

                if (len(cond_item) > 2):
                    t_cond = cond_item[2].lower()

                if isinstance(t_value,(int,long)):
                    temp_str = "%s%s%s "
                elif( isinstance(t_value, (tuple,list,set)) and (
                            (t_cond == "in") or (t_cond == "not in"))):
                    t_value = ["'%s'" % t_i for t_i in t_value]
                    t_value = ','.join(t_value)
                    t_value = ' '.join(['(', t_value, ')'])

                    temp_str = "%s %s %s "

                cond_str_array.append(temp_str % (t_field, t_cond, t_value))

        cond_str = "AND ".join(cond_str_array)
        return cond_str

    def __result_to_human__(self, rows, fields):
        '''
        将sql_fetch返回的tuple(array)转换成便于理解的array(dict)
        :param rows:    [tuple(array)] sql_fetch返回的结果集。
        :param fields:  [array]结果集中每条纪录的字段排序。
        :return:        [array(dict)]dict的key是 fields中的值
        '''
        ret = []
        for r in rows:
            t_r = {}
            for i in range(len(fields)):
                t_r[fields[i]] = r[i]
            ret.append(t_r)
        return ret;

    def find_part_by_field(self, tb_name, fields, conditions, offset, limit, order_by='id asc', human=False):
        '''
        根据limit和offset获取部分数据。
        :param tb_name:    [string]表名。
        :param fields:     [tuple/string/array]字段名。
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :param order_by:    [string]排序方式。
        :param offset:      [int]从第几个开始读取。默认0，代表从开始。
        :param limit:       [int]读取几个，默认-1,代表读取所有。
        :param human:       [False/True]是否对人更友好。
        :return:            human=False时，tuple(array)。array的格式为
                            human=True时，array(dict),dict的key是 fields中的值。
        '''

        cond_str = self.__build_where_str__(conditions)

        # 将字段进行拼接。
        if (isinstance(fields, str)):
            fields = [fields, ]
        if (isinstance(fields, tuple)):
            fields = list(fields)

        fields_str = ",".join(fields)

        # 最后拼接并执行。
        sql = "select * from (select %s from %s where %s order by %s) as a" % (
            fields_str, tb_name, cond_str, order_by)

        if(limit > 0):
            sql = "%s limit %d,%d"%(sql,int(offset), int(limit))

        row = self.sql_fetch(False, sql)

        # 将返回的tuple(array)转换成便于理解的array(dict)
        ret = []
        if (row):
            if (human):
                ret = self.__result_to_human__(row, fields)
            else:
                ret = row

        return ret

    def find_last_row(self,tb_name,fields,conditions,ordy_by="id desc"):
        '''
        获取最后一条数据
        :param tb_name:
        :param fields:      [tuple/string/array]字段名。
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :param ordy_by:
        :return:
        '''

        # 将字段进行拼接。
        if (isinstance(fields, str)):
            fields = [fields, ]
        if (isinstance(fields, tuple)):
            fields = list(fields)

        fields_str = ",".join(fields)


        sql = ""
        if(conditions is None):
            sql = "select %s from %s order by %s limit 1"%(fields_str, tb_name,ordy_by)
        else:
            cond_str = self.__build_where_str__(conditions)
            sql = "select %s from %s where %s order by %s limit 1"%(fields_str, tb_name,cond_str,ordy_by)

        sql = MySQLdb.escape_string(sql)



    def find_all_by_field(self, tb_name, fields, conditions, order_by='id asc', human=False):
        '''
        获取所有数据。
        :param tb_name:    [string]表名。
        :param fields:     [tuple/string/array]字段名。
        :param conditions:  [tuple(tuple)]条件，各条件之间是AND关系。内部tuple结构为(filed,value,cond)cond的默认值为=
        :param order_by:    [string]排序方式。默认ID从小到大。
        :param human:       [False/True]是否对人更友好。
        :return:            human=False时，tuple(array)。array的格式为
                            human=True时，array(dict),dict的key是 fields中的值。
        '''

        cond_str = self.__build_where_str__(conditions)

        # 将字段进行拼接。
        if (isinstance(fields, str)):
            fields = [fields, ]
        if (isinstance(fields, tuple)):
            fields = list(fields)

        fields_str = ",".join(fields)

        # 最后拼接并执行。
        sql = 'select %s from %s where %s order by %s' % (fields_str, tb_name, cond_str, order_by)
        row = self.sql_fetch(False, sql)

        # 将返回的tuple(array)转换成便于理解的array(dict)
        ret = []
        if (row):
            if (human):
                ret = self.__result_to_human__(row, fields)
            else:
                ret = row

        return ret

    @classmethod
    def last_insert_id(cls, table_name):
        sql = 'SELECT LAST_INSERT_ID() FROM `%s`' % table_name
        return DBConnection.sql_fetch_one(sql)[0]

    @classmethod
    def retrieve_records(cls, table_name, fields, conditions):
        pass

    @classmethod
    def insert_records(cls, table_name, fields, values):
        if not isinstance(fields, list) and not isinstance(fields, tuple): fields = (fields,)
        fields = ['`%s`' % field for field in fields]
        if not isinstance(values, list) and not isinstance(values, tuple): values = (values,)
        sql = 'INSERT INTO `%s` (%s) VALUES %s' % (table_name, (', ').join(fields), (', ').join(values))
        logger.debug(sql)
        return cls.sql_execute(sql)

    @classmethod
    def delete_records(cls, table_name, conditions):
        if isinstance(conditions, str): conditions = (conditions,)
        sql = 'DELETE FROM `%s` WHERE 1=1' % table_name
        for condition in conditions:
            sql += ' AND %s' % condition
        logger.debug(sql)
        return cls.sql_execute(sql)


class ScopedLocker(object):
    def __init__(self, sql):
        DBConnection.sql_execute(sql)

    def __del__(self):
        DBConnection.sql_execute('unlock tables')
