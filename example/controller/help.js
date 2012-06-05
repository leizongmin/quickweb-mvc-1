
QuickWeb.get('/help', function (e) {
  e.render('#pop-window-body', 'help');
  showPopWindow(600);
});

QuickWeb.get('/help', function (e) {
  alert('帮助！');
});