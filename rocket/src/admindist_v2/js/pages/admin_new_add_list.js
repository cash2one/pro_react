
function updateData(token,template_list,template_paginate)
{
      var date = new Date();
      $('#datetimepicker').datetimepicker({
        }).on('changeDate', function(ev){
        var time = $('#datetimepicker').val();
         init_or_update_list(token, false, window.location.href, template_list, template_paginate, time);
    });
}



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
    var current_time = new Date();
    tomorrow_time = formattomorrowTime(current_time);
    current_time = formatDateTime(current_time);
          $('#datetimepicker').datetimepicker({
          format: 'yyyy-mm-dd',
          minView: 2,
          endDate: tomorrow_time,
          autoclose: true
        });
    $('#datetimepicker').datetimepicker('setDate', (new Date()) );
    init_or_update_list(token ,true, undefined, undefined, undefined, current_time);
    bind_logout();
}

//初始化或更新数据列表和分页 ES6的方式
function init_or_update_list(token) {
    var isInit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var url = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
    var template_list = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var template_paginate = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
    var time = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

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
    $.ajax({ url: admin_api + "/api/v1/new_add_users",
        data: { "count": records_per_page, "beg": beg, "date": String(time) },
        type: "GET",
        beforeSend: function beforeSend(xhr) {
            xhr.setRequestHeader('user_token', token);
        }
    }).done(function (data) {
        var data_set = {
            "new_add_users": data['new_add_users']
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
            init_or_update_list(token, false, $(this).attr('href'), template_list, template_paginate, time);
        });
        updateData(token,template_list,template_paginate);
        //init_modal(token,template_list,template_paginate);
        init_paginate_link(data['count'], parseInt(cur_url[1]));
    }).fail(function (jqXHR, textStatus, errorThrown) {
        init_msg_modal(jqXHR);
    });
}

