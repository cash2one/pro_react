/**
 * 兴趣图谱
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * author: qianjing
 * version: 1.0.2
 * date: 2012-12-20
 *
 * 创建兴趣图谱组件
 * @name RelatedSearch
 * @grammar new RelatedSearch(containerId, data);   
 * @param {String} containerId 容器id
 * @param {Object} data 组件所需要的数据格式：
    {
        "id": 1559,
        "keyword": "\u5341\u4e8c\u751f\u8096",
        "nodes": {
            "3937": {
                "id": 3937,
                "keyword": "\u4e0b\u843d",
                "boardid": 0,
                "tag": 2,
                "pivot": 0
            }, ...
        },
        "edges": [{
            "from": 1559,
            "to": 1984,
            "links": [{
                "url": "http:\/\/www.027art.com\/news\/yanyuanbiao\/432145.html",
                "title": "\u5341\u4e8c\u751f\u8096\u6f14\u5458\u8868"
            }, ...]
        }, ...]
    }
 */

(function(window){
    var BASE_URL = "http://top.baidu.com/", BASEURL = "http://top.bdimg.com/frontend", FLASH_URL= "http://top.baidu.com/frontend";
    //基础常量配置
    var CONS = {
        "SVGNS" : "http://www.w3.org/2000/svg",         //创建SVG元素 document.createElementNS('http://www.w3.org/2000/svg','svg'); 
        "SVGXLINK" : "http://www.w3.org/1999/xlink",    //创建SVG链接
        "CANVAS" : {
            "WIDTH" : 780,                              //默认画布的宽度
            "HEIGHT" : 420                              //默认画布的高度
        },
        "RELATELINE" : {                                //关系线M.RelateLine
            "LINE": {                                   //RelateLine中的线
                "STROKEWIDTH_HIDDEN" : 5,               //隐藏线的宽度,线太细了用户选不中
                "STROKEWIDTH" : 1,                      //线宽
                "STROKE" : "#E9F8FF",                   //线的颜色
                "STROKE_STRESS":"#57CBF2"               //线高亮
            },
            "RECT": {                                   //RelateLine中的圆角矩形
                "WIDTH" : 14,                           //宽
                "HEIGHT" : 14,                          //高
                "RX" : 3,                               //圆角x值
                "RY" : 3,                               //圆角y值
                'FILL':"#D1EFFE",                       //填充色
                'STROKE':"#D1EFFE",                     //边框色
                'STROKEWIDTH':"1",                      //边框宽度
                'FILL_STRESS':"#57CBF2",                //填充色高亮
                'STROKE_STRESS':"#57CBF2"               //边框色高亮
            },
            "TEXT":{                                    //RelateLine中的文字
                "FONTSIZE" : "13px",                    
                "COLOR":"#FFF"                          
            }
        },
        "CORE" : {                                      //关联中心词 M.Core
            "HREF" : BASEURL + "/static/detail/RelatedSearch/images/main.png",    //中心图片
            "WIDTH" : 100,                              
            "HEIGHT" : 103,                             
            "FONTWEIGHT" : 500,                         
            "FONTSIZE" : "20px",                        
            "COLOR" : "#FFF"                            
        },
        "PARALLEL" : {                                  //通用关联词(平行词) M.Parallel
            "R" : 35,                                   //圆的半径
            "STROKEWIDTH" : 1,
	        "STROKE" : "#ffa200",                       
            "FILL" : "#fff",                            
            "FONTWEIGHT" : 400,                         
            "FONTSIZE" : "14px",                        
            "COLOR" : "#ffa200"                        
        },
        "SPECIFIC" : {                                  //个性关联词(特有词) M.Specific
            "R" : 35,
    	    "STROKEWIDTH" : 1, 
    	    "STROKE" : "#2c97de",
            "FILL" : "#3a99d8",
            "FONTWEIGHT" : 400,
            "FONTSIZE" : "14px",
            "COLOR" : "#fff"  
        },
        "TIMELINESS" : {                                //时效关联词 M.Timeliness
            "R" : 35,
            "STROKEWIDTH" : 1,
            "STROKE" : "#f32770",
            "FILL" : "#fff",
            "FONTWEIGHT" : 400,
            "FONTSIZE" : "14px",
            "COLOR" : "#f32770"
        },
        "LESSER" : {                                    //以上三种词性的弱化处理 离中心词比较远的节点需要弱化处理
            "R" : 30,
            "STROKEWIDTH" : 1,
            "STROKE" : "#82BDF5",
            "FILL" : "#94CFF6",
            "FONTWEIGHT" : 400,
            "FONTSIZE" : "12px",
            "COLOR" : "#fff"
        }
    };
    
    //基础工具库
    var Utils = {
        //增加事件监听
        "addEvent" : function (elm, evType, fn, useCapture){
            if (elm.addEventListener){
                elm.addEventListener(evType, fn, useCapture);
                return true;
            } else if (elm.attachEvent) {
                var r = elm.attachEvent('on' + evType, fn);
                return r;
            } else {
                elm['on' + evType] = fn;
            }
        },
        //移除事件监听
        "removeEvent" : function (elm, evType, fn, useCapture){
            if(!elm){return;}
            if (elm.removeEventListener){
                elm.removeEventListener(evType, fn, useCapture);
                return true;
            } else if (elm.detachEvent) {
                var r = elm.detachEvent('on' + evType, fn);
                return r;
            } else {
                elm['on' + evType] = null;
            }
        },
        //阻止事件传播
        "stopPropagation" : function (e){
            var e = e || window.event;
            if(e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        //整数转换成角度 90 => 90度
        "getAngle" : function (angle){
            if (angle >= 0) {
                return Math.PI * angle / 180;
            } else {
                return Math.PI * (360 + angle) / 180;
            }
        },
        //判断是否为数组
        "isArray" : function (obj){
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        //与appendChild相反 在前面插入
        "previousChild" : function (node, parentNode){
            var firstChild = parentNode.firstChild;
            return parentNode.insertBefore(node, firstChild);
        },
        //取得当前鼠标位置
        "getPointerPosition" : function (e) {
            var ev = e || window.event;
            var x = ev.pageX || (ev.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
            var y= ev.pageY || (ev.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
            return {'x':x, 'y':y};
        },
        //获取当前对象相对原点的位置
        "getPosition" : function(e){
            var left = 0, top   = 0;

            while (e.offsetParent){
                left += e.offsetLeft;
                top  += e.offsetTop;
                e    = e.offsetParent;
            }

            left += e.offsetLeft;
            top  += e.offsetTop;

            return {x:left, y:top};
        },
        //获取event对象
        "getEvent" : function (e){
            return e || window.event;
        },
        //获取target
        "getTarget" : function (e){
            var ev = e || window.event;
            return ev.target || ev.srcElement;
        },
        //检查一个对象是否包含在另外一个对象中
        "contains" : function (parentNode, childNode) {
            if (parentNode.contains) {
                return parentNode != childNode && parentNode.contains(childNode);
            } else {
                return !!(parentNode.compareDocumentPosition(childNode) & 16);
            }
        },
        //检查鼠标是否真正从外部移入或者移出对象的函数
        "checkHover" : function (e,target){
            var ev = Utils.getEvent(e);
            if (ev.type=="mouseover")  {
                return !Utils.contains(target,ev.relatedTarget||ev.fromElement) && !((ev.relatedTarget||ev.fromElement)===target);
            } else {
                return !Utils.contains(target,ev.relatedTarget||ev.toElement) && !((ev.relatedTarget||ev.toElement)===target);
            }
        },
        //返回指定范围的随机数
        "getRandomNumber" : function (inMin, inMax) {
            if (inMin > inMax) {
                return 0;
            }
            return Math.round(inMin + (inMax - inMin) * Math.random());
        },
        //字符串截断
        "suolve" : function (str, n){
            var sub_length = n;
            var temp1 = str.replace(/[^\x00-\xff]/g,"**");
            var temp2 = temp1.substring(0,sub_length);
            //找出有多少个*
            var x_length = temp2.split("\*").length - 1;
            var hanzi_num = x_length /2;
            sub_length = sub_length - hanzi_num ;//实际需要sub的长度是总长度-汉字长度
            var res = str.substring(0,sub_length);
            if(sub_length < str.length ){
                var end  =res+"…";
            }else{
                var end  = res;
            }
            return end;
        }
    };

    /**
     * Tween 基础缓动函数, 来源于flash的Tween类的算法
     * @param {number} t: current time（当前时间）；
     * @param {number} b: beginning value（初始值）；
     * @param {number} c: change in value（变化量）；
     * @param {number} d: duration（持续时间）。
     */
    var Tween = {
        Linear: function(t,b,c,d){return c*t/d + b;},
        Elastic: {
            easeOut: function(t,b,c,d,a,p){
                if (t==0) return b;if ((t/=d)==1) return b+c;if (!p) p=d*.3;
                if (!a || a < Math.abs(c)) {a=c;var s=p/4;}
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
            }
        }
    };

    //目前IE使用的是VML, 其他高级浏览器使用SVG绘制图形
    //G主要处理SVG和VML的兼容性问题 提供一些底层支持
    var G = {};

    //节点单元
    var M = {
        /*
        * M.RelateLine(p1, p2, startNodeId, endNodeId)      绘制关系线
        * M.Core(x, y, t)           关联中心词 core
        * M.Parallel(x, y, t)       通用关联词(平行词) parallel
        * M.Specific(x, y, t)       个性关联词(特有词) specific
        * M.Timeliness(x, y, t)     时效关联词 timeliness
        * M.Lesser(x, y, t)		 
        */
    };
    
    //功能检测 如果不支持SVG 就会进入VML的流程
    G.type = (function(){
        return (document.createElementNS && document.createElementNS(CONS.SVGNS, "svg").x != null) ? 'SVG':'VML';
    })();
    G.svg = !(G.vml = G.type == 'VML');
    
    //SVG及需要的一些函数方法
    G.svg && function () {
        /**
         * 创建svg DOM节点并返回
         * @param {String} node DOM节点元素名.
         * @param {Object} attr {"属性名":"属性值",...}
         * @param {String} cssText "margin:0;padding:0;"
         * @return {HTMLElement}
         */
        G.createDom = function (node, attr, cssText) {
            var o = document.createElementNS(CONS.SVGNS, node);
            if (attr) {
                for (var i in attr) {
                    if(i == "xlink:href"){
                        o.setAttributeNS(CONS.SVGXLINK,"xlink:href", attr[i]);
                    }else{
                        o.setAttribute(i, attr[i]);
                    }
                }
            }
            if (cssText) {
                o.style.cssText = cssText
            }
            return o;
        };
        /**
         * 创建SVG画布
         * @return {HTMLElement}
         */
        G.createCanvas = function(){
            return G.createDom('svg',{'width': CONS.CANVAS.WIDTH,'height': CONS.CANVAS.HEIGHT,'viewBox':"0 0 "+CONS.CANVAS.WIDTH+" "+ CONS.CANVAS.HEIGHT,"xmlns": CONS.SVGNS,"xmlns:xlink": CONS.SVGXLINK,"version": "1.1"});
        };
        /**
         * 检测字符串长度 是否换行
         * @param {String} t 文字
         * @param {Int} n 允许汉字的长度
         * @return {Boolean} true:需要换行
         */
        G.checkStrlen = function(t, n){
            var s = 1.2; //1个字母和数字所占空间(1个汉字占2个空间)
            var t = "" + t, n = n || 5, c = 0, m = 0;

            for(var i = 0, len = t.length; i < len; i++){
                if(t.charCodeAt(i) > 255){
                    c += 2;
                }else{
                    c += s;
                }

                if(c > 2 * n){
                    break;
                }else{
                    m++;
                }
            }
            return !(t.length <= m);
        };
        /**
         * 检测文字是否换行 SVG的文字换行需要增加额外的标签
         <text x="390" y="217" text-anchor="middle" style="font-weight: 700; font-size: 18px; fill: #ffffff;">
            <tspan x="390" y="207">少年派的奇</tspan>
            <tspan x="390" y="227">幻漂流</tspan>
         </text>
         * @param {HTMLElement} text 文本对象
         * @param {String} t 文字
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {Int} n 允许汉字的长度
         * @param {Boolean} core 是否是中心节点
         */
        G.createText = function(text, t, x, y, n, core){
            var s = 1.2; 
            var t = "" + t, n = n || 5, c = 0, m = 0;

            for(var i = 0, len = t.length; i < len; i++){
                if(t.charCodeAt(i) > 255){
                    c += 2;
                }else{
                    c += s;
                }

                if(c > 2*n){
                    break;
                }else{
                    m++;
                }
            }

            if(t.length <= m){
                text.appendChild(document.createTextNode(t));
            }else{
                var t1, t2;
                t1 = t.substring(0, m);
                t2 = t.substring(m);

                var tspan1, tspan2;
                if(core){
                    tspan1 = G.createDom('tspan', {"x":x, "y":y-10}),
                    tspan2 = G.createDom('tspan', {"x":x, "y":y+10});
                }else{
                    tspan1 = G.createDom('tspan', {"x":x, "y":y}),
                    tspan2 = G.createDom('tspan', {"x":x, "y":y+15});
                }

                var textNode1 = document.createTextNode(t1),
                    textNode2 = document.createTextNode(t2);

                tspan1.appendChild(textNode1);
                tspan2.appendChild(textNode2);

                text.appendChild(tspan1);
                text.appendChild(tspan2);
            }
        };
        
        /**
         * 绘制关系线RelateLine
         * @param {Object} p1 {"x":x1坐标, "y":y1坐标}
         * @param {Object} p2 {"x":x2坐标, "y":y2坐标}
         * @param {number} startNodeId 开始Id
         * @param {number} endNodeId 结束Id
         * @return {HTMLElement} 
         <g>
             <line x1="385" y1="215" x2="540" y2="250" stroke="#E9F8FF" />
             <rect x="470" y="229" width="14" height="14" rx="3" ry="3" fill="#D1EFFE" stroke="#D1EFFE" stroke-width="1" style="z-index: 13;"/>
             <text x="477" y="240" text-anchor="middle" style="font-size:13px;fill:#fff;">?</text>
         </g>
         */
        M.RelateLine = function(p1, p2, startNodeId, endNodeId){
            var _x1 = p1.x,_y1 = p1.y,_x2 = p2.x,_y2 = p2.y;
            var g = G.createDom('g', {'id':'line-'+startNodeId+'-'+endNodeId, 'class': 'line'}),
                line = G.createDom('line', {'x1':_x1, 'y1':_y1, 'x2':_x2, 'y2':_y2, 'start':startNodeId, 'end':endNodeId ,'stroke-width':CONS.RELATELINE.LINE.STROKEWIDTH, 'stroke':CONS.RELATELINE.LINE.STROKE}),
                line2 = G.createDom('line', {'x1':_x1, 'y1':_y1, 'x2':_x2, 'y2':_y2, 'start':startNodeId, 'end':endNodeId ,'stroke-width':CONS.RELATELINE.LINE.STROKEWIDTH_HIDDEN, 'stroke':"transparent"}),
                rect = G.createDom('rect', {'x':(_x1 + _x2)/2 - 7, 'y':(_y1 + _y2)/2 - 7, 'width':CONS.RELATELINE.RECT.WIDTH, 'height':CONS.RELATELINE.RECT.HEIGHT, 'rx':CONS.RELATELINE.RECT.RX, 'ry':CONS.RELATELINE.RECT.RY, 'fill':CONS.RELATELINE.RECT.FILL, 'stroke':CONS.RELATELINE.RECT.STROKE, 'stroke-width':CONS.RELATELINE.RECT.STROKEWIDTH}),
                text = G.createDom('text', {'x':(_x1 + _x2)/2, 'y':(_y1 + _y2)/2 + 4, 'text-anchor':"middle"}, "font-size:"+CONS.RELATELINE.TEXT.FONTSIZE+";fill:"+CONS.RELATELINE.TEXT.COLOR+";"),
                textNode = document.createTextNode("?");
            // text.appendChild(textNode);
            g.appendChild(line);
            // g.appendChild(rect);
            g.appendChild(text);
            g.appendChild(line2);
            return g;
        };
        
        /**
         * 绘制核心节点 Core
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
            <g>
             <image xlink:href="images/main.png" width="130" height="134" x="320" y="150" />
             <text x="385" y="215" text-anchor="middle" style="font-weight:700;font-size:20px;fill: #fff;">画皮</text>
            </g>
         */
        M.Core = function(x, y, t, nodeid){
            var fs = G.checkStrlen(t)?(parseInt(CONS.CORE.FONTSIZE) - 2)+"px":CONS.CORE.FONTSIZE;
            var g = G.createDom('g', {'id':"node-"+nodeid, 'ctype':'Core', 'class': 'core'}),
                image = G.createDom('image', {'x':x - CONS.CORE.WIDTH/2,'y': y - CONS.CORE.HEIGHT/2,"xlink:href":CONS.CORE.HREF, 'width':CONS.CORE.WIDTH, 'height':CONS.CORE.HEIGHT}),
                text = G.createDom('text', {"x":x, "y":y + 7, "text-anchor":"middle"}, "font-weight:"+ CONS.CORE.FONTWEIGHT+";font-size:"+ fs+";fill:"+ CONS.CORE.COLOR);

            G.createText(text, t, x, y + 7, 5, true);
            g.appendChild(image);
            g.appendChild(text);
            return g;
        };
        
        /**
         * 绘制通用关联词(平行词) Parallel
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
            <g>
             <circle cx="530" cy="120" r="35" stroke-width="1" stroke="#ffa200" fill="#fff" />
             <text x="530" y="125" text-anchor="middle" style="font-size:14px;fill:#ffa200;">孙俪</text>
             </g>
         */
        M.Parallel = function(x, y, t, nodeid){
            var fs = G.checkStrlen(t)?(parseInt(CONS.PARALLEL.FONTSIZE) - 2)+"px":CONS.PARALLEL.FONTSIZE;
            var g = G.createDom('g', {'id':"node-"+nodeid, 'ctype':'Parallel', 'class': 'node'}),
                circle = G.createDom('circle', {"cx":x, "cy":y, "r":CONS.PARALLEL.R,"stroke-width":CONS.PARALLEL.STROKEWIDTH,
                    "stroke":CONS.PARALLEL.STROKE, "fill":CONS.PARALLEL.FILL}),
                text = G.createDom('text', {"x":x, "y":y + 7, "text-anchor":"middle"}, "font-weight:"+ CONS.PARALLEL.FONTWEIGHT
                    +";font-size:"+ fs+";fill:"+ CONS.PARALLEL.COLOR);

            G.createText(text, t, x, y);
            g.appendChild(circle);
            g.appendChild(text);
            return g;
        };
        
        /**
         * 个性关联词(特有词) Specific
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
            <g>
             <circle cx="540" cy="250" r="35" stroke-width="1" stroke="#3488DB" fill="#4394E7" />
             <text x="540" y="255" text-anchor="middle" style="font-size:14px;fill: #fff;">剧情</text>
             </g>
         */
        M.Specific = function(x, y, t, nodeid){
            var fs = G.checkStrlen(t)?(parseInt(CONS.SPECIFIC.FONTSIZE) - 2)+"px":CONS.SPECIFIC.FONTSIZE;
            var g = G.createDom('g', {'id':"node-"+nodeid, 'ctype':'Specific', 'class': 'node'}),
                circle = G.createDom('circle', {"cx":x, "cy":y, "r":CONS.SPECIFIC.R,"stroke-width":CONS.SPECIFIC.STROKEWIDTH,
                    "stroke":CONS.SPECIFIC.STROKE, "fill":CONS.SPECIFIC.FILL}),
                text = G.createDom('text', {"x":x, "y":y + 7, "text-anchor":"middle"}, "font-weight:"+ CONS.SPECIFIC.FONTWEIGHT
                    +";font-size:"+ fs+";fill:"+ CONS.SPECIFIC.COLOR);

            G.createText(text, t, x, y);
            g.appendChild(circle);
            g.appendChild(text);
            return g;
        };
        
        /**
         * 时效关联词 Timeliness
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
            <g>
             <circle cx="260" cy="370" r="35" stroke-width="1" stroke="#f32770" fill="#fff" />
             <text x="260" y="375" text-anchor="middle" style="font-size:14px;fill:#f32770;">第二部</text>
             </g>
         */
        M.Timeliness = function(x, y, t, nodeid){
            var fs = G.checkStrlen(t)?(parseInt(CONS.TIMELINESS.FONTSIZE) - 2)+"px":CONS.TIMELINESS.FONTSIZE;
            var g = G.createDom('g', {'id':"node-"+nodeid, 'ctype':'Timeliness', 'class': 'node'}),
                circle = G.createDom('circle', {"cx":x, "cy":y, "r":CONS.TIMELINESS.R,"stroke-width":CONS.TIMELINESS.STROKEWIDTH,
                    "stroke":CONS.TIMELINESS.STROKE, "fill":CONS.TIMELINESS.FILL}),
                text = G.createDom('text', {"x":x, "y":y + 7, "text-anchor":"middle"}, "font-weight:"+ CONS.TIMELINESS.FONTWEIGHT
                    +";font-size:"+ fs+";fill:"+ CONS.TIMELINESS.COLOR);

            G.createText(text, t, x, y);
            g.appendChild(circle);
            g.appendChild(text);
            return g;
        };
        
        /**
         * 弱化 Lesser
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
            <g>
             <circle cx="580" cy="170" r="20" stroke-width="1" stroke="#82BDF5" fill="#94CFF6" />
             <text x="580" y="175" text-anchor="middle" style="font-size:12px;fill:#fff;">周迅</text>
             </g>
         */
        M.Lesser = function(x, y, t, nodeid){
            var fs = G.checkStrlen(t)?(parseInt(CONS.LESSER.FONTSIZE) - 2)+"px":CONS.LESSER.FONTSIZE;
            var g = G.createDom('g', {'id':"node-"+nodeid, 'ctype':'Lesser', 'class': 'node'}),
                circle = G.createDom('circle', {"cx":x, "cy":y, "r":CONS.LESSER.R,"stroke-width":CONS.LESSER.STROKEWIDTH,
                    "stroke":CONS.LESSER.STROKE, "fill":CONS.LESSER.FILL}),
                text = G.createDom('text', {"x":x, "y":y + 7, "text-anchor":"middle"}, "font-weight:"+ CONS.LESSER.FONTWEIGHT
                    +";font-size:"+ fs+";fill:"+ CONS.LESSER.COLOR);

            G.createText(text, t, x, y);
            g.appendChild(circle);
            g.appendChild(text);
            return g;
        };
    }();
    
    //VML及需要的一些函数方法
    G.vml && function () {
        //IE 8 引擎渲染VML有些问题（缩放等）使用VML注入可以解决这个问题
        document.namespaces.add("v", "urn:schemas-microsoft-com:vml");

        var head = document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            rules = document.createTextNode('v\\:*{Behavior: url(#default#VML);position:absolute;}  ');

        style.type = 'text/css';
        if(style.styleSheet){ //兼容ie8
            style.styleSheet.cssText = rules.nodeValue;
        }else{ //ie 6,7
            style.appendChild(rules);
        }
        head.appendChild(style);

        /**
         * 创建vml DOM节点并返回
         * @param {String} node DOM节点元素名.
         * @param {Object} attr {"属性名":"属性值",...}
         * @param {String} cssText "margin:0;padding:0;"
         * @return {HTMLElement}
         */
        G.createDom = function (node, attr, cssText) {
            var o = document.createElement(node);
            if (attr) {
                for (var i in attr) {
                    o.setAttribute(i, attr[i]);
                }
            }
            if (cssText) {
                o.style.cssText = cssText
            }
            return o;
        };
        
        /**
         * 创建VML画布
         * @return {HTMLElement}
         */
        G.createCanvas = function(){
            //<v:group ID="group1" style="position:relative;WIDTH:200px;HEIGHT:200px;" coordsize = "1000,1000">
            return G.createDom('v:group', {"coordsize": CONS.CANVAS.WIDTH +","+CONS.CANVAS.HEIGHT}, "width:"+CONS.CANVAS.WIDTH+"px;height:"+CONS.CANVAS.HEIGHT+"px;left:0;top:0;");
        };
        /**
         * 检测字符串长度 是否换行
         * @param {String} t 文字
         * @param {Int} n 允许汉字的长度
         * @return {Boolean} true:需要换行
         */
        G.checkStrlen = function(t, n){
            var t = "" + t;
            var n = n || 5;
            var c = 0;
            for(var i = 0, len = t.length; i < len; i++){
                if(t.charCodeAt(i) > 255){
                    c += 2;
                }else{
                    c += 1;
                }
            }
            return (c > 2 * n);
        };
        
        /**
         * 绘制关系线RelateLine
         * @param {Object} p1 {"x":x1坐标, "y":y1坐标}
         * @param {Object} p2 {"x":x2坐标, "y":y2坐标}
         * @param {number} startNodeId 开始Id
         * @param {number} endNodeId 结束Id
         * @return {HTMLElement} 
         <div>
             <v:line style="left:385px;top:215px;" to = "155,35" strokecolor = "#E9F8FF" strokeweight = "1" />
             <v:roundrect style="width:14px;height:14px;top:233px;left:463px" fillcolor = "#D1EFFE" strokecolor = "#D1EFFE" strokeweight = "1pt">
             <div style="text-align:center;width:100%;color:#fff;font-size:13px;">?</div>
             </v:roundrect>
         </div>
         */
        M.RelateLine = function(p1, p2, startNodeId, endNodeId){
            var _x1 = p1.x,_y1 = p1.y,_x2 = p2.x,_y2 = p2.y, s = "";
            var div = G.createDom("div", {'id':'line-'+startNodeId+'-'+endNodeId, "class":"line"}),
                line = G.createDom("v:line", {"start":startNodeId, "end":endNodeId, "to" : (_x2-_x1)+","+(_y2-_y1), "strokecolor" : CONS.RELATELINE.LINE.STROKE, "strokeweight" : CONS.RELATELINE.LINE.STROKEWIDTH}, "left:"+_x1+"px;top:"+_y1+"px;"),
                line2 = G.createDom("v:line", {"start":startNodeId, "end":endNodeId, "to" : (_x2-_x1)+","+(_y2-_y1), "strokecolor" : "#fff", "strokeweight" : CONS.RELATELINE.LINE.STROKEWIDTH_HIDDEN}, "left:"+_x1+"px;top:"+_y1+"px;filter: alpha(opacity=0);-moz-opacity:0;opacity:0;"),
                roundrect = G.createDom("v:roundrect", {"fillcolor" : CONS.RELATELINE.RECT.FILL, "strokecolor" : CONS.RELATELINE.RECT.STROKE, "strokeweight" : CONS.RELATELINE.RECT.STROKEWIDTH}, "width:"+CONS.RELATELINE.RECT.WIDTH+"px;height:"+CONS.RELATELINE.RECT.HEIGHT+"px;top:"+((_y1+_y2)/2 - CONS.RELATELINE.RECT.HEIGHT/2)+"px;left:"+((_x1+_x2)/2 - CONS.RELATELINE.RECT.WIDTH/2)+"px"),
                text = G.createDom("div","","text-align:center;width:100%;color:"+CONS.RELATELINE.TEXT.COLOR+";font-size:"+CONS.RELATELINE.TEXT.FONTSIZE+";"),
                textNode = document.createTextNode("?");
            text.appendChild(textNode);
            roundrect.appendChild(text);
            div.appendChild(line);
            div.appendChild(roundrect);
            div.appendChild(line2);
            return div;
        };
        
        /**
         * 绘制核心节点 Core
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
         <v:image src="images/main.png" style="top:150px;left:320px;width:130px;height:134px">
             <div style="text-align:center;width:100%;top:50px;font-weight:700;font-size:20px;color:#fff;">画皮</div>
         </v:image>
         */
        M.Core = function(x, y, t, nodeid){
            var m = G.checkStrlen(t);
            var mt = m?"-20px":"-10px";
            var fs = m?(parseInt(CONS.CORE.FONTSIZE) - 2)+"px":CONS.CORE.FONTSIZE;
            var image = G.createDom("v:image", {'id':"node-"+nodeid, 'ctype':'Core', "class":"core","src":CONS.CORE.HREF}, "left:"+ (x-CONS.CORE.WIDTH/2) +"px;top:"+  (y-CONS.CORE.HEIGHT/2) +"px;width:"+ CONS.CORE.WIDTH +"px;height:"+CONS.CORE.HEIGHT+"px"),
                div = G.createDom("div","","text-align:center;width:100%;top:50%;margin-top:"+mt+";font-weight:"+CONS.CORE.FONTWEIGHT+";font-size:"+fs+";color:"+CONS.CORE.COLOR+";"),
                textNode = document.createTextNode(t);
            div.appendChild(textNode);
            image.appendChild(div);
            return image;
        };
        
        /**
         * 绘制通用关联词(平行词) Parallel
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
         <v:oval strokecolor="#ffa200" fillcolor="#fff" style="left:530;top:120;width:70;height:70">
             <div style="text-align:center;width:100%;top:30px;font-size:14px;color:#ffa200;">孙俪</div>
         </v:oval>
         */
        M.Parallel = function(x, y, t, nodeid){
            var m = G.checkStrlen(t);
            var mt = m?"-10px":"-5px";
            var fs = m?(parseInt(CONS.PARALLEL.FONTSIZE) - 2)+"px":CONS.PARALLEL.FONTSIZE;
            var st = m?"width:60px;left:50%;margin-left:-30px;":"width:100%;";

            var oval = G.createDom("v:oval", {'id':"node-"+nodeid, 'ctype':'Parallel', "class":"node","strokecolor":CONS.PARALLEL.STROKE, "strokeweight":CONS.PARALLEL.STROKEWIDTH, "fillcolor":CONS.PARALLEL.FILL}, "left:"+(x - CONS.PARALLEL.R)+"px;top:"+(y - CONS.PARALLEL.R)+"px;width:"+2 * CONS.PARALLEL.R+"px;height:"+2 * CONS.PARALLEL.R+"px"),
                div = G.createDom("div",{"class":"nodeDiv"},"text-align:center;top:50%;margin-top:"+mt+";"+st+"font-weight:"+CONS.PARALLEL.FONTWEIGHT+";font-size:"+fs+";color:"+CONS.PARALLEL.COLOR+";"),
                textNode = document.createTextNode(t);
            div.appendChild(textNode);
            oval.appendChild(div);
            return oval;
        };
        
        /**
         * 个性关联词(特有词) Specific
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
         <v:oval strokecolor="#3488DB" fillcolor="#4394E7" style="left:540;top:250;width:70;height:70">
             <div style="text-align:center;width:100%;top:30px;font-size:14px;color:#fff;">剧情</div>
         </v:oval>
         */
        M.Specific = function(x, y, t, nodeid){
            var m = G.checkStrlen(t);
            var mt = m?"-10px":"-5px";
            var fs = m?(parseInt(CONS.SPECIFIC.FONTSIZE) - 2)+"px":CONS.SPECIFIC.FONTSIZE;
            var st = m?"width:60px;left:50%;margin-left:-30px;":"width:100%;";

            var oval = G.createDom("v:oval", {'id':"node-"+nodeid, 'ctype':'Specific', "class":"node","strokecolor":CONS.SPECIFIC.STROKE, "strokeweight":CONS.SPECIFIC.STROKEWIDTH, "fillcolor":CONS.SPECIFIC.FILL}, "left:"+(x - CONS.SPECIFIC.R)+"px;top:"+(y - CONS.SPECIFIC.R)+"px;width:"+2 * CONS.SPECIFIC.R+"px;height:"+2 * CONS.SPECIFIC.R+"px"),
                div = G.createDom("div",{"class":"nodeDiv"},"text-align:center;"+st+"top:50%;margin-top:"+mt+";font-weight:"+CONS.SPECIFIC.FONTWEIGHT+";font-size:"+fs+";color:"+CONS.SPECIFIC.COLOR+";"),
                textNode = document.createTextNode(t);
            div.appendChild(textNode);
            oval.appendChild(div);
            return oval;
        };
        
        /**
         * 时效关联词 Timeliness
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
         <v:oval strokecolor="#f32770" fillcolor="#fff" style="left:260;top:370;width:70;height:70">
             <div style="text-align:center;width:100%;top:30px;font-size:14px;color:#f32770;">第二部</div>
         </v:oval>
         */
        M.Timeliness = function(x, y, t, nodeid){
            var m = G.checkStrlen(t);
            var mt = m?"-10px":"-5px";
            var fs = m?(parseInt(CONS.TIMELINESS.FONTSIZE) - 2)+"px":CONS.TIMELINESS.FONTSIZE;
            var st = m?"width:60px;left:50%;margin-left:-30px;":"width:100%;";

            var oval = G.createDom("v:oval", {'id':"node-"+nodeid, 'ctype':'Timeliness', "class":"node","strokecolor":CONS.TIMELINESS.STROKE, "strokeweight":CONS.TIMELINESS.STROKEWIDTH, "fillcolor":CONS.TIMELINESS.FILL}, "left:"+(x - CONS.TIMELINESS.R)+"px;top:"+(y - CONS.TIMELINESS.R)+"px;width:"+2 * CONS.TIMELINESS.R+"px;height:"+2 * CONS.TIMELINESS.R+"px"),
                div = G.createDom("div",{"class":"nodeDiv"},"text-align:center;"+st+"top:50%;margin-top:"+mt+";font-weight:"+CONS.TIMELINESS.FONTWEIGHT+";font-size:"+fs+";color:"+CONS.TIMELINESS.COLOR+";"),
                textNode = document.createTextNode(t);
            div.appendChild(textNode);
            oval.appendChild(div);
            return oval;
        };
        
        /**
         * 弱化 Lesser
         * @param {number} x x坐标
         * @param {number} y y坐标
         * @param {String} t 节点文字
         * @param {number} nodeid 当前节点id
         * @return {HTMLElement} 
         <v:oval strokecolor="#82BDF5" fillcolor="#94CFF6" style="left:580;top:170;width:40;height:40">
             <div style="text-align:center;width:100%;top:15px;font-size:12px;color:#fff;">周迅</div>
         </v:oval>
         */
        M.Lesser = function(x, y, t, nodeid){
            var m = G.checkStrlen(t);
            var mt = m?"-10px":"-5px";
            var fs = m?(parseInt(CONS.LESSER.FONTSIZE) - 2)+"px":CONS.LESSER.FONTSIZE;
            var st = m?"width:60px;left:50%;margin-left:-30px;":"width:100%;";

            var oval = G.createDom("v:oval", {'id':"node-"+nodeid, 'ctype':'Lesser', "class":"node", "strokecolor":CONS.LESSER.STROKE, "strokeweight":CONS.LESSER.STROKEWIDTH, "fillcolor":CONS.LESSER.FILL}, "left:"+(x - CONS.LESSER.R)+"px;top:"+(y - CONS.LESSER.R)+"px;width:"+2 * CONS.LESSER.R+"px;height:"+2 * CONS.LESSER.R+"px"),
                div = G.createDom("div",{"class":"nodeDiv"},"text-align:center;"+st+"top:50%;margin-top:"+mt+";font-weight:"+CONS.LESSER.FONTWEIGHT+";font-size:"+fs+";color:"+CONS.LESSER.COLOR+";"),
                textNode = document.createTextNode(t);
            div.appendChild(textNode);
            oval.appendChild(div);
            return oval;
        };
    }();

   /**
    * 创建兴趣图谱组件
    * @param {String} containerId 容器id
    * @param {Object} data json数据
    */
    function RelatedSearch(containerId, data){
        this.container = document.getElementById(containerId);
        this.canvas = G.createCanvas();
        this.maxlength = 20;
        this.load(data);
        this.bind();
    }

    window.RelatedSearch = RelatedSearch;

    /**
     * 调试使用 输出日志 IE会生成一个日志窗口
     * @param {String} msg 输出信息
     */
    RelatedSearch.prototype.log = function(msg){
        if(G.svg){
            console.log(msg);
        }else{
            if(!this.debugView){
                var oDiv = document.createElement("div");
                oDiv.style.cssText = 'width:200px;height:500px;position:fixed;left:0;bottom:0;background:#fff;overflow:auto;';
                this.debugView = oDiv;
                document.body.appendChild(oDiv);
            }else{
                this.debugView.innerHTML += msg+"<br />";
            }
        }
    };
    
    /**
     * 分析原始数据的各个edge对象，以edge的from节点id为键指向一个数组，数组中元素存储该from节点的边，存储格式为边到的节点id和边的title
     * 遍历data，返回一个关系list  {1:[{"id":2, "title":...},...]}
     * @param {object} edge 原始data数据edges数组的一个对象，格式{
     "from":599,
     "to":607,
     "url":"http:\/\/zhidao.baidu.com\/question\/227551892.html",
     "title":"\u4e3a\u4ec0\u4e48\u6211\u7684GOOGLE\u8d26\u6237\u767b\u9646\u4e0d\u4e86\uff1f_\u767e\u5ea6\u77e5\u9053",
     "clicks":"72"
     }
     */
    RelatedSearch.prototype.setList = function(edge){
        if(!this.data.nodes[edge.from]) return;
        if(this.data.nodes[edge.to]){
            if(!this.data.list.hasOwnProperty(edge.from)){
                this.data.list[edge.from] = {};
            }
            this.data.list[edge.from][edge.to]=edge;
        }
    };

    /*
     * 获取队列里面的links;
     */
    RelatedSearch.prototype.getlinks = function(startNodeId, endNodeId){
        var node = this.data.list[startNodeId][endNodeId];
        return node ? node.links : null;
    };

    /*
     * 获取节点对象
     * @param {int} id 节点id
     */
    RelatedSearch.prototype.getNode=function(id){
        return this.data.nodes[id];
    };

    /*
     * 存储坐标位置(存储到节点对象中)
     * @param {int} id 节点id
     * @param {int} x 节点圆心x坐标
     * @param {int} y 节点圆心y坐标
     * @param {int} angle 节点圆心极坐标的角度值
     */
    RelatedSearch.prototype.setNodeInfo = function(id, options){
        var node = this.data.nodes[id];
        node["type"] = options.type || "";
        node["x"] = options.x || 0 ;
        node["y"] = options.y || 0;
        node["angle"] = options.angle || 0;
    };

    /*
     * 读取坐标位置
     * @param {int} id 节点id
     */
    RelatedSearch.prototype.getNodeInfo = function(id){
        var node = this.data.nodes[id];
        return {
            "type" : node["type"],
            "x": node['x'],
            "y": node['y'],
            "angle":node["angle"]
        }
    };

    /*
     * 验证数据类型
     * 做一些绘制前的数据处理的工作
     */
    RelatedSearch.prototype.processDate = function(data){
        if(typeof data == "string"){
            this.data = eval(data);
        }else if(data && typeof data == "object"){
            this.data = data;
        }else{
            alert("数据错误");
            return ;
        }

        this.data.list = {};
        this.data.nodewrap = {};
        //将中心节点按照普通节点的格式存储到节点集中
        this.data.nodes[this.data.id]={
            "id":this.data.id,
            "keyword":this.data.keyword
        };

        //重新按新格式存储边的信息
        var i = 0,
            len = this.data.edges.length;
        //len = (this.data.edges.length < this.maxlength) ? this.data.edges.length : this.maxlength;
        for(; i < len; i++){
            this.setList(this.data.edges[i]);
            this.setNodeWrap(this.data.edges[i]);
        }
    };

    RelatedSearch.prototype.setNodeWrap = function(edge){
        if(!edge.from || !edge.to) return;


        if(!this.data.nodewrap.hasOwnProperty(edge.from)){
            this.data.nodewrap[edge.from] = [];
        }
        this.data.nodewrap[edge.from].push(edge.to);

        if(!this.data.nodewrap.hasOwnProperty(edge.to)){
            this.data.nodewrap[edge.to] = [];
        }
        this.data.nodewrap[edge.to].push(edge.from);
    };

    /*
     * (重)绘制前做一些数据、画布内元素的清理工作
     */
    RelatedSearch.prototype.clear = function(){
        this.data = null;
        this.container.innerHTML="";
        this.canvas = G.createCanvas();
    };

    /*
     * 数据初始化
     */
    RelatedSearch.prototype.load = function(data){
        this.clear();
        this.processDate(data);
        this.startDraw();

        //把canvas元素添加进入画布
        this.appendCanvas();
    };
    
    /*
     * 开始绘制
     */
    RelatedSearch.prototype.startDraw = function(){
        this.drawNodesAndRelations();
    };

	 /*
     * 绘制节点和关系
     */
    RelatedSearch.prototype.drawNodesAndRelations = function(){
        var x0 = CONS.CANVAS.WIDTH/2, y0 = CONS.CANVAS.HEIGHT/ 2, angle0 = Utils.getRandomNumber(0, 30); //初始值
        var x, y, angle = angle0; //定义当前坐标、角度并赋初始值
        var me = this;

        var total = 0;
        for(var t in this.data.nodes){
            total++;//计算总词数
        }

        var n = 1;//当前是第几个词
        var m = 1;//当前是第几圈
        var l = 150;//初始长度
        var num = 9; //第一圈个数
        var minHeight = 35, maxHeight = CONS.CANVAS.HEIGHT - 35;
        var cycleStartAngle = angle0;
        
        //当前数据量比较少 少于一圈
        var getLevelSmaller = function() {
            x = Math.floor(l * Math.cos(angle) + x0 + Utils.getRandomNumber(-10, 10));
            y = Math.floor(-l * Math.sin(angle) + y0 + Utils.getRandomNumber(-10, 10));
            l += Utils.getRandomNumber(-5, 10);
            angle += Utils.getAngle(Math.floor(360 / total) + Utils.getRandomNumber(-5, 10))
        };
        
        //当前数据量比较多
        var getLevelLarger = function() {
            //阿基米德螺旋线算法 添加角度限制 并加入随机值打散布局
            x = Math.floor(l * Math.cos(Utils.getAngle(angle)) + x0 + Utils.getRandomNumber(-5, 5));
            y = Math.floor(-l * Math.sin(Utils.getAngle(angle)) + y0 + Utils.getRandomNumber(-5, 5));
            
            //取得角度  角度限制
            var getAngle = function() {
                switch (m) {
                    case 1:
                        angle += 360 / num + Utils.getRandomNumber(-2, 3);
                        break;
                    case 2:
                        angle += 20 + Utils.getRandomNumber(-2, 3);
                        while ((angle > (360 + 40) && angle < (360 + 180 - 40)) || (angle > (360 + 180 + 40) && angle < (360 + 360 - 40))) {
                            angle += 20
                        }
                        break;
                    case 3:
                        angle += 15 + Utils.getRandomNumber(-2, 3);
                        while ((angle > (720 + 20) && angle < (720 + 180 - 20)) || (angle > (720 + 180 + 20) && angle < (720 + 360 - 20))) {
                            angle += 10
                        }
                        break;
                }
            };
            
            //检测当前是第几圈
            var checkCycle = function() {
                if (angle - cycleStartAngle > 340) {
                    m++;
                    l += 95;
                    cycleStartAngle = angle
                }
            };
            
            //累加
            var processSum = function() {
                n++;
                getAngle();
                checkCycle()
            };
            processSum();
        };
        
        //获取下一个点的坐标
        var getNextPosition = function() {
            if (total < 10) {
                getLevelSmaller()
            } else {
                getLevelLarger()
            }
        };
        
        //取得当前使用的属性名
        var getType = function(pos) {
            var pos = "" + pos;
			
            if (m >= 2) {
                return "Lesser"
            }
			
            switch (pos) {
                case "1":
                    return "Parallel";
                case "2":
                    return "Timeliness";
                case "3":
                    return "Specific";
                case "4":
                    return "Lesser";
            }
        };

        //绘制node节点
        for(var i in this.data.nodes){
            if(i == this.data.id) {
                //如果是中心词(原始data的id是中心词的id)
                var core = M.Core(x0, y0, this.data.keyword, i)
                this.canvas.appendChild(core);
                this.setNodeInfo(i, {"type":"Core","x":x0, "y":y0, "angle": angle0});

                //绘制由中心节点出发的各条边
                for(var j = 0 in this.data.list[i]){
                    var originEdgeInfo = this.data.list[i][j], //中心节点到周围节点的边的标题
                        endNodeId =originEdgeInfo.to, //边到的节点(终点)的id
                        endNode = this.data.nodes[endNodeId], //从原始数据获取node节点，格式{"id":600,"keyword":"earth"}
                        endNodePos = endNode.tag; //没有区分词性的非中心词，3个一组依次确定词性为1、2、3

                    getNextPosition(); //计算当前点的x、y、angle值;

                    var type = getType(endNodePos);
                    var node = M[type](x, y, endNode.keyword, j);
                    this.canvas.appendChild(node);
                    this.setNodeInfo(endNodeId, {"type":type,"x":x, "y":y, "angle": angle});
                }
            }
        }

        //绘制线
        for(var i in this.data.list){
            var startNode = this.getNode(i);
            for(var j in this.data.list[i]){
                var otherOriginEdgeInfo = this.data.list[i][j],
                    otherEndNodeId = otherOriginEdgeInfo.to, //终点节点的id
                    otherEndNode = this.data.nodes[otherEndNodeId];

                if(this.getNodeInfo(otherEndNodeId).x !== undefined){
                    //两个点都已经绘制，只需要用线连接起来。
                    var otherRelateLine= M.RelateLine({"x":startNode.x,"y":startNode.y}, {"x":otherEndNode.x,"y":otherEndNode.y}, i, otherEndNodeId);
                    Utils.previousChild(otherRelateLine, this.canvas);
                }
            }
        }
    };

    RelatedSearch.prototype.appendCanvas = function(){
        if(G.svg){
            this.container.appendChild(this.canvas);
        }else{
            //使用VML注入 可以避免使用VML的头部声明
            var div = G.createDom('div');
            div.appendChild(this.canvas);
            this.container.innerHTML = div.innerHTML;
            div = null;
        }
    };

    /*
     * 创建依赖的对象层，事件委托绑定事件，后续刷新兴趣图谱请求数据不必再绑定此方法。
     */
    RelatedSearch.prototype.bind = function(){
        this.popBox = this.createPopBox();
        this.moveBox = this.createMoveBox();
        // this.createForm();
        this.bindEvent();
        this.bindbodyEvent();
    };
    
    /**
     * 生成一个form
     */
    // RelatedSearch.prototype.createForm = function(){
    //     var f = document.createElement("form");
    //     var i = document.createElement("input");
    //     var i_tn = document.createElement("input");
    //     i_tn.name = "tn";
    //     i_tn.type = "hidden";
    //     i_tn.value = href_ps_tn;
    //     f.appendChild(i_tn);
    //     i.type = "hidden";
    //     i.name = "word";
    //     f.style.display = "none";
    //     f.appendChild(i);
    //     i.value = "";
    //     f.action = "http://www.baidu.com/s?tn=" + href_ps_tn;
    //     f.target = "_blank";

    //     this.container.appendChild(f);
    //     this.rsform = f;
    //     this.rskeyword = i;
    // };

    /*
     * 主要事件函数
     */
    RelatedSearch.prototype.bindEvent = function(){
        var me = this, curHoverObj = null;
        
        //队列控制器 控制队列中的线和节点 提供基础的队列添加和删除功能
        var listControl = {
            "line" : [],
            "node":[],
            "add" : function(type, name){
                this[type].push(name);
            },
            "remove" : function(type, name){
                var arr = this[type];
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (arr[i] == name) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
        };

        //点击查看新闻  
        var viewPopDiv = function(e, lineElement){
            //寻找从起点id到终点id的信息
            var startNodeId = lineElement.getAttribute("start"), endNodeId = lineElement.getAttribute("end");
            var links = me.getlinks(startNodeId, endNodeId);

            if(!links){return;}

            var str = '<div class="RSearch-Content">';
            for(var i in links){
                var _links = links[i];
				var _param_clickmonkey = '';

//统计点击：问号链接
				_param_clickmonkey = (_links.url.indexOf('?') < 0 ? '?' : '&') + 'fr_bd_top_xqtp=xqtp_list';
//统计点击：问号链接

				str += '<a target="_blank" href="' + _links.url + _param_clickmonkey + '">' + Utils.suolve(_links.title, 36) + "</a>"
            }
            str += '</div><span class="RSearch-Close">X</span><div class="RSearch-Bg"></div>';
            
            //父级的位置
            var pos0 = Utils.getPosition(me.container), _l0 = pos0.x, _t0 = pos0.y;
            
            //当前的位置 相减得到偏移值
            var pos = Utils.getPointerPosition(e), _left = pos.x - _l0, _top = pos.y - _t0;
            
            //如果右侧显示不下弹出层 则对调方向箭头向左显示
            if(_left + 285 < CONS.CANVAS.WIDTH){
                me.popBox.className = 'RSearch-PopDiv RSearch-PopDiv-r';
            }else{
                me.popBox.className = 'RSearch-PopDiv RSearch-PopDiv-l';
            }

            me.popBox.innerHTML = str;
            me.popBox.style.cssText = 'display:block;position:absolute;top:'+_top+'px;left:'+_left+'px;';
            me.moveBox.style.display = 'none';
            Utils.stopPropagation(e);

//统计点击：问号
			try{clickmonkey.log(startNodeId + ',' + endNodeId, 'xqtp_qm')}catch(e){}
//统计点击：问号
        };

        /* 查看详情 */
        var viewMoveDiv = function(nodeElement){
            var nodeID = nodeElement.getAttribute("id").replace("node-", "");
            if(me.data.nodes[nodeID].boardid !== 0){
                //计算当前node节点的位置
                if(G.svg){
                    var obj = nodeElement.childNodes[0],
                        _cx = parseInt(obj.getAttribute("cx")),
                        _cy = parseInt(obj.getAttribute("cy")),
                        _r = parseInt(obj.getAttribute("r")),
                        _l = _cx + _r,
                        _t = _cy-10;
                }else{
                    var obj = nodeElement,
                        _w = parseInt(obj.style.width),
                        _r = _w/2,
                        _l = parseInt(obj.style.left) + _w,
                        _t = parseInt(obj.style.top) + _r - 10;
                }
                
                //如果右侧显示不下弹出层 则对调方向箭头向左显示
                if(_l + 95 > CONS.CANVAS.WIDTH){
                    _l = _l - 2 * _r - 95;
                    me.moveBox.className = 'RSearch-MoveDiv RSearch-MoveDiv-l';
                }else{
                    _l = _l + 15;
                    me.moveBox.className = 'RSearch-MoveDiv RSearch-MoveDiv-r';
                }
                
                //点击时的url 需要重新拼一个
                var url = "./detail?b="+me.data.nodes[nodeID].boardid+"&w="+me.data.nodes[nodeID].keyword;
                me.moveBox.setAttribute("href", url);
                me.moveBox.setAttribute("target", "_blank");
                me.moveBox.style.cssText = "position:absolute;left:"+_l+"px;top:"+_t+"px;display:block";
            }else{
                me.moveBox.style.display = "none";
            }
        };

        /* 点击事件 */
        var clickFunc = function(e){
            if(G.svg){
                var target = Utils.getTarget(e), _parent = target.parentNode, _class = _parent.getAttribute("class");
                if(_class == "line"){
                    var lineElement = _parent.childNodes[0];
                    // viewPopDiv(e, lineElement);
                }else if(_class == "node"){
                    var nodeElement = _parent;
                    var nodeID = nodeElement.getAttribute("id").replace("node-", "");
                    var keyword = me.data.nodes[nodeID].keyword;

                    me.rskeyword.value = me.data.keyword +" "+keyword;

//统计点击：圆圈
					try{clickmonkey.log(me.rskeyword.form.action + '&' + me.rskeyword.name + '=' + me.rskeyword.value, 'xqtp_ring')}catch(e){}
//统计点击：圆圈

                    me.rsform.submit();
                }
            }else{
                //VML
                var target = Utils.getTarget(e), _parent = target.parentNode;

                if((target.nodeName.toLowerCase()=="line" || _parent.nodeName.toLowerCase()=="line") ||
                    (target.nodeName.toLowerCase()=="roundrect" || _parent.nodeName.toLowerCase()=="roundrect")){
                    var nodeElement = (target.nodeName.toLowerCase() == "line")?_parent:
                        (_parent.nodeName.toLowerCase() == "roundrect")?_parent.parentNode :_parent.parentNode.parentNode;

                    var lineElement = nodeElement.childNodes[0];
                    // viewPopDiv(e, lineElement);
                }else if(target.nodeName.toLowerCase() == "oval" || _parent.nodeName.toLowerCase() == "oval"){
                    var nodeElement = (target.nodeName.toLowerCase()== "oval")?target:_parent;
                    var nodeID = nodeElement.getAttribute("id").replace("node-", "");
                    var keyword = me.data.nodes[nodeID].keyword;

                    me.rskeyword.value = me.data.keyword +" "+keyword;

//统计点击：圆圈
					try{clickmonkey.log(me.rskeyword.form.action + '&' + me.rskeyword.name + '=' + me.rskeyword.value, 'xqtp_ring')}catch(e){}
//统计点击：圆圈
                    me.rsform.submit();
                }
            }
        };
        
        //直接触发node节点的MouseOver事件 
        var fireNodeMouseOver = function(node){
            if(!node || !(node.getAttribute("id") && node.getAttribute("ctype"))){
                return;
            }
            var nodeID = node.getAttribute("id").replace("node-", ""),
                type = node.getAttribute("ctype"),
                nodeR = CONS[type.toUpperCase()].R;

            if(type === "Core"){return;}

            if(node["timer"]){
                clearTimeout(node["timer"]);
                node["timer"] = null;
            }

            var parentNode=node.parentNode;
            if(parentNode.lastChild!=node){
                parentNode.appendChild(node);
            }

            node.style.cursor = "pointer";

            var b=nodeR,c=10,d=100,t=0;

            if(G.svg){
                var outerOval= node.childNodes[0];
            }else{
                listControl.add("node", node);
                var outerOval= node;
            }

            var _Run = function (){
                r = Math.ceil(Tween.Elastic.easeOut(t,b,c,d));

                if(G.svg){
                    outerOval.setAttribute('r', r);
                }else{
                    outerOval.style.width =  2*r + 'px';
                    outerOval.style.height = 2*r + 'px';
                    //半径变大了，导致圆心变化，要使圆心还在原来的位置，应该偏移回去，偏移的值等于半径的变化值
                    outerOval.style.marginLeft = -(r-b) + 'px';
                    outerOval.style.marginTop = -(r-b) + 'px';
                }

                if(t < d){
                    t++;
                    node["timer"] = setTimeout(_Run,10);
                }else{
                    _start = false;
                    clearTimeout(node["timer"]);
                    node["timer"] = null;
                }
            };
            _Run();
        };
        
        //直接触发node节点的MouseOut事件 
        var fireNodeMouseOut = function(node){
            if(!node || !(node.getAttribute("id") && node.getAttribute("ctype"))){
                return;
            }
            var nodeID = node.getAttribute("id").replace("node-", ""),
                type = node.getAttribute("ctype"),
                nodeR = CONS[type.toUpperCase()].R;

            if(type === "Core"){return;}

            if(node["timer"]){
                clearTimeout(node["timer"]);
                node["timer"] = null;
            }

            if(G.svg){
                var nodeElement = node.childNodes[0];
                nodeElement.setAttribute('r', nodeR);
            }else{
                listControl.remove("node", node);

                var nodeElement = node;
                nodeElement.style.width = 2*nodeR + 'px';
                nodeElement.style.height = 2*nodeR + 'px';
                nodeElement.style.marginLeft = "0px";
                nodeElement.style.marginTop = "0px";
            }
        };
        
        
        var lineMouseOverIndex = function(line){
            if(!line || !line.getAttribute("id")){
                return;
            }

            var ids = line.getAttribute("id").replace("line-","").split('-');
            var formElement = document.getElementById("node-"+ids[0]),
                toElement = document.getElementById("node-"+ids[1]);

            fireNodeMouseOver(formElement);
            fireNodeMouseOver(toElement);

            var parentNode=line.parentNode;
            parentNode.appendChild(line);
            parentNode.appendChild(formElement);
            parentNode.appendChild(toElement);
        };
        
        var lineMouseOutIndex = function(line){
            if(!line || !line.getAttribute("id")){
                return;
            }
            var ids = line.getAttribute("id").replace("line-","").split('-');
            var formElement = document.getElementById("node-"+ids[0]),
                toElement = document.getElementById("node-"+ids[1]);

            fireNodeMouseOut(formElement);
            fireNodeMouseOut(toElement);

            var parent = line.parentNode,
                firstChild = parent.firstChild;
            parent.insertBefore(line, firstChild);
        };
        
        //直接触发line线的MouseOver事件 
        var fireLineMouseOver = function(line){
            if(!line){return;}

            if(G.svg){
                var lineElement = line.childNodes[0], rectElement = line.childNodes[1], textElement = line.childNodes[2];
                lineElement.setAttribute('stroke', CONS.RELATELINE.LINE.STROKE_STRESS);
                line.style.cursor = "pointer";

                lineMouseOverIndex(line);

                textElement.style.fontSize = "18px";
                textElement.setAttribute("transform", "translate(0,2)");

                rectElement.setAttribute("width", 21);
                rectElement.setAttribute("height", 21);
                rectElement.setAttribute("transform", "translate(-3,-3)");
                rectElement.setAttribute('stroke', CONS.RELATELINE.RECT.STROKE_STRESS);
                rectElement.setAttribute('fill', CONS.RELATELINE.RECT.FILL_STRESS);
            }else{
                if(!line.childNodes[0] || !line.childNodes[1]){return;}

                listControl.add("line", line);

                var nodeElement = line, lineElement = line.childNodes[0], rectElement = nodeElement.childNodes[1];
                lineElement.strokecolor = CONS.RELATELINE.LINE.STROKE_STRESS;
                nodeElement.style.cursor = "pointer";

                lineMouseOverIndex(line);

                rectElement.style.marginLeft = "-3px";
                rectElement.style.marginTop = "-3px";
                rectElement.style.width = "21px";
                rectElement.style.height = "21px";

                if(rectElement.childNodes[0]){
                    rectElement.childNodes[0].style.fontSize = "18px";
                }

                rectElement.strokecolor = CONS.RELATELINE.RECT.STROKE_STRESS;
                rectElement.fillcolor = CONS.RELATELINE.RECT.FILL_STRESS;
            }
        };
        
        //直接触发line线的MouseOut事件 
        var fireLineMouseOut = function(line){
            if(!line){return;}

            if(G.svg){
                lineMouseOutIndex(line);
                var lineElement = line.childNodes[0], rectElement = line.childNodes[1], textElement = line.childNodes[2];
                lineElement.setAttribute('stroke', CONS.RELATELINE.LINE.STROKE);
                rectElement.setAttribute('stroke', CONS.RELATELINE.RECT.STROKE);
                rectElement.setAttribute('fill', CONS.RELATELINE.RECT.FILL);
                rectElement.setAttribute("width", 14);
                rectElement.setAttribute("height", 14);
                rectElement.setAttribute("transform", "translate(0,0)");

                textElement.style.fontSize = "12px";
                textElement.setAttribute("transform", "translate(0,0)");
            }else{
                if(!line.childNodes[0] || !line.childNodes[1]){return;}
                listControl.remove("line", line);

                lineMouseOutIndex(line);
                var nodeElement = line, lineElement = nodeElement.childNodes[0], rectElement = nodeElement.childNodes[1];
                lineElement.strokecolor = CONS.RELATELINE.LINE.STROKE;
                nodeElement.style.cursor = "default";

                rectElement.style.marginLeft = 0;
                rectElement.style.marginTop = 0;
                rectElement.style.width = "14px";
                rectElement.style.height = "14px";

                if(rectElement.childNodes[0]){
                    rectElement.childNodes[0].style.fontSize = "12px";
                }

                rectElement.strokecolor = CONS.RELATELINE.RECT.STROKE;
                rectElement.fillcolor = CONS.RELATELINE.RECT.FILL;
            }
        };
        
        //删除列表中所有过期的事件
        var removeAllOldList = function(){
            if(listControl.line.length){
                for(var i = listControl.line.length; i >= 0; i--){
                    fireLineMouseOut(listControl.line[i]);
                    listControl.remove("line", listControl.line[i]);
                }
            }
            if(listControl.node.length){
                for(var i = listControl.node.length; i >= 0; i--){
                    fireLineMouseOut(listControl.node[i]);
                    listControl.remove("line", listControl.node[i]);
                }
            }
        };
        
        //鼠标移上去时触发函数
        var mouseOverFunc = function(e){
            if(G.svg){
                var target = Utils.getTarget(e), _parent = target.parentNode, _class = _parent.getAttribute("class");
                if(_class == "node"){
                    if(curHoverObj !== _parent){
                        curHoverObj = _parent;

                        //查看详情
                        viewMoveDiv(_parent);
                        fireNodeMouseOver(_parent);

                        var nodeID = _parent.getAttribute("id").replace("node-", "");
                        for(var i = 0, len = me.data.nodewrap[nodeID].length; i < len; i++){
                            var subnodeID = me.data.nodewrap[nodeID][i];
                            fireNodeMouseOver(document.getElementById("node-"+subnodeID));

                            if(me.data.list[nodeID] && me.data.list[nodeID][subnodeID]){
                                fireLineMouseOver(document.getElementById("line-"+nodeID+"-"+subnodeID));
                            }
                            if(me.data.list[subnodeID] && me.data.list[subnodeID][nodeID]){
                                fireLineMouseOver(document.getElementById("line-"+subnodeID+"-"+nodeID));
                            }
                        }
                    }
                }else if(_class == "line"){
                    if(curHoverObj !== _parent){
                        curHoverObj = _parent;

                        fireLineMouseOver(_parent);
                    }
                }
            }else{
                //VML
                var target = Utils.getTarget(e), _parent = target.parentNode;

                if(target.nodeName.toLowerCase() == "oval" || _parent.nodeName.toLowerCase() == "oval"){
                    var node = (target.nodeName.toLowerCase()== "oval")?target:_parent;

                    if(curHoverObj !== node){
                        curHoverObj = node;

                        if(node.nodeName.toLowerCase() == "oval"){
                            removeAllOldList();

                            //查看详情
                            viewMoveDiv(node);
                            fireNodeMouseOver(node);

                            var nodeID = node.getAttribute("id").replace("node-", "");
                            for(var i = 0, len = me.data.nodewrap[nodeID].length; i < len; i++){
                                var subnodeID = me.data.nodewrap[nodeID][i];
                                fireNodeMouseOver(document.getElementById("node-"+subnodeID));

                                if(me.data.list[nodeID] && me.data.list[nodeID][subnodeID]){
                                    fireLineMouseOver(document.getElementById("line-"+nodeID+"-"+subnodeID));
                                }
                                if(me.data.list[subnodeID] && me.data.list[subnodeID][nodeID]){
                                    fireLineMouseOver(document.getElementById("line-"+subnodeID+"-"+nodeID));
                                }
                            }
                        }
                    }
                }else if(target.nodeName.toLowerCase() == "line" || target.parentNode.childNodes[0].nodeName == "line" || target.parentNode.parentNode.childNodes[0].nodeName == "line"){
                    //vml line
                    if(target.nodeName.toLowerCase() == "line" || target.parentNode.childNodes[0].nodeName == "line"){
                        var line = target.parentNode;
                    }else if(target.parentNode.parentNode.childNodes[0].nodeName == "line"){
                        var line = target.parentNode.parentNode;
                    }else{
                        return;
                    }

                    if(curHoverObj !== line){
                        curHoverObj = line;

                        removeAllOldList();
                        fireLineMouseOver(line);
                    }
                }
            }
        };
        
        //鼠标移走去时触发函数
        var mouseOutFunc = function(e){
            if(G.svg){
                var target = Utils.getTarget(e), _parent = target.parentNode, _class = _parent.getAttribute("class");
                if(_class == "node"){
                    if(curHoverObj === _parent && Utils.checkHover(e, _parent)){
                        curHoverObj = null;
                        fireNodeMouseOut(_parent);

                        var nodeID = _parent.getAttribute("id").replace("node-", "");
                        for(var i = 0, len = me.data.nodewrap[nodeID].length; i < len; i++){
                            var subnodeID = me.data.nodewrap[nodeID][i];
                            fireNodeMouseOut(document.getElementById("node-"+subnodeID));

                            if(me.data.list[nodeID] && me.data.list[nodeID][subnodeID]){
                                fireLineMouseOut(document.getElementById("line-"+nodeID+"-"+subnodeID));
                            }
                            if(me.data.list[subnodeID] && me.data.list[subnodeID][nodeID]){
                                fireLineMouseOut(document.getElementById("line-"+subnodeID+"-"+nodeID));
                            }
                        }
                    }
                }else if(_class == "line"){
                    if(curHoverObj === _parent && Utils.checkHover(e, _parent)){
                        curHoverObj = null;
                        fireLineMouseOut(_parent);
                    }
                }
            }else{
                //VML
                var target = Utils.getTarget(e), _parent = target.parentNode;
                if(target.nodeName.toLowerCase() == "oval" || _parent.nodeName.toLowerCase() == "oval"){
                    var node = (target.nodeName.toLowerCase()== "oval")?target:_parent;

                    if(curHoverObj === node && Utils.checkHover(e, node)){
                        curHoverObj = null;

                        if(node.nodeName.toLowerCase() == "oval"){
                            fireNodeMouseOut(node);

                            var nodeID = node.getAttribute("id").replace("node-", "");
                            for(var i = 0, len = me.data.nodewrap[nodeID].length; i < len; i++){
                                var subnodeID = me.data.nodewrap[nodeID][i];
                                fireNodeMouseOut(document.getElementById("node-"+subnodeID));

                                if(me.data.list[nodeID] && me.data.list[nodeID][subnodeID]){
                                    fireLineMouseOut(document.getElementById("line-"+nodeID+"-"+subnodeID));
                                }
                                if(me.data.list[subnodeID] && me.data.list[subnodeID][nodeID]){
                                    fireLineMouseOut(document.getElementById("line-"+subnodeID+"-"+nodeID));
                                }
                            }
                        }
                    }
                }else if(target.nodeName.toLowerCase() == "line" || target.parentNode.childNodes[0].nodeName == "line" || target.parentNode.parentNode.childNodes[0].nodeName == "line"){
                    //vml line
                    if(target.nodeName.toLowerCase() == "line" || target.parentNode.childNodes[0].nodeName == "line"){
                        var line = target.parentNode;
                    }else if(target.parentNode.parentNode.childNodes[0].nodeName == "line"){
                        var line = target.parentNode.parentNode;
                    }else{
                        return;
                    }

                    curHoverObj = null;
                    fireLineMouseOut(line);
                }
            }
        };

        Utils.addEvent(this.container, "click", clickFunc, false);
        Utils.addEvent(this.container, "mouseover", mouseOverFunc, false);
        Utils.addEvent(this.container, "mouseout", mouseOutFunc, false);

		me.showPopDiv();
    };

    /**
     * 绑定body的鼠标点击事件
     */
    RelatedSearch.prototype.bindbodyEvent = function(){
        var me = this;
        Utils.addEvent(document.body, "click", function(){
            me.popBox.style.display = 'none';
            me.moveBox.style.display = 'none';
        }, false);
    };

    /**
     * 创建弹出层
     */
    RelatedSearch.prototype.createPopBox = function(){
        var obj = document.createElement('div');
        obj.setAttribute("id", "RSearch-PopDiv");
        obj.setAttribute("class", "RSearch-PopDiv");

        this.container.appendChild(obj);
        return obj;
    };

    /**
     * 创建查看详情
     */
    RelatedSearch.prototype.createMoveBox = function(){
        var obj = document.createElement('a');
        obj.setAttribute("href", "#");
        obj.setAttribute("id", "RSearch-MoveDiv");
        obj.setAttribute("class", "RSearch-MoveDiv");

        obj.onclick = function(e){
            Utils.stopPropagation(e);
        };

        this.container.appendChild(obj);
        return obj;
    };


	//显示新闻  
	RelatedSearch.prototype.showPopDiv = function(){
		var me = this;
		// var wordmapkey = getQueryValue(location.href, "wordmapkey");
        var wordmapkey = null;

		if(wordmapkey === null){
			return;
		}
		
		var mainId = me.data.id,
			subId = null;
		
		wordmapkey = decodeURIComponent(wordmapkey);
		for(var i in this.data.nodes){
			if(wordmapkey === this.data.nodes[i]["keyword"]){
				subId = i;
				break;
			}
		}

		if(subId === null){return;}

		var links = me.getlinks(mainId, subId);

		if(!links){return;}

		var str = '<div class="RSearch-Content">';
		for(var i in links){
			var _links = links[i];
			str += '<a target="_blank" href="'+_links.url+'">'+Utils.suolve(_links.title, 36)+'</a>';
		}
		str += '</div><span class="RSearch-Close">X</span><div class="RSearch-Bg"></div>';

		
		var subnodes = me.data.nodes[subId];
		var _left = (340 + subnodes["x"])/2 + 20,
			_top = (160 + subnodes["y"])/2 + 20;


		
		//如果右侧显示不下弹出层 则对调方向箭头向左显示
		if(_left + 285 < CONS.CANVAS.WIDTH){
			me.popBox.className = 'RSearch-PopDiv RSearch-PopDiv-r';
		}else{
			me.popBox.className = 'RSearch-PopDiv RSearch-PopDiv-l';
		}

		me.popBox.innerHTML = str;
		me.popBox.style.cssText = 'display:block;position:absolute;top:'+_top+'px;left:'+_left+'px;';
		me.moveBox.style.display = 'none';            
            
	};
})(window);
