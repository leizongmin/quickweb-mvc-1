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
 * @param {string} appdir 应用目录，默认为当前目录
 * @param {string} fix URL前缀，默认为/QuickWeb
 * @return {function}
 */
module.exports = function (appdir, fix) {
  if (typeof appdir !== 'string')
    appdir = '.';
  appdir = path.resolve(appdir);
  if (typeof fix !== 'string')
    fix = '/QuickWeb/';
  if (fix[0] !== '/')
    fix = '/' + fix;
  if (fix.substr(-1) !== '/')
    fix += '/';
  var fixlen = fix.length;
  
  // 先编译应用
  var APP_CODE = '';
  compile.compile(appdir, function (err, code) {
    if (err) {
      APP_CODE = 'alert(\'' + err + '\');';
      throw err;
    }
    else {
      APP_CODE = code;
    }
  });
  
  var app = quickweb();
  app.route.all(fix + 'quickwebmvc.js', function (req, res, next) {
    res.sendStaticFile(path.resolve(__dirname, 'quickwebmvc.js'));
  });
  app.route.all(fix + 'tinyliquid.js', function (req, res, next) {
    res.sendStaticFile(path.resolve(__dirname, 'tinyliquid.js'));
  });
  app.route.all(fix + 'app.js', function (req, res, next) {
    res.contentType('application/javascript');
    res.send(APP_CODE);
  });
  
  return function (req, res, next) {
    var i = req.url.indexOf('?');
    var pathname = i === -1 ? req.url : req.url.substr(0, i);
    if (pathname.substr(0, fix.length) === fix) {
      app.handle(req, res);
    }
    else {
      next();
    }
  };
}; 
