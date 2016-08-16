这是放置服务端代码的地方。

配置说明：
1. 修改conf/nginx-home.conf文件中的ROOT路径到真实路径中。
2. 在nginx的配置文件中加入include 此项目的配置文件。
2. 重新加载配置文件。
3. 在/etc/hosts文件中增加：
     127.0.0.1  home.puzhizhuhai.com
4. 依赖库
    * xpinyin
    * Pillow
    * requests
    * tornado
    * redis
    * sqlalchemy
    * pyrestful
    * futures
    * elasticsearch
    * MySQLdb
    * pyrestful
