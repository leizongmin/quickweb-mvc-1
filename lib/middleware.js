/**
 * 中间件接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var path = require('path');
var compile = require('./compile');
var quickweb = require('quickweb-base');


/**
 * 返回一个中间件接口
 *
 * @param {object} options
 * @return {function}
 */
module.exports = function (options) {
  options = options || {};
  options.path = options.path || '.';
  options.prefix = options.prefix || '/QuickWeb/';
  
  options.path = path.resolve(options.path);
  if (options.prefix[0] !== '/')
    options.prefix = '/' + options.prefix;
  if (options.prefix.substr(-1) !== '/')
    options.prefix += '/';
    
  var appdir = options.path;
  var dirlen = appdir.length;
  var prefix = options.prefix;
  var fixlen = prefix.length;
  
  // 先编译应用
  var APP_CODE = '';
  compile.compile(appdir, function (err, code) {
    if (err) {
      APP_CODE = 'alert(\'' + err + '\');';
    }
    else {
      APP_CODE = code;
    }
  });
  
  var app = quickweb();
  // 内置文件
  app.route.all(prefix + 'quickwebmvc.js', function (req, res, next) {
    res.sendStaticFile(path.resolve(__dirname, 'quickwebmvc.js'));
  });
  app.route.all(prefix + 'tinyliquid.js', function (req, res, next) {
    res.sendStaticFile(path.resolve(__dirname, 'tinyliquid.js'));
  });
  app.route.all(prefix + 'app.js', function (req, res, next) {
    res.contentType('application/javascript');
    res.send(APP_CODE);
  });
  // public目录的资源文件
  app.onNotFound = function (req, res, next) {
    var filename = req.filename.substr(fixlen);
    if (filename === '')
      filename = 'index.html';
    filename = path.resolve(appdir, 'public', filename);
    if (filename.substr(0, dirlen) !== appdir)
      return res.sendError(403, 'Access Denied!');
    res.sendStaticFile(filename);
  };
  
  return function (req, res, next) {
    var i = req.url.indexOf('?');
    var pathname = i === -1 ? req.url : req.url.substr(0, i);
    if (pathname.substr(0, fixlen) === prefix) {
      app.handle(req, res);
    }
    else {
      next();
    }
  };
}; 
