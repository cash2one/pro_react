"use strict";

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
            if(confirm("确定删除么?")){
                var user_id = $(this).parent().parent("tr").attr("data-id");
                delete_admin(user_id, token, template_list, template_paginate);
            }
        });
        init_modal(token,template_list,template_paginate);
        init_paginate_link(data['count'], parseInt(cur_url[1]));
    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}

function reset_form(modal){
    modal.find("input#tel").val("");
    modal.find("input#name").val("");
    modal.find("select option").removeAttr("selected");
}

//初始化模态框响应函数
function init_modal(token,template_list,template_paginate){
    //模态框绑定函数
    $('#myModal').unbind('show.bs.modal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget);
      var modal_title = button.data('title');
      var modal = $(this);
      modal.find('.modal-title').text(modal_title);
      if(button.hasClass('add') === true){
        reset_form(modal);
        modal.find(".modal-footer #edit").hide();
        modal.find(".modal-footer #add").show();
      }else if(button.hasClass('edit') === true){
        reset_form(modal);
        modal.find(".modal-footer #add").hide();
        modal.find(".modal-footer #edit").show();
        modal.find("input#tel").val(button.parent().siblings("td.tel").text());
        modal.find("input#name").val(button.parent().siblings("td.name").text());
        var roles = new Array();
        button.parent().siblings("td").find("ul.role li").each(function(index){
            roles[index] = $(this).attr('role-name');
        });
        modal.find("select option").each(function(){
            if($.inArray($(this).val(),roles) !== -1){
                $(this).attr("selected","selected");
            }
        });
        roles=null;
      }
        $("button#add").unbind('click').on('click', function(){
            var roles = new Array();
            $("#myModal").find("select option:selected").each(function(index){
                roles[index] = $(this).val();
            });
            var data = {
                "user_name":$("#myModal input#name").val(),
                "telephone":$("#myModal input#tel").val(),
                "role[]":roles
            }
            add_admin(token,data,template_list,template_paginate);
            $('#myModal').modal('hide')
        });
        $("button#edit").unbind('click').bind('click', function(){
            var roles = new Array();
            $("#myModal").find("select option:selected").each(function(index){
                roles[index] = $(this).val();
            });
            var data = {
                "user_id":button.parent().parent("tr").attr("data-id"),
                "user_name":$("#myModal input#name").val(),
                "telephone":$("#myModal input#tel").val(),
                "role[]":roles
            }
            update_admin(token,data,template_list,template_paginate);
            $('#myModal').modal('hide')
        });
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
    init_form_data(token);
//    init_modal(token);
    bind_logout();
}

//添加admin
function add_admin(token,data,template_list,template_paginate){
    $.ajax({
        url: admin_api + "/api/v1/admins",
        data: data,
        type: "POST",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function(data){
        init_or_update_list(token, false, window.location.href, template_list, template_paginate);

    }).fail(function(jqXHR, textStatus, errorThrown){
        init_msg_modal(jqXHR);
    });
}

//更新admin
function update_admin(token,data,template_list,template_paginate){
    $.ajax({
        url: admin_api + "/api/v1/admins",
        data: data,
        type: "PUT",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function(data){
        init_or_update_list(token, false, window.location.href, template_list, template_paginate);
    }).fail(function(jqXHR, textStatus, errorThrown){
        init_msg_modal(jqXHR);
    });
}

//删除admin
function delete_admin(user_id, token, template_list, template_paginate) {
    $.ajax({
        url: admin_api + "/api/v1/admins/" + user_id,
        data: { "test": "test" },
        type: "DELETE",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function(data){
        init_or_update_list(token, false, window.location.href, template_list, template_paginate);
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