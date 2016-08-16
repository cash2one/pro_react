"use strict";

//初始化或更新数据列表和分页 ES6的方式
function init_or_update_list(token) {
    var isInit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var url = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
    var template_list = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var template_paginate = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
    var template_online_count = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

    var beg = 0;
    if (isInit === true) {
        var cur_url = window.location.href.split("page=");
        var template_list = $('#template_list').html();
        var template_paginate = $('#template_paginate').html();
        var template_online_count = $('#template_online_count').html();
        Mustache.parse(template_list); // optional, speeds up future uses
        Mustache.parse(template_paginate); // optional, speeds up future uses
        Mustache.parse(template_online_count); // optional, speeds up future uses
    } else {
            var cur_url = url.split("page=");
        }
    if (cur_url.length > 1) {
        beg = (cur_url[1] - 1) * records_per_page;
    }
    $.ajax({ url: admin_api + "/api/v1/online_users",
        data: { "count": records_per_page, "beg": beg },
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var data_set = {
            "online_users": data['online_users']
        };
        var counts = paginate(records_per_page, data['count']);
        var data_paginate = {
            "count": counts
        };
        var rendered_list = Mustache.render(template_list, data_set);
        var rendered_paginate = Mustache.render(template_paginate, data_paginate);
        var rendered_online_count = Mustache.render(template_online_count, {"count":data['count']});
        $('#target_list').html(rendered_list);
        $('#target_paginate').html(rendered_paginate);
        $('span.info-box-number').replaceWith(rendered_online_count);
        //初始化table行序号
        init_list_num();
        //  绑定函数
        $("ul.pagination li a").bind('click', function () {
            init_or_update_list(token, false, $(this).attr('href'), template_list, template_paginate, template_online_count);
        });
        $(".kickout").bind('click', function () {
            if(confirm("确定踢出么?")){
                var user_id = $(this).parent().parent("tr").attr("data-id");
                var platform = $(this).parent().siblings("td.lplatform").text();
                kickout_user(user_id,platform,token,template_list,template_paginate,template_online_count);
            }
        });
        init_paginate_link(data['count'], parseInt(cur_url[1]));
    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}

//初始化用户信息
function init_user_info(token) {
    var template_user_info_header = $('#template_user_info_header').html();
    var template_user_info_menu = $('#template_user_info_menu').html();
    Mustache.parse(template_user_info_header);
    Mustache.parse(template_user_info_menu);
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

//初始化表单数据
function init_form_data(token) {
    var template_select = $('#template_select').html();
    Mustache.parse(template_select); // optional, speeds up future uses
    $.ajax({ url: admin_api + "/api/v1/admin/roles",
        data: { "test": "test" },
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var data_set = {
            "roles": data
        };
        var rendered_select = Mustache.render(template_select, data_set);
        $('select.form-control').html(rendered_select);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
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

//初始化页面
function init_page(token) {
    init_menu(token);
    init_or_update_list(token);
//    init_user_info(token);
    //    init_form_data(token);
    bind_logout();
}

//删除admin
function kickout_user(user_id, platform, token, template_list, template_paginate, template_online_count) {
    $.ajax({
        url: admin_api + "/api/v1/user/kickout/" + user_id,
        data: { "platform": platform },
        type: "POST",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function(data){
        init_or_update_list(token, false, window.location.href, template_list, template_paginate, template_online_count);
    }).fail(function(jqXHR, textStatus, errorThrown){
        init_msg_modal(jqXHR);
    });
}

//TODO 绑定函数 独立成一个函数好还是不独立好
function bind_function(token, template_list, template_paginate) {
    $("ul.pagination li a").bind('click', function () {
        update_list(token, template_list, template_paginate, $(this).attr('href'));
    });
    $(".delete").bind('click', function () {
        var user_id = $(this).parent().parent("tr").attr("data-id");
        delete_admin(user_id, token);
    });
}