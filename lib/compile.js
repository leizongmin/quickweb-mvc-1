'use strict';

/**
 * 编译文件
 *
 * @author 老雷<leizongmin@gmail.com>
 */
 
var fs = require('fs');
var path = require('path');
var CPU_NUM = require('os').cpus().length;

/**
 * 遍历目录里面的所有文件
 *
 * @param {string} dir 目录名
 * @param {function} findOne 找到一个文件时的回调，格式：function (filename, stats, next)
 * @param {function} callback 格式：function (err)
 */
var expandDir = function (dir, findOne, callback) {
  if (!callback) {
    callback = findOne;
    findOne = function (file, stats, next) {
      next();
    };
  }
  fs.stat(dir, function (err, stats) {
    if (err)
      return callback(err);
    findOne(dir, stats, function () {
      if (!stats.isDirectory()) {
        return callback(null);
      } else {
        fs.readdir(dir, function (err, files) {
          if (err)
            return callback(err);
          for (var i = 0, len = files.length; i < len; i++)
            files[i] = path.join(dir, files[i]);
          var finish = 0;
          var threadFinish = function () {
            finish++;
            if (finish >= CPU_NUM)
              return callback(null);
          };
          var next = function () {
            var f = files.pop();
            if (!f)
              return threadFinish();
            expandDir(f, findOne, function (err, s) {
              if (err)
                return callback(err);
              next();
            });
          };
          for (var i = 0; i < CPU_NUM; i++)
            next();
        });
      }
    });
  });
};

/**
 * 编译control目录
 *
 * @param {string} dir
 * @param {function} callback 格式：function (err, code)
 */
var _compileController = exports._compileController = function (dir, callback) {
  var codes = [];
  expandDir(dir, function (file, stats, next) {
    if (stats.isDirectory())
      return next();
    fs.readFile(file, 'utf8', function (err, data) {
      codes.push('(function () {\n' + data + '\n})();\n');
      next();
    });
  }, function (err) {
    codes = codes.join('\n');
    return callback(err, codes);
  });
};

/**
 * 编译template目录
 *
 * @param {string} dir
 * @param {function} callback 格式：function (err, tpl)
 */
var _compileTemplate = exports._compileTemplate = function (dir, callback) {
  // 读取所有模板文件
  var tpl = {};
  var getTemplateName = function (file) {
    file = file.substr(dir.length);
    if (file[0] === '\\' || file[0] === '/')
      file = file.substr(1);
    var extname = path.extname(file);
    file = file.substr(0, file.length - extname.length);
    file = file.replace(/\\/img, '/');
    return file;
  };
  expandDir(dir, function (file, stats, next) {
    if (stats.isDirectory())
      return next();
    fs.readFile(file, 'utf8', function (err, data) {
      tpl[getTemplateName(file)] = data;
      next();
    });
  }, function (err) {
    tpl = JSON.stringify(tpl);
    return callback(err, tpl);
  });
};

/**
 * 编译应用目录
 *
 * @param {string} dir
 * @param {function} callback 格式：function (err, code)
 */
exports.compile = function (dir, callback) {
  _compileTemplate(path.resolve(dir, 'template'), function (err, tpl) {
    if (err)
      tpl = '{}';
    _compileController(path.resolve(dir, 'controller'), function (err, code) {
      if (err)
        code = '';
      
      var appcode = '(function (QuickWeb, TinyLiquid) {\n'
                  + 'QuickWeb.app = {};\n'
                  + '/* template file */\n'
                  + 'QuickWeb.app._template = ' + tpl + ';\n\n'
                  + '/* controller */\n'
                  + code + '\n'
                  + '/* initialize */\n'
                  + 'QuickWeb.initApp();\n'
                  + '})(QuickWeb, TinyLiquid);';
      return callback(null, appcode);
    });
  });
};