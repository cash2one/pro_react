// TODO 这个方法以后要变成工具方法
function init_or_update_list(token) {
    var isInit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var url = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
    var template_list = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var template_paginate = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
    var template_aggs = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
    var template_tags = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];
    var beg = 0;
    var cur_page = 1;
    s_data = search_data();
    if (isInit === true) {
        var cur_url = window.location.href.split("#page=");
        var template_list = $('#template_list').html();
        var template_paginate = $('#template_paginate').html();
        var template_aggs = $('#template_aggs').html();
        var template_tags = $('#template_tags').html();
        Mustache.parse(template_list); // optional, speeds up future uses
        Mustache.parse(template_paginate); // optional, speeds up future uses
        Mustache.parse(template_aggs); // optional, speeds up future uses
        Mustache.parse(template_tags); // optional, speeds up future uses
    } else {
        var cur_url = url.split("#page=");
    }
    cur_page = cur_url[1];
    if (cur_url.length > 1) {
        beg = (cur_page - 1) * records_per_page;
    }
    $.ajax({ url: admin_api + "/api/v1/article",
        data: { "count": records_per_page, "beg": beg ,"search":s_data},
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var data_set = {
            "articles": data['hits']['hits']
        };
        var counts = paginate(records_per_page, data['hits']['total'],parseInt(cur_page));
        var data_paginate = {
            "result_count": data['hits']['total'],
            "count": counts
        };
        var data_aggs = {
            "aggregations": data["aggregations"]
        };
        var data_tags = {
            "tags": data["tags"]
        }
        var rendered_list = Mustache.render(template_list, data_set);
        var rendered_paginate = Mustache.render(template_paginate, data_paginate);
        var rendered_aggs = Mustache.render(template_aggs, data_aggs);
        var rendered_tags = Mustache.render(template_tags, data_tags);
        $('#target_list').html(rendered_list);
        $('#target_paginate').html(rendered_paginate);
        $('#target_aggs').html(rendered_aggs);
        $('#target_tags').html(rendered_tags);
        $("span.article-box-text").each(function(){
            $(this).html(trim_content($(this).html()));
        });
        init_style();
        //  绑定函数
        $("ul.pagination li a").bind('click', function () {
            //  获取搜索条件
//            s_data = search_data();
            init_or_update_list(token, false, $(this).attr('href'), template_list, template_paginate,template_aggs,template_tags);
        });
        $("i.delete").bind('click', function () {
            if(confirm("确定删除么?")){
//                var syn_uuid = $(this).parent().siblings("span.info-box-text").attr("syn_uuid");
//                delete_syn(syn_uuid, token, template_list, template_paginate);
            }
        });
        //搜索
        $("button#btn-search").unbind("click").bind("click",function(){
            window.history.pushState({},"",cur_url[0]);
            init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
        });
        $('#reservation').on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
            window.history.pushState({},"",cur_url[0]);
            init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
        });
        $('#reservation').on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            window.history.pushState({},"",cur_url[0]);
            init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
        });
        $("input#reservation").unbind("change").bind("change",function(){
            //  获取搜索条件
            window.history.pushState({},"",cur_url[0]);
            init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
        });
        $("ul.order li").each(function(){
            $(this).unbind("click").bind('click',function(){
                $(this).parent().siblings('a').html($(this).text()+"<span class='fa fa-caret-down'></span>");
                $(this).parent().siblings("a").attr("order",$(this).find("a").attr("order"));
                window.history.pushState({},"",cur_url[0]);
                init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
            });
        });
        $(".cat-body .item-wrap .item").each(function(){
            $(this).unbind("click").bind("click",function(){
                var tag = '<li class="select2-selection__choice" name="'+
                $(this).parents(".cat-body").siblings(".cat-head").find("span").attr("cat-name")+
                '"><span class="select2-selection__choice__remove" role="presentation">×</span>'+
                $(this).parents(".cat-body").siblings(".cat-head").find("span").text()+
                ':<span class="tag_val" tag_v='+$(this).find("span.tag_val").attr("v")+'>'+$(this).find("span.tag_val").text()+
                '</span></li>';
                $("ul#target_tags").append(tag);
                $(this).parents(".cat-wrap").remove();
                window.history.pushState({},"",cur_url[0]);
                init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
            });
        });
        $("span.select2-selection__choice__remove").each(function(){
                $(this).unbind("click").bind("click",function(){
                    $(this).parent().remove();
                    window.history.pushState({},"",cur_url[0]);
                    init_or_update_list(token, false, window.location.href, template_list, template_paginate,template_aggs,template_tags);
            });
        });

        init_paginate_link(data['hits']['total'], parseInt(cur_page));
    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}

//ellipsis
function trim_content(content){
    return content.substring(0,100)+"...";
}
//初始化样式
function init_style(){
    $("a.article-box").bind("mouseenter",function(){
      $(this).find("i.op-delete").css("display","block");
      $(this).find(".articlebox-controls").css("display","block");
    });
    $("a.article-box").bind("mouseleave",function(){
      $(this).find("i.op-delete").css("display","none");
      $(this).find(".articlebox-controls").css("display","none");
    });
    $("img.article").each(function(){
        if($(this).attr("src") == ""){
//            $(this).remove();
            $(this).parent().html("NoPic");
        }
    });
}

//初始化左侧菜单栏
function init_menu(token){
    $.ajax({
        url: admin_api + "/api/v1/user",
        data: {"test":"test"},
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function(data){
        hide_or_show_menu(data['rule']);
    }).fail(function(jqXHR, textStatus, errorThrown){
        init_msg_modal(jqXHR);
    });
}

//搜索条件初始化
function search_condition_init(token){
    $("ul.search li").each(function(){
        $(this).bind('click',function(){
            $(this).parent().siblings('button').html($(this).text()+"<span class='fa fa-caret-down'></span>");
            $(this).parent().parent().siblings("input").attr("search-type",$(this).find("a").attr("type"));
        });
    });
}
//初始化页面
function init_page(token) {
    init_menu(token);
    init_or_update_list(token);
    search_condition_init();
    bind_logout();
}

//获取搜索条件
function search_data(){
    var search_field = $(".article-search input").attr("search-type");
    var search_content = $(".article-search input").val();
    var order = $("a.order").attr("order");
    var date_range = $("input#reservation").val();
    data = {
        "search_field": search_field,
        "search_content": search_content,
        "order": order,
        "date_range": date_range
    }
    $("ul#target_tags li").each(function(){
        data[$(this).attr("name")] = $(this).find("span.tag_val").attr("tag_v")+"|"+$(this).find("span.tag_val").text();
    });
    return data;
}
