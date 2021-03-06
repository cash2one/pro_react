"use strict";

// jQuery REST Client - v1.0.2 - https://github.com/jpillora/jquery.rest
// Jaime Pillora <dev@jpillora.com> - MIT Copyright 2014
(function (a, b, c) {
  "use strict";
  var d, e, f, g, h, i, j, k, l, m, n, o;j = function j(a) {
    throw new Error("ERROR: jquery.rest: " + a);
  }, l = function l(a) {
    var b;for (b = ""; a-- > 0;) {
      b += "  ";
    }return b;
  }, i = function i(b) {
    return a.btoa || j("You need a polyfill for 'btoa' to use basic auth."), a.btoa(b);
  }, m = function m(b) {
    return a.JSON || j("You need a polyfill for 'JSON' to use stringify."), a.JSON.stringify(b);
  }, k = function k(a, c) {
    var d;return d = function d() {}, d.prototype = a, b.extend(!0, new d(), c);
  }, n = function n(a) {
    return a && b.isPlainObject(a) ? (b.each(a, function (a) {
      return g[a] === c ? j("Unknown option: '" + a + "'") : void 0;
    }), null) : !1;
  }, o = function o(a, c) {
    return "string" !== b.type(c) ? j("'" + a + "' must be a string") : void 0;
  }, h = function h() {
    return alert('"delete()" has been deprecated. Please use "destroy()" or "del()" instead.');
  }, g = { url: "", cache: 0, request: function request(a, c) {
      return b.ajax(c);
    }, isSingle: !1, autoClearCache: !0, cachableMethods: ["GET"], methodOverride: !1, stringifyData: !1, stripTrailingSlash: !1, password: null, username: null, verbs: { create: "POST", read: "GET", update: "PUT", destroy: "DELETE" }, ajax: { dataType: "json" } }, d = function () {
    function a(a) {
      this.parent = a, this.c = {};
    }return a.prototype.valid = function (a) {
      var b;return b = new Date().getTime() - a.getTime(), b <= 1e3 * this.parent.opts.cache;
    }, a.prototype.key = function (a) {
      var c,
          d = this;return c = "", b.each(a, function (a, e) {
        return c += a + "=" + (b.isPlainObject(e) ? "{" + d.key(e) + "}" : e) + "|";
      }), c;
    }, a.prototype.get = function (a) {
      var b;return (b = this.c[a]) ? this.valid(b.created) ? b.data : void 0 : void 0;
    }, a.prototype.put = function (a, b) {
      return this.c[a] = { created: new Date(), data: b };
    }, a.prototype.clear = function (a) {
      var c = this;return a ? b.each(this.c, function (b) {
        return b.match(a) ? delete c.c[b] : void 0;
      }) : this.c = {};
    }, a;
  }(), f = function () {
    function a(a, c, d, e) {
      this.name = a, this.method = c, null == d && (d = {}), this.parent = e, o("name", this.name), o("method", this.method), n(d), this.parent[this.name] && j("Cannot add Verb: '" + a + "' already exists"), this.method = c.toUpperCase(), d.url || (d.url = ""), this.opts = k(this.parent.opts, d), this.root = this.parent.root, this.custom = !g.verbs[this.name], this.call = b.proxy(this.call, this), this.call.instance = this;
    }return a.prototype.call = function () {
      var a, b, c;return c = this.parent.extractUrlData(this.method, arguments), b = c.url, a = c.data, this.custom && (b += this.opts.url || this.name), this.parent.ajax.call(this, this.method, b, a);
    }, a.prototype.show = function (a) {
      return console.log(l(a) + this.name + ": " + this.method);
    }, a;
  }(), e = function () {
    function a(b, c, d) {
      null == c && (c = {}), n(c), d && d instanceof a ? (this.name = b, o("name", this.name), this.constructChild(d, c)) : (this.url = b || "", o("url", this.url), this.constructRoot(c));
    }return a.prototype.constructRoot = function (a) {
      return this.opts = k(g, a), this.root = this, this.expectedIds = 0, this.urlNoId = this.url, this.cache = new d(this), this.parent = null, this.name = this.opts.name || "ROOT";
    }, a.prototype.constructChild = function (c, d) {
      return this.parent = c, o("name", this.name), this.parent instanceof a || this.error("Invalid parent"), this.parent[this.name] && this.error("'" + name + "' already exists"), d.url || (d.url = ""), this.opts = k(this.parent.opts, d), this.opts.isSingle = "isSingle" in d && d.isSingle, this.root = this.parent.root, this.urlNoId = this.parent.url + ("" + (this.opts.url || this.name) + "/"), this.url = this.urlNoId, this.expectedIds = this.parent.expectedIds, this.opts.isSingle || (this.expectedIds += 1, this.url += ":ID_" + this.expectedIds + "/"), b.each(this.opts.verbs, b.proxy(this.addVerb, this)), this.destroy ? (this.del = this.destroy, this["delete"] = h) : void 0;
    }, a.prototype.error = function (a) {
      return j("Cannot add Resource: " + a);
    }, a.prototype.add = function (b, c) {
      return this[b] = new a(b, c, this);
    }, a.prototype.addVerb = function (a, b, c) {
      return this[a] = new f(a, b, c, this).call;
    }, a.prototype.show = function (c) {
      return null == c && (c = 0), c > 25 && j("Plugin Bug! Recursion Fail"), this.name && console.log(l(c) + this.name + ": " + this.url), b.each(this, function (a, d) {
        return "function" === b.type(d) && d.instance instanceof f && "del" !== a ? d.instance.show(c + 1) : void 0;
      }), b.each(this, function (b, d) {
        return "parent" !== b && "root" !== b && d instanceof a ? d.show(c + 1) : void 0;
      }), null;
    }, a.prototype.toString = function () {
      return this.name;
    }, a.prototype.extractUrlData = function (a, c) {
      var d, e, f, g, h, i, k, l, m, n, o, p, q, r, s, t;for (k = [], g = null, m = null, q = 0, s = c.length; s > q; q++) {
        d = c[q], o = b.type(d), "string" === o || "number" === o ? k.push(d) : "object" === o && null === g ? g = d : "object" === o && null === m ? m = d : j("Invalid argument: " + d + " (" + o + "). Must be strings or ints (IDs) followed by one optional object and one optional query params object.");
      }for (n = k.length, e = "create" !== a, f = "update" !== a && "delete" !== a, p = null, e && n === this.expectedIds && (p = this.url), f && n === this.expectedIds - 1 && (p = this.urlNoId), null === p && (f && (l = this.expectedIds - 1), e && (l = (l ? l + " or " : "") + this.expectedIds), j("Invalid number of ID arguments, required " + l + ", provided " + n)), h = r = 0, t = k.length; t > r; h = ++r) {
        i = k[h], p = p.replace(new RegExp("/:ID_" + (h + 1) + "/"), "/" + i + "/");
      }return m && (p += "?" + b.param(m)), { url: p, data: g };
    }, a.prototype.ajax = function (a, c, d) {
      var e,
          f,
          g,
          h,
          k,
          l,
          n,
          o = this;return a || j("method missing"), c || j("url missing"), h = {}, this.opts.username && this.opts.password && (f = i(this.opts.username + ":" + this.opts.password), h.Authorization = "Basic " + f), d && this.opts.stringifyData && "GET" !== a && "HEAD" !== a && (d = m(d), h["Content-Type"] = "application/json"), this.opts.methodOverride && "GET" !== a && "HEAD" !== a && "POST" !== a && (h["X-HTTP-Method-Override"] = a, a = "POST"), this.opts.stripTrailingSlash && (c = c.replace(/\/$/, "")), e = { url: c, type: a, headers: h }, d && (e.data = d), e = b.extend(!0, {}, this.opts.ajax, e), n = this.opts.cache && b.inArray(a, this.opts.cachableMethods) >= 0, n && (k = this.root.cache.key(e), l = this.root.cache.get(k)) ? l : (this.opts.cache && this.opts.autoClearCache && -1 === b.inArray(a, this.opts.cachableMethods) && (g = c.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), this.root.cache.clear(new RegExp(g))), l = this.opts.request(this.parent, e), n && l.done(function () {
        return o.root.cache.put(k, l);
      }), l);
    }, a;
  }(), e.defaults = g, b.RestClient = e;
}).call(undefined, window, jQuery);