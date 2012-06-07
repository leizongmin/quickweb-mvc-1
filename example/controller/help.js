
QuickWeb.on('/help', function (e) {
  e.render('#pop-window-body', 'help');
  showPopWindow(600);
});

QuickWeb.on('/help', function (e) {
  alert('帮助！');
  e.redirect('/error?msg=测试一下而已，不必当真~~');
});

QuickWeb.on('/error', function (e) {
  e.render('#pop-window-body', 'error', {message: e.query.msg});
});