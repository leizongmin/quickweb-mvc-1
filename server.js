'use strict';

/**
 * 在线测试服务器
 *
 * @author 老雷<leizongmin@gmail.com>
 */

/*
 启动方法：  node server.js [应用目录] [端口]
*/
 
var http = require('http');
var path = require('path');
var quickweb = require('quickweb-base');
var compile = require('./lib/compile');
var middleware = require('./lib/middleware');


// 设置应用目录
if (process.argv[2])
  process.chdir(process.argv[2]);

var app = quickweb();
app.use(middleware({path: '.', prefix: '/app'}));
app.onNotFound = function (req, res) {
  var filename = req.filename === '/' ? 'index.html' : req.filename.substr(1);
  res.sendStaticFile(filename);
};

var server = http.createServer(app.handler());
var port = parseInt(process.argv[2]);
if (isNaN(port))
  port = 8080;
server.listen(port);
console.log('Server listen on http://127.0.0.1:' + port + '/app/');
