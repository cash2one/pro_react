#coding:utf-8

__author__ = 'yyp'

# 与时间相关的工具方法
from datetime import datetime, timedelta

def cur_datetime():
    '''
    获取当前日期时间
    :return: 当前日期时间
    '''
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def pre_cur_datetime(minutes=1):
    '''
    当前时间提前x分钟的时间 默认是1分钟 精确到毫秒单位
    :param minutes: 提前的分钟数
    :return: 当前时间提前x分钟的时间
    '''
    return ((datetime.now()-timedelta(seconds=1))-timedelta(minutes=minutes-1)).strftime('%Y-%m-%d %H:%M:00.000')

def str_to_datetime(str,format='%Y-%m-%d %H:%M:%S.%f'):
    '''
    字符串时间转换到时间对象
    :param str: 时间的字符串
    :param format: 格式
    :return: 时间对象
    '''
    return datetime.strptime(str,format)

def advanced_pre_datetime(type='M',count=1,convert_to_str=False,format='%Y-%m-%d %H:%M:%S'):
    """
    返回当前时间提前X时间的时间,可以是字符串类型也可以是日期时间类型
    :param type: 提前的时间的单位
    :param count: 提前的时间的多少
    :param convert_to_str: 是否转换为字符串
    :param format: 日期时间格式
    :return:
    """
    if type == 'MCS':
        dt = datetime.now()-timedelta(microseconds=count)
    elif type == 'MS':
        dt = datetime.now()-timedelta(milliseconds=count)
    elif type == 'S':
        dt = datetime.now()-timedelta(seconds=count)
    elif type == 'H':
        dt = datetime.now()-timedelta(hours=count)
    elif type == 'd':
        dt = datetime.now()-timedelta(days=count)
    elif type == 'w':
        dt = datetime.now()-timedelta(weeks=count)
    else:
        dt = datetime.now()-timedelta(minutes=count)
    if convert_to_str:
        return dt.strftime(format)
    else:
        return dt