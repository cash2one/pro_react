<?php namespace App\Http\Controllers\BigData;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Input;

class NavController extends Controller {


    /**
     * Display a listing of the resource.
     *
     * @return Response
     *
     * 获取大数据导航分类列表信息
     */
    public function index()
    {
        $data = array();

        $authoritys = config('nav.authority');
        $data['authority'] = array();
        foreach ($authoritys as $value){

            $authority = array();
            $authority['name']  = $value['name'];
            $authority['title'] = config('nav.category.authority');
            $authority['info']  = $value['info'];
            $authority['url']   = $value['url'];

            array_push($data['authority'],$authority);

        }

        $industrys = config('nav.industry');
        $data['industry'] = array();
        foreach ($industrys as $value){

            $industry = array();
            $industry['name']  = $value['name'];
            $industry['title'] = config('nav.category.industry');
            $industry['info']  = $value['info'];
            $industry['url']   = $value['url'];

            array_push($data['industry'],$industry);

        }

        $indices = config('nav.index');
        $data['index'] = array();
        foreach ($indices as $value){

            $index = array();
            $index['name']  = $value['name'];
            $index['title'] = config('nav.category.index');
            $index['info']  = $value['info'];
            $index['url']   = $value['url'];

            array_push($data['index'],$index);

        }

        $sales = config('nav.sales');
        $data['sales'] = array();
        foreach ($sales as $value){

            $sale = array();
            $sale['name']  = $value['name'];
            $sale['title'] = config('nav.category.sales');
            $sale['info']  = $value['info'];
            $sale['url']   = $value['url'];

            array_push($data['sales'],$sale);

        }

        return response()->json($data);
        
    }

    //获取搜索工具真实url
    public function getNavUrl(){

        $key    = Input::get('key');
        $tools  = Input::get('tools');

        //搜索工具数据
        $tools_list  = array_merge(config('nav.authority'),config('nav.industry'),config('nav.index'),config('nav.sales'));

        $data = array();

        if(empty($tools) && empty($key)){

            foreach ($tools_list as $tool){
                $t['name'] = $tool['name'];
                $t['url'] = $tool['url'];
                array_push($data,$t);
            }

        }else{

            if(!empty($tools)){

                if(!is_array($tools)){
                    $tools = explode(',',$tools);
                }

                $tools_data = array();
                foreach ($tools_list as $tool){

                    if(in_array($tool['name'],$tools)){
                        array_push($tools_data,$tool);
                    }

                }

                foreach ($tools_data as $tool){

                    $t['name']          = $tool['name'];

                    if(empty($key)){
                        $t['search_type'] = 'normal';
                        $t['url'] = $tool['url'];
                    }else{

                        switch ($tool['search_type']){

                            case 'normal':
                                $t['search_type'] = 'normal';
                                $url = $tool['search_url'].$key;
                                break;

                            case 'normal/':
                                $t['search_type'] = 'normal';
                                $url = $tool['search_url'].$key.'/';
                                break;

                            case 'post':
                                $t['search_type'] = 'post';
                                $url = $tool['search_url'];
                                break;

                            case 'processed':
                                $t['search_type'] = 'processed';
                                $url = $tool['search_url'];
                                break;

                            case 'string_encode_gbk':
                                $t['search_type'] = 'normal';
                                $s_key = urlencode(mb_convert_encoding($key, 'gb2312'));
                                $url = $tool['search_url'].$s_key;
                                break;

                            case 'string_encode_js':
                                $t['search_type'] = 'normal';
                                $s_key = str_replace('\\','%',json_encode($key));
                                $url = $tool['search_url'].$s_key;
                                break;

                        }

                        $t['url'] = $url;

                    }

                    $t['search_form'] = $tool['search_form'];

                    array_push($data,$t);

                }
            }
        }

        return response()->json($data);

    }


}
