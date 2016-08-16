"use strict";

//初始化或更新数据列表和分页
function init_or_update_detail(token){
    var uuid = window.location.href.split("uuid=")[1];
    $.ajax({ url: admin_api + "/api/v1/article/" + uuid,
        data: { "test": "test" },
        crossDomain:true,
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var template_detail = $('#template_detail').html();
        var template_attrs = $('#template_attrs').html();
        Mustache.parse(template_detail); // optional, speeds up future uses
        Mustache.parse(template_attrs); // optional, speeds up future uses
        var rendered_detail = Mustache.render(template_detail, data['article_info']);
        var rendered_attrs = Mustache.render(template_attrs, data['article_info']);
        $('#target_detail').html(rendered_detail);
        $('#target_attrs').html(rendered_attrs);
    }).fail(function (jqXHR, textStatus, errorThrown) {
//        init_msg_modal(jqXHR);
    });
}

//初始化或更新数据列表和分页 ES6的方式
function init_or_update_list(token) {
    var isInit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var url = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
    var template_list = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var template_paginate = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];

    var beg = 0;
    if (isInit === true) {
        var cur_url = window.location.href.split("page=");
        var template_list = $('#template_list').html();
        var template_paginate = $('#template_paginate').html();
        Mustache.parse(template_list); // optional, speeds up future uses
        Mustache.parse(template_paginate); // optional, speeds up future uses
    } else {
            var cur_url = url.split("page=");
        }
    if (cur_url.length > 1) {
        beg = (cur_url[1] - 1) * records_per_page;
    }
    $.ajax({ url: admin_api + "/api/v1/admins",
        data: { "count": records_per_page, "beg": beg },
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var data_set = {
            "admins": data['admins']
        };
        var counts = paginate(records_per_page, data['count']);
        var data_paginate = {
            "count": counts
        };
        var rendered_list = Mustache.render(template_list, data_set);
        var rendered_paginate = Mustache.render(template_paginate, data_paginate);
        $('#target_list').html(rendered_list);
        $('#target_paginate').html(rendered_paginate);
        //初始化 table行序号
        init_list_num();
        //  绑定函数
        $("ul.pagination li a").bind('click', function () {
            init_or_update_list(token, false, $(this).attr('href'), template_list, template_paginate);
        });
        $(".delete").bind('click', function () {
            alert("确定删除么?");
            var user_id = $(this).parent().parent("tr").attr("data-id");
            delete_admin(user_id, token, template_list, template_paginate);
        });
        init_modal(token,template_list,template_paginate);
        init_paginate_link(data['count'], parseInt(cur_url[1]));
    }).fail(function (jqXHR, textStatus, errorThrown) {
//        init_msg_modal(jqXHR);
    });
}

//初始化用户信息 工具方法
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
//        init_msg_modal(jqXHR);
    });
}

//初始化页面
function init_page(token) {
    init_menu(token);
    init_or_update_detail(token);
    bind_logout();
}