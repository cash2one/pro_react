"use strict";

//初始化或更新数据列表和分页 ES6的方式
// TODO 这个方法以后要变成工具方法
function init_or_update_list(token) {

    var isInit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var url = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
    var template_list = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var template_paginate = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
    var template_online_count = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
    var query = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];
    var page;
    var platform = $(".platform select option:selected").val();
    var create_way = $(".create_way select option:selected").val();
    var product_form = $(".product_form select option:selected").val();
    var circulation_medium = $(".circulation_medium select option:selected").val();
    var start_time = $('#datetimepicker_start').val();
    var end_time = $('#datetimepicker_end').val();

    if((start_time == "") || (end_time == "")){
        start_time = "";
        end_time = "";
        if($('#tip').length > 0){
            $('#tip').remove();
        }

    }
    else if(start_time >= end_time){
        if($('#tip').length == 0){
            var tip = "<p id='tip'>"+"起始日期不得超过截止日期!"+"<\/p>";
            $('.box.box-primary').append(tip);
            $('#tip').css({"color":"red","font-size":"130%"});
        }

    }
    else{
        if($('#tip').length > 0){
            $('#tip').remove();
        }
    }

    if(platform == "不限"){
        platform = "";
    }
    if(create_way == "不限"){
        create_way = "";
    }
    if(product_form == "不限"){
        product_form = "";
    }
    if(circulation_medium == "不限"){
        circulation_medium = "";
    }


    if ($("#search").val() == ""){
        return false;
    }
    if (isInit === true) {
        var cur_url = window.location.href.split("page=");
        var template_list = $('#template_list').html();
        var template_paginate = $('#template_paginate').html();
        var template_online_count = $('#template_online_count').html();
        Mustache.parse(template_list); // optional, speeds up future uses
        Mustache.parse(template_paginate); // optional, speeds up future uses
        Mustache.parse(template_online_count); // optional, speeds up future uses
    }
    else {
            var cur_url = url.split("page=");
        }
    if (cur_url.length > 1) {
        page = (cur_url[1] - 1);
    }

    $.ajax({ url: media_api + "/api/v1/media/search",
        data: { "query": query, "page": page, "platform": platform, "create_way": create_way, "product_form": product_form,
        "circulation_medium": circulation_medium,"start_time": start_time, "end_time": end_time},
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
         var media_data = data['media'];
         for(var i=0; i<media_data.length; i++){
            if(media_data[i].hasOwnProperty("tags")){

                for(var j=0; j<media_data[i]["tags"].length; j++){
                    var tmp = media_data[i]["tags"][j];
                    media_data[i]["tags"][j] = {"tag": tmp};
                }
            }

            if(media_data[i].hasOwnProperty("channel")){
                for(var j=0; j<media_data[i]["channel"].length; j++){
                    var tmp = media_data[i]["channel"][j];
                    media_data[i]["channel"][j] = {"channel_title": tmp};
                }
            }

         }

         var data_set = {
            "media": media_data
        };
         var data_count = {
            "count": data['count']
         };

        render_page(token, template_list, template_paginate, template_online_count, query, data_set, data_count, cur_url);

    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}


//初始化用户信息
//TODO 这个也应该是工具方法
function init_user_info(token) {
    var template_user_info_header = $('#template_user_info_header').html();
    var template_user_info_menu = $('#template_user_info_menu').html();
    Mustache.parse(template_user_info_header); // optional, speeds up future uses
    Mustache.parse(template_user_info_menu); // optional, speeds up future uses
    $.ajax({ url: admin_api + "/api/v1/user",
        data: { "test": "test" },
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var data_set = {
            "user_info": data
        };
        var rendered_user_info_header = Mustache.render(template_user_info_header, data);
        var rendered_user_info_menu = Mustache.render(template_user_info_menu, data);
        $('#target_user_info_header').html(rendered_user_info_header);
        $('#target_user_info_menu').html(rendered_user_info_menu);
        $("a#logout").bind('click',function(){
            $.removeCookie('user_token', { domain: admin_domain });
            window.location.href = admin_api + "/login";
        });
    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}


//初始化页面
function init_page(token) {
    init_menu(token);
    init_datetimepicker();
    var query = $("#search").val();
    if(query == ""){
        init_search(token);
    }
    else{
        init_or_update_list(token ,true, undefined, undefined, undefined, undefined, query);
    }
    bind_logout();


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


//首次搜索
function init_search(token){
    $("#search").unbind('keypress').bind('keypress',function(event){
        if(event.keyCode == "13")
            {
                var query = $("#search").val();
                init_or_update_list(token ,true, undefined, undefined, undefined, undefined, query);
                return false;
            }
    });
    $("#search_btn").unbind('click').bind('click',function(event){
            var query = $("#search").val();
            init_or_update_list(token ,true, undefined, undefined, undefined, undefined, query);
    });

}
//过滤项改变，按钮点击等事件触发搜索
function search_media(token,template_list, template_paginate, template_online_count)
{
    $("#search").unbind('keypress').bind('keypress',function(event){
        if(event.keyCode == "13")
            {
                research_data(token, template_list, template_paginate, template_online_count)
                return false;
            }
    });

    $("#search_btn").unbind('click').bind('click',function(event){
        research_data(token, template_list, template_paginate, template_online_count)
    });

    $("select").unbind('change').bind('change',function(event){
        research_data(token, template_list, template_paginate, template_online_count)

    });

    $('#datetimepicker_start').datetimepicker({
        }).on('changeDate', function(ev){
        if($('#datetimepicker_end').val() != ""){
            research_data(token, template_list, template_paginate, template_online_count)
        }

    });

    $('#datetimepicker_end').datetimepicker({
        }).on('changeDate', function(ev){
        if($('#datetimepicker_start').val() != ""){
            research_data(token, template_list, template_paginate, template_online_count)
        }

    });

    $("#clear_btn").unbind('click').bind('click',function(event){
        $('#datetimepicker_start').val("");
        $('#datetimepicker_end').val("");
        research_data(token, template_list, template_paginate, template_online_count);
    });

    init_modal(token, template_list, template_paginate, template_online_count);

    $(".delete").unbind('click').on('click', function(event){
        var mid = $(this).parents(".media_info").find(".mid").text().split(" ")[1];
        console.log(mid);
        if(confirm("确定删除么?")){
            delete_media(token, template_list, template_paginate, template_online_count, mid);
            //setTimeout(research_data(token, template_list, template_paginate, template_online_count),5000);

        }
    });

}

//重新请求数据，还原分页
function research_data(token, template_list, template_paginate, template_online_count){
        console.log("ttt");
        var query = $("#search").val();
        var cur_url = window.location.href.split("#page=");
        window.history.pushState({},"",cur_url[0]);
        init_or_update_list(token ,false, window.location.href, template_list, template_paginate, template_online_count, query);
}

//请求查询结果总数并渲染页面
function render_page(token, template_list, template_paginate, template_online_count, query, data_set, data_count, cur_url)
{

             var counts = paginate(records_per_page_media, data_count['count']);
             var data_paginate = {
                "count": counts
             };

             var rendered_paginate = Mustache.render(template_paginate, data_paginate);
             var rendered_list = Mustache.render(template_list, data_set);
             var rendered_online_count = Mustache.render(template_online_count, data_count);
             $('#target_list').html(rendered_list);
             $('#target_paginate').html(rendered_paginate);
             $('#target_online_count').html(rendered_online_count);
             search_media(token, template_list, template_paginate, template_online_count);
             //  绑定函数
             $("ul.pagination li a").bind('click', function () {
                init_or_update_list(token, false, $(this).attr('href'), template_list, template_paginate, template_online_count, query);

             });

             init_paginate_link(data_count['count'], parseInt(cur_url[1]));


}

//初始化模态框数据
function reset_form(modal,button){
    var avater =  button.parents(".info-box.white").find(".img img").attr('src');
    var name = button.parents(".info-box.white").find(".name a").text();
    var auth = button.parents(".info-box.white").find(".auth").text().split(" ")[1];
    var crawler_at = button.parents(".info-box.white").find(".crawler_at").text().split(": ")[1];
    var crawler_status = button.parents(".info-box.white").find(".crawler_status").text().split(" ")[1];
    var product_form = button.parents(".info-box.white").find(".product_form").text();
    var create_way = button.parents(".info-box.white").find(".create_way").text().split(" ")[1];
    var circulation_medium = button.parents(".info-box.white").find(".circulation_medium").text().split(" ")[1];
    var platform_name = button.parents(".info-box.white").find(".platform").text().split(" ")[1];
    var platform_mid = button.parents(".info-box.white").find(".platform").text().split(" ")[2];
    var influence_text = button.parents(".info-box.white").find(".influence_text").text();
    var rank_text = button.parents(".info-box.white").find(".rank_text").text();
    var desc = button.parents(".info-box.white").find(".desc").text();
    //console.log(avater);
    console.log("rank:   "+rank_text);

    modal.find('select#product_form').val(product_form);
    modal.find('input#name').val(name);
    modal.find('select#create_way').val(create_way);
    modal.find('select#circulation_medium').val(circulation_medium);
    modal.find('input#effect').val(influence_text);
    modal.find('input#rank').val(rank_text);
    modal.find('select#platform_name').val(platform_name);
    modal.find('input#auth').val(auth);
    modal.find('input#crawler_at').val(crawler_at);
    modal.find('input#crawler_status').val(crawler_status);
    modal.find('input#avater').val(avater);
    modal.find('textarea#desc').val(desc);
    console.log(modal.find('.form-group input#rank').val());

    var tags = new Array();
    button.parents(".info-box.white").find(".tag span.info-box-text").each(function(index){
        tags[index] = $(this).text();
    });
    modal.find('textarea#tags').val(tags);

    var channels = new Array();
    button.parents(".info-box.white").find(".channel span.info-box-text").each(function(index){
        channels[index] = $(this).text();
    });
    modal.find('textarea#channel').val(channels);
}

//初始化模态框响应函数
function init_modal(token, template_list, template_paginate, template_online_count){
    //模态框绑定函数
        $('#myModal').unbind('show.bs.modal').on('show.bs.modal', function (event) {
            var button = $(event.relatedTarget);
            var modal_title = button.data('title');
            var modal = $(this);
            modal.find('.modal-title').text(modal_title);

            reset_form(modal,button);
            var is_valid = 0;
            modal.find('input#crawler_at').unbind('change').bind('change', function(event){
                var date_format = /^\d{4}-(?:0\d|1[0-2])-(?:[0-2]\d|3[01])( (?:[01]\d|2[0-3])\:[0-5]\d\:[0-5]\d)?$/;
                console.log("changing");
                if(date_format.test($(this).val())){
                    is_valid = 1;
                    $('#format_tip').remove();
                }
                else{
                    is_valid = 0;
                    if($('#format_tip').length == 0){
                        $('.form-group.crawler_at label').append("<p id='format_tip'>"+" 输入请符合yyyy-mm-dd hh:mm:ss规范!"+"<\/p>");
                        $('#format_tip').css({"color":"red","font-size":"85%"});
                    }

                }
            });
            var url = button.parents(".info-box.white").find(".name a").attr('href');
            console.log(url);
            var mid = button.parents(".info-box.white").find(".mid").text().split(" ")[1];
            var code = button.parents(".info-box.white").find(".code").text().split(" ")[1];
            modal.find("#add").unbind('click').on('click', function(event){
                var avater = modal.find('input#avater').val();
                var name = modal.find('input#name').val();
                var auth = modal.find('input#auth').val();
                var crawler_at = modal.find('input#crawler_at').val();
                var crawler_status = modal.find('input#crawler_status').val();
                var product_form = modal.find('select#product_form option:selected').val();
                var create_way = modal.find('select#create_way option:selected').val();
                var circulation_medium = modal.find('select#circulation_medium option:selected').val();
                var platform_name = modal.find('select#platform_name option:selected').val();
                var platform_mid = modal.find('select#platform_name option:selected').attr('platform_mid');
                var influence_text = modal.find('input#effect').val();
                var rank_text = modal.find('input#rank').val();
                var desc = modal.find('textarea#desc').val();
                var tag_text = modal.find('textarea#tags').val();
                var channel_text = modal.find('textarea#channel').val();
                tags = tag_text.split(/[, ]/);
                channel = channel_text.split(/[, ]/);
                console.log(tags);
                var data = {
                    "code": code,
                    "name": name,
                    "tags": tags,
                    "url": url,
                    "create_way": create_way,
                    "influence": influence_text,
                    "mid": mid,
                    "rank": rank_text,
                    "crawler_at": crawler_at,
                    "crawler_status": crawler_status,
                    "platform_name": platform_name,
                    "platform_mid": platform_mid,
                    "auth": auth,
                    "channel": channel,
                    "avater": avater,
                    "desc": desc,
                    "product_form": product_form,
                    "circulation_medium": circulation_medium

                };
                console.log(data);

                if(is_valid == 1){
                    edit_media(token, template_list, template_paginate, template_online_count, data);
                    $('#myModal').modal('hide');
                }

            });



   });
}
//请求删除媒体
function delete_media(token, template_list, template_paginate, template_online_count, mid){
    $.ajax({ url: media_api + "/api/v1/media/del_media",
        data: { "mid": mid},
        type: "DELETE",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        console.log(data);
        setTimeout(function(){research_data(token, template_list, template_paginate, template_online_count)},1000);


    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}
//请求修改媒体
function edit_media(token, template_list, template_paginate, template_online_count, data){
    $.ajax({ url: media_api + "/api/v1/media/edit_media",
        data:  data,
        type: "PUT",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        console.log("research_func");
        setTimeout(function(){research_data(token, template_list, template_paginate, template_online_count)},1000);



    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}
//初始化日期控件
function init_datetimepicker(){
    var current_time = new Date();
    var tomorrow_time = formattomorrowTime(current_time);
    current_time = formatDateTime(current_time);
          $('.datetimepicker1').datetimepicker({
          format: 'yyyy-mm-dd',
          minView: 2,
          endDate: tomorrow_time,
          autoclose: true
        });
    //$('#datetimepicker_end').datetimepicker('setDate', (new Date()) );
}

//日期格式化
var formattomorrowTime = function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + (d+1)) : (d+1);
    return y + '-' + m + '-' + d;
};

var formatDateTime = function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
};