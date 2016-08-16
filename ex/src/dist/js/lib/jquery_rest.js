(function(t,e,n){"use strict";var r,s,i,o,a,h,u,c,l,p,d,f;u=function(t){throw new Error("ERROR: jquery.rest: "+t)},l=function(t){var e;for(e="";t-->0;)e+="  ";return e},h=function(e){return t.btoa||u("You need a polyfill for 'btoa' to use basic auth."),t.btoa(e)},p=function(e){return t.JSON||u("You need a polyfill for 'JSON' to use stringify."),t.JSON.stringify(e)},c=function(t,n){var r;return r=function(){},r.prototype=t,e.extend(!0,new r,n)},d=function(t){return t&&e.isPlainObject(t)?(e.each(t,function(t){return o[t]===n?u("Unknown option: '"+t+"'"):void 0}),null):!1},f=function(t,n){return"string"!==e.type(n)?u("'"+t+"' must be a string"):void 0},a=function(){return alert('"delete()" has been deprecated. Please use "destroy()" or "del()" instead.')},o={url:"",cache:0,request:function(t,n){return e.ajax(n)},isSingle:!1,autoClearCache:!0,cachableMethods:["GET"],methodOverride:!1,stringifyData:!1,stripTrailingSlash:!1,password:null,username:null,verbs:{create:"POST",read:"GET",update:"PUT",destroy:"DELETE"},ajax:{dataType:"json"}},r=function(){function t(t){this.parent=t,this.c={}}return t.prototype.valid=function(t){var e;return e=(new Date).getTime()-t.getTime(),e<=1e3*this.parent.opts.cache},t.prototype.key=function(t){var n,r=this;return n="",e.each(t,function(t,s){return n+=t+"="+(e.isPlainObject(s)?"{"+r.key(s)+"}":s)+"|"}),n},t.prototype.get=function(t){var e;return(e=this.c[t])&&this.valid(e.created)?e.data:void 0},t.prototype.put=function(t,e){return this.c[t]={created:new Date,data:e}},t.prototype.clear=function(t){var n=this;return t?e.each(this.c,function(e){return e.match(t)?delete n.c[e]:void 0}):this.c={}},t}(),i=function(){function t(t,n,r,s){this.name=t,this.method=n,null==r&&(r={}),this.parent=s,f("name",this.name),f("method",this.method),d(r),this.parent[this.name]&&u("Cannot add Verb: '"+t+"' already exists"),this.method=n.toUpperCase(),r.url||(r.url=""),this.opts=c(this.parent.opts,r),this.root=this.parent.root,this.custom=!o.verbs[this.name],this.call=e.proxy(this.call,this),this.call.instance=this}return t.prototype.call=function(){var t,e,n;return n=this.parent.extractUrlData(this.method,arguments),e=n.url,t=n.data,this.custom&&(e+=this.opts.url||this.name),this.parent.ajax.call(this,this.method,e,t)},t.prototype.show=function(t){return console.log(l(t)+this.name+": "+this.method)},t}(),s=function(){function t(e,n,r){null==n&&(n={}),d(n),r&&r instanceof t?(this.name=e,f("name",this.name),this.constructChild(r,n)):(this.url=e||"",f("url",this.url),this.constructRoot(n))}return t.prototype.constructRoot=function(t){return this.opts=c(o,t),this.root=this,this.expectedIds=0,this.urlNoId=this.url,this.cache=new r(this),this.parent=null,this.name=this.opts.name||"ROOT"},t.prototype.constructChild=function(n,r){return this.parent=n,f("name",this.name),this.parent instanceof t||this.error("Invalid parent"),this.parent[this.name]&&this.error("'"+name+"' already exists"),r.url||(r.url=""),this.opts=c(this.parent.opts,r),this.opts.isSingle="isSingle"in r&&r.isSingle,this.root=this.parent.root,this.urlNoId=this.parent.url+(""+(this.opts.url||this.name)+"/"),this.url=this.urlNoId,this.expectedIds=this.parent.expectedIds,this.opts.isSingle||(this.expectedIds+=1,this.url+=":ID_"+this.expectedIds+"/"),e.each(this.opts.verbs,e.proxy(this.addVerb,this)),this.destroy?(this.del=this.destroy,this["delete"]=a):void 0},t.prototype.error=function(t){return u("Cannot add Resource: "+t)},t.prototype.add=function(e,n){return this[e]=new t(e,n,this)},t.prototype.addVerb=function(t,e,n){return this[t]=new i(t,e,n,this).call},t.prototype.show=function(n){return null==n&&(n=0),n>25&&u("Plugin Bug! Recursion Fail"),this.name&&console.log(l(n)+this.name+": "+this.url),e.each(this,function(t,r){return"function"===e.type(r)&&r.instance instanceof i&&"del"!==t?r.instance.show(n+1):void 0}),e.each(this,function(e,r){return"parent"!==e&&"root"!==e&&r instanceof t?r.show(n+1):void 0}),null},t.prototype.toString=function(){return this.name},t.prototype.extractUrlData=function(t,n){var r,s,i,o,a,h,c,l,p,d,f,m,y,g,v,b;for(c=[],o=null,p=null,y=0,v=n.length;v>y;y++)r=n[y],f=e.type(r),"string"===f||"number"===f?c.push(r):"object"===f&&null===o?o=r:"object"===f&&null===p?p=r:u("Invalid argument: "+r+" ("+f+"). Must be strings or ints (IDs) followed by one optional object and one optional query params object.");for(d=c.length,s="create"!==t,i="update"!==t&&"delete"!==t,m=null,s&&d===this.expectedIds&&(m=this.url),i&&d===this.expectedIds-1&&(m=this.urlNoId),null===m&&(i&&(l=this.expectedIds-1),s&&(l=(l?l+" or ":"")+this.expectedIds),u("Invalid number of ID arguments, required "+l+", provided "+d)),a=g=0,b=c.length;b>g;a=++g)h=c[a],m=m.replace(new RegExp("/:ID_"+(a+1)+"/"),"/"+h+"/");return p&&(m+="?"+e.param(p)),{url:m,data:o}},t.prototype.ajax=function(t,n,r){var s,i,o,a,c,l,d,f=this;return t||u("method missing"),n||u("url missing"),a={},this.opts.username&&this.opts.password&&(i=h(this.opts.username+":"+this.opts.password),a.Authorization="Basic "+i),r&&this.opts.stringifyData&&"GET"!==t&&"HEAD"!==t&&(r=p(r),a["Content-Type"]="application/json"),this.opts.methodOverride&&"GET"!==t&&"HEAD"!==t&&"POST"!==t&&(a["X-HTTP-Method-Override"]=t,t="POST"),this.opts.stripTrailingSlash&&(n=n.replace(/\/$/,"")),s={url:n,type:t,headers:a},r&&(s.data=r),s=e.extend(!0,{},this.opts.ajax,s),d=this.opts.cache&&e.inArray(t,this.opts.cachableMethods)>=0,d&&(c=this.root.cache.key(s),l=this.root.cache.get(c))?l:(this.opts.cache&&this.opts.autoClearCache&&-1===e.inArray(t,this.opts.cachableMethods)&&(o=n.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1"),this.root.cache.clear(new RegExp(o))),l=this.opts.request(this.parent,s),d&&l.done(function(){return f.root.cache.put(c,l)}),l)},t}(),s.defaults=o,e.RestClient=s}).call(this,window,jQuery);