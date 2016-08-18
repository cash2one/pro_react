1. 将star-lord-ex.conf加入到nginx的vhost目录中。
2. 修改star-lord-ex.conf中的root目录到本地机webserver的全路径。
3. sudo nginx -s reload
4. 在/etc/hosts文件中增加下面一行。
    127.0.0.1   www.star-lord-ex.com;

