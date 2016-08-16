"use strict";

//全局变量，用于初始化错误提示框
var is_init_modal = 1;
var template_msg = "";
$(document).ready(function () {
    var token = $.cookie('user_token');
    //var token = "a0b8efbec7fcb9c6c890049d929fa0e4";
    init_page(token);
});

//绑定退出函数
function bind_logout(){
    $("a#logout").bind('click',function(){
        $.removeCookie('user_token', { domain: admin_domain,path: "/" });
        //$.cookie('user_token',null);
        //$.cookie('user_token', '', { expires: -1 });
        window.location.href = admin_host;
    });
}

// 初始化分页按钮工具方法
function init_paginate_link(count) {
    var cur_page = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    if(isNaN(cur_page)){
        var cur_page = 1;
    }
    var page_count = Math.ceil(count / records_per_page);
    if(page_count === 1){
            $("a.backward").addClass('disabled');
            $("a.forward").addClass('disabled');
    }else{
        if (cur_page == page_count) {
            $("a.backward").addClass('disabled');
            $("a.forward").attr("href", "#page=" + (cur_page - 1));
        } else if (cur_page == 1) {
            $("a.forward").addClass('disabled');
            $("a.backward").attr("href", "#page=" + (cur_page + 1));
        } else {
            $("a.backward").attr("href", "#page=" + (cur_page + 1));
            $("a.forward").attr("href", "#page=" + (cur_page - 1));
        }
    }
}

//分页工具方法

function paginate(records_per_page, count) {
    var cur_page = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
    if(isNaN(cur_page)){
        var cur_page = 1;
    }
    var counts = new Array();
    var page_count = Math.ceil(count / records_per_page);
    if(page_count > 99){
        page_count = 99;
    }
    var temp = 0;
    if(page_count <= show_page_count+1){
        for(var i = 0;i < page_count;i++){
            counts[i] = {
                "page_num": i + 1,
                "page_link": "#page=" + (i + 1)
            }
        }
    }else{
        if(cur_page - 1 > 3){
            counts[0] = {
                "page_num": 1,
                "page_link": "#page=" + 1
            }
            counts[1] = {
                "page_num": "...",
                "page_link": "#page=" + (cur_page - 4)
            }
            var j = 2;
            for (var i = 2; i < 5; i++) {
                counts[i] = {
                    "page_num": cur_page - j,
                    "page_link": "#page=" + (cur_page - j)
                }
                j--;
            }
            temp = 5;
        }else{
            for (var i = 0; i < cur_page; i++) {
                counts[i] = {
                    "page_num": i + 1,
                    "page_link": "#page=" + (i + 1)
                }
            }
            temp = cur_page;
        }
        if(page_count - cur_page > 3){
            var j = 1;
            for (var i = temp; i < temp + 2; i++) {
                counts[i] = {
                    "page_num": cur_page + j,
                    "page_link": "#page=" + (cur_page + j)
                }
                j++;
            }
            counts[temp+2] = {
                "page_num": "...",
                "page_link": "#page=" + (cur_page + 4)
            }
            counts[temp+3] = {
                "page_num": page_count,
                "page_link": "#page=" + page_count
            }
            temp = temp + 4;
        }else{
            var j = 1;
            for (var i = temp; i < temp + page_count - cur_page; i++) {
                counts[i] = {
                    "page_num": cur_page + j,
                    "page_link": "#page=" + (cur_page + j)
                }
                j++;
            }
        }
    }
    return counts;
}

//初始化table列表 序号
function init_list_num(){
    $("td.num").each(function(index){
        $(this).text(index+1);
    });
}

//错误信息提示modal
function init_msg_modal(jqXHR){
    if(is_init_modal==1){
        template_msg = $('#template_msg').html();
        Mustache.parse(template_msg); // optional, speeds up future uses
        is_init_modal = 0;
    }

    var rendered_msg = Mustache.render(template_msg, {"msg":$.parseJSON(jqXHR.responseText)['msg']});
    $('#target_msg').html(rendered_msg);
    console.log("aaa"+$('#target_msg').text());
    console.log("aaa"+$.parseJSON(jqXHR.responseText)['msg']);
    $('#msg_modal').unbind('hidden.bs.modal').bind('hidden.bs.modal', function (e) {
        if($.parseJSON(jqXHR.responseText)['msg']=='人品已过期，带您重新登录'){

            $.removeCookie('user_token', { domain: admin_domain });
            window.location.href = admin_host;
        }

    })
    $("#msg_modal").modal();
}

//显示隐藏侧边栏
function hide_or_show_menu(rules){
    var rule_list = [
        "rule_sys_manager_syndicate",
        "rule_sys_manager_super",
        "rule_sys_manager_adminer",
        "rule_sys_manager_article",
        "rule_sys_media_audit",
        "rule_sys_list_newly_added",
        "rule_sys_list_login"
    ]
    menu(rule_list,rules);
    check_child_available();
}

//根据权限显示和隐藏菜单
function menu(rule_list,rules){
    $.each(rule_list,function(index,value){
        if ($.inArray(value,rules) === -1){
            $("li#"+value).remove();
        }
    });
}

//查看是列表是否有孩子 没有则隐藏
function check_child_available(){
    $("ul.treeview-menu").each(function(){
        if($(this).find("li").length === 0){
            $(this).parent("li.treeview").hide();
        }
    });
}
//confirm
//function confirm(trigger){
////    alert($(trigger).html());
//    var flag = $(trigger).confirm({
////                var action = $(trigger).attr("tooltip");
////                title: "删除"+action+"",
////                text: action+"请慎重,确定"+action+"么?",
//                title: "删除确定",
//                text: "请慎重,确定删除么?",
//                confirm: function(button) {
//                    return true;
//                },
//                cancel: function(button) {
//                    return false;
//                },
//                confirmButton: "确定",
//                cancelButton: "取消"
//    });
//    return flag
//}