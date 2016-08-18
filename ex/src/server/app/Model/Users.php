<?php
/**
 * Created by PhpStorm.
 * User: zz
 * Date: 16/8/3
 * Time: 下午5:26
 */
namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Users extends Model
{
    //
    protected $table = 'users';
    protected $guarded = [''];
    public $timestamps = false;
    protected $connection = 'mysql2';

}