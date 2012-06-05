var compile = require('../lib/compile');
var should = require('should');
var path = require('path');
var fs = require('fs');

describe('test compile', function () {

  it('#_compileController', function (done) {
    compile._compileController(path.resolve(__dirname, 'controller'), function (err, code) {
      should.equal(err, null);
      console.log(code);
      done();
    });
  });
  
  it('#_compileTemplate', function (done) {
    compile._compileTemplate(path.resolve(__dirname, 'template'), function (err, code) {
      should.equal(err, null);
      console.log(code);
      done();
    });
  });
  
  it('#compile', function (done) {
    compile.compile(path.resolve(__dirname), function (err, code) {
      should.equal(err, null);
      console.log(code);
      done();
    });
  });

});