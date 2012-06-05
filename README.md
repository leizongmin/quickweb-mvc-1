quickweb-mvc
============

基于TinyLiquid模板引擎的前端MVC框架


    var mvc = require('quickweb-mvc');
    var quickweb = require('quickweb-base');
    var http = require('http');
    
    var app = quickweb();
    app.use(mvc.middleware('.', '/app'));
   
    http.createServer(app.handler()).listen(80);
    
