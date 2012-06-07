
QuickWeb.on('/help', function (e) {
  e.render('#pop-window-body', 'help');
  showPopWindow(600);
});

QuickWeb.on('/help', function (e) {
  alert('帮助！');
});