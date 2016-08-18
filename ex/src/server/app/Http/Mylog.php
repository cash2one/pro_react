<?php
/**
 * Created by PhpStorm.
 * User: xzc
 * Date: 16-6-17
 * Time: 上午11:31
 */

namespace App\Http;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Illuminate\Log\Writer;

class Mylog{

    // 所有的LOG都要求在这里注册
    const LOG_ERROR = 'error';
    private static $loggers = array();
    // 获取一个实例
    public static function getLogger($type = self::LOG_ERROR, $day = 7)
    {
        if (empty(self::$loggers[$type])) {
            $save_path = storage_path().'/logs/'.$type;
            if(!is_dir($save_path)){
                mkdir($save_path,0777);
            }
            self::$loggers[$type] = new Writer(new Logger($type));
            self::$loggers[$type]->useDailyFiles($save_path.'/'. $type .'.log', $day);
        }
        $log = self::$loggers[$type];
        return $log;
    }

    public static function saveMylog($channel,$file,$message,$arr){

        // 创建日志频道
        $log = new Logger($channel);
        $log->pushHandler(new StreamHandler($file, Logger::DEBUG));

        // 添加日志记录
        $log->addDebug($message,$arr);

    }

}
