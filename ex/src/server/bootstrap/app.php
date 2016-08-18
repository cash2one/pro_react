<?php

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new Laravel application instance
| which serves as the "glue" for all the components of Laravel, and is
| the IoC container for the system binding all of the various parts.
|
*/

$app = new Illuminate\Foundation\Application(
    realpath(__DIR__.'/../')
);

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Next, we need to bind some important interfaces into the container so
| we will be able to resolve them when needed. The kernels serve the
| incoming requests to this application from both the web and CLI.
|
*/

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

//配置日志
$app->configureMonologUsing(function($monolog) {
    
    $storagePath = realpath(__DIR__.'/../') . '/storage';

    $monolog->pushHandler(
        $handler = new Monolog\Handler\RotatingFileHandler($storagePath . '/logs_default/laravel.log', 5)
    );
    $handler->setFormatter(new Monolog\Formatter\LineFormatter(null, null, true, true));

    $monolog->pushHandler(
        $handler = new Monolog\Handler\RotatingFileHandler($storagePath . '/logs/laravel.log',5)
    );
    $format = "%datetime% - %channel% - %level_name% - %message% %context% %extra%\n";
    $handler->setFormatter(new Monolog\Formatter\LineFormatter($format, null, false, true));

});

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

return $app;
