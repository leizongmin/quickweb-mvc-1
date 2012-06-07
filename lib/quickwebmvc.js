/**
 * 客户端
 */
 
(function (window) {
  
  // 使用QuickWeb命名空间
  var me = window.QuickWeb = {};

  var debug = function (msg) {
    console.log(new Date().toString(), msg);
  };
  
  //----------------------------------------------------------------------------
  /**
   * 路由对象
   */
  var Route = function () {
    // 存储路由表
    this.staticTable = {}       // 静态转换表
    this.regexpTable = []       // 正则转换表
  }

  /**
   * 注册路由
   *
   * @param {string|RegExp} path 路径
   * @param {function|object} handle 处理函数
   * @param {object} data 附加信息
   * @return {bool}
   */
  Route.prototype.add = function (path, handle, data) {
    data = data || {}
    var p = this.parse(path);
    if (p === null)
      return false;  
    if (p.path instanceof RegExp)
      this.regexpTable.push({path: p.path, handle: handle, names: p.names, info: data});
    else
      this.staticTable[p.path] = {handle: handle, info: data};
    return true;
  }

  /**
   * 查询路由
   *
   * @param {string} url 请求的路径
   * @param {int} index 开始位置（仅对regexpTable有效）
   * @return {object} 包含 index, handle, value, info 失败返回null
   */
  Route.prototype.query = function (url, index) {
    // 先检查是否在 staticTable 中，如果没有在，再逐个判断 regexpTable
    var _static_url = this.staticTable[url];
    if (_static_url) {
      return { index: -1,                       // 索引位置
               handle: _static_url.handle,     // 处理句柄
               value: null,                    // PATH参数值
               info: _static_url.info         // 附件信息
             };
    }
      
    if (isNaN(index))
      index = 0;
    for (var i = index, n = this.regexpTable.length; i < n; i++) {
      // 查找符合的处理函数
      var r = this.regexpTable[i];
      // 清除lastIndex信息
      r.lastIndex = 0;
      // 测试正则
      var pv = r.path.exec(url);
      if (pv === null)
        continue;
      
      // 填充匹配的PATH值
      var ret = { index:		i,			     // 索引位置
                  handle: 	r.handle,   // 处理句柄
                  value:		{},         // PATH参数值
                  info:     r.info     // 附加信息
                };
      // 填充value
      if (r.names !== null) {
        var rnames = r.names;
        for (var j = 0, nlen = rnames.length; j < nlen; j++)
          ret.value[rnames[j]] = pv[j + 1];
      }
      // 如果是自定义的RegExp，则使用数字索引
      else {
        ret.value = pv.slice(1);
      }
      
      return ret;
    }
    
    // 没找到则返回null
    return null;
  }

  /**
   * 解析路径
   * 
   * @param {string|RegExp} path 路径
   * @return {object} 包含 path, names
   */
  Route.prototype.parse = function (path) {
    // 如果是RegExp类型，则直接返回
    if (path instanceof RegExp)
      return {path: path, names: null};
      
    // 如果不是string类型，返回null
    if (typeof path != 'string')
      return null;
      
    // 如果没有包含:name类型的路径，则直接返回string路径，否则将其编译成RegExp
    path = path.trim();
    var names = path.match(/:[\w\d_$]+/g);
    if (names !== null) {
      // 编译path路径
      for (var i in names)
        names[i] = names[i].substr(1);
    }
    // 替换正则表达式
    var path = '^' + path.replace(/:[\w\d_$]+/g, '([^/]+)') + '$';
    return {path: new RegExp(path), names: names};
  }

  /**
   * 删除路由
   *
   * @param {string|RegExp} path 注册时填写的路径
   * @return {bool}
   */
  Route.prototype.remove = function (path) {
    var p = this.parse(path);
    
    if (p === null)
      return false;
      
    var isReomve = false;
    // 从 regexpTable 表中查找
    if (p.path instanceof RegExp) {
      path = p.path.toString();
      for (var i = 0; i < this.regexpTable.length; i++) {
        if (this.regexpTable[i].path.toString() === path) {
          this.regexpTable.splice(i, 1);
          isReomve = true;
          i--;
        }
      }
    }
    // 从 staticTable 表中查找
    else if (p.path in this.staticTable) {
      delete this.staticTable[p.path];
      isReomve = true;
    }
    
    return isReomve;
  }
  
  //----------------------------------------------------------------------------
  // 解析URL参数
  var parseQueryString = function (qs) {
    var sep = '&';
    var eq = '=';
    var obj = {};
    if (typeof qs !== 'string' || qs.length === 0)
      return obj;
    var regexp = /\+/g;
    qs = qs.split(sep);
    for (var i = 0, len = qs.length; i < len; ++i) {
      var x = qs[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr = x.substring(0, idx),
          vstr = x.substring(idx + 1), k, v;
      try {
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
      } catch (e) {
        k = unescape(kstr, true);
        v = unescape(vstr, true);
      }
      obj[k] = v;
    }
    return obj;
  };
  
  // 解析URL
  var parseUrl = function (url) {
    var ret = {};
    var qm = url.indexOf('?');
    if (qm === -1) {
      ret.path = url;
      ret.query = {};
    }
    else {
      ret.path = url.substr(0, qm);
      ret.query = parseQueryString(url.substr(qm + 1));
    }
    return ret;
  };
  
  //----------------------------------------------------------------------------
  me.route = new Route();
  
  var fixUrl = function (url) {
    if (url[0] !== '/')
      url = '/' + url;
    return url;
  };
  
  /**
   * 注册全局控制器
   */
  me.on = function (url, handle) {
    url = fixUrl(url);
    debug('注册路由：' + url);
    me.route.add(url, handle);
  };
  
  /**
   * 页面跳转
   */
  me.redirect = function (url) {
    debug('重定向：' + url);
    window.location = '#' + url;
  };
  
  var onHashChange = function (e) {
    if (me.initialized !== true)
      return debug('未初始化应用');
    var url = location.hash.substr(1);
    url = parseUrl(fixUrl(url));
    var ret = null;
    var i = 0;
    var c = 0;
    while (ret = me.route.query(url.path, i)) {
      c++;
      debug('@' + c + '转到：' + url.path);
      var obj = new HashEventObject(url, ret);
      try {
        ret.handle(obj);
      }
      catch (err) {
        console.error(err.stack);
      }
      if (ret.index < 0)
        break;
      i = ret.index + 1;
    }
    if (c < 1) {
      debug('没有注册的路由：' + url.path);
    }
  };
  
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('load', onHashChange);

  //----------------------------------------------------------------------------
  // 初始化应用
  me.initApp = function () {
    debug('初始化应用...');
    // 编译应用模板
    var tpl = TinyLiquid.compileAll(me.app._template);
    me.app.template = tpl;
    me.initialized = true;
  };
  
  //----------------------------------------------------------------------------
  // 输出操作对象
  var HashEventObject = me.HashEventObject = function (url, info) {
    this.path = url.path;
    this.query = url.query;
    this.param = info.value;
  };
  
  // 渲染模板到页面指定位置
  HashEventObject.prototype._renderDom = function (target, view, data, options) {
    options = options || {};
    var tpl = me.app.template[view];
    if (typeof tpl !== 'function')
      return console.error('没有模版：' + view);
    debug('渲染：' + view + ' => ' + target);
    TinyLiquid.advRender(tpl, data, options, function (err, html) {
      if (err)
        return console.error(err.stack);
      var objs = document.querySelectorAll(target);
      for (var i = 0, len = objs.length; i < len; i++)
        objs[i].innerHTML = html;
    });
  }; 
  // 渲染模板，返回HTML
  HashEventObject.prototype._renderHtml = function (view, data, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    var tpl = me.app.template[view];
    if (typeof tpl !== 'function')
      return console.error('没有模版：' + view);
    debug('渲染：' + view);
    TinyLiquid.advRender(tpl, data, options, function (err, html) {
      if (err)
        console.error(err.stack);
      callback(err, html);
    });
  };
  // 渲染页面
  HashEventObject.prototype.render = function (a, b, c, d) {
    if (typeof c === 'function' || typeof d === 'function')
      this._renderHtml(a, b, c, d);
    else
      this._renderDom(a, b, c, d);
  };
  // 重定向
  HashEventObject.prototype.redirect = me.redirect;
  
})(window);