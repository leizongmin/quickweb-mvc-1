// 显示默认微博
QuickWeb.on('/', function (e) {
  loadingTimeline();
  var params = {};
  if (e.query.previous_cursor)
    params.max_id = e.query.previous_cursor;
  else
    $('.timeline').remove();
  WB2.anyWhere(function (W) {
    W.parseCMD('/statuses/home_timeline.json', function(sResult, bStatus){
      showTimeline(e, sResult);
    }, params, {method: 'get'});
  });
});

// 获取指定好友的微博信息
QuickWeb.on('/user/:uid', function (e) {
  loadingTimeline();
  var uid = e.param.uid;
  var params = {uid: uid};
  if (e.query.previous_cursor)
    params.max_id = e.query.previous_cursor;
  else
    $('.timeline').remove();
  WB2.anyWhere(function (W) {
    W.parseCMD('/statuses/user_timeline.json', function(sResult, bStatus){
      sResult.uid = uid;
      showTimeline(e, sResult);
    }, params, {method: 'get'});
  });
});


var loadingTimeline = function () {
  $('#main').append('<div class="loading"><img src="loading.gif"></div>');
  $('#main .timeline-bottom').remove();
};

// 显示微博信息
var showTimeline = function (e, sResult) {
  console.log(sResult);
  // 替换链接及时间描述文本
  var url = /((http|https|ftp):\/\/[a-zA-Z0-9_\-\/&#^=\+\?%\.]+)/g;
  moment.lang('zh-cn');
  var statuses = sResult.statuses;
  for (var i in statuses) {
    statuses[i].created_at_text = moment(statuses[i].created_at).fromNow();
    statuses[i].text = statuses[i].text.replace(url, '<a href="$1" target="_blank" title="打开链接 $1">$1</a>');
    if (statuses[i].retweeted_status) {
      statuses[i].retweeted_status.created_at_text = moment(statuses[i].retweeted_status.created_at).fromNow();
      statuses[i].retweeted_status.text = statuses[i].retweeted_status.text.replace(url, '<a href="$1" target="_blank" title="打开链接 $1">$1</a>');
    }
  }
  // 渲染页面
  $('#main .loading').remove();
  var $obj = $('.timeline-item');
  if ($obj.length > 0)
    var tpl = 'timeline';
  else
    var tpl = 'timeline_main';
  e.render(tpl, sResult, function (err, html) {
    if (err)
      return alert('出错了：' + err.stack);
    if ($obj.length > 0)
      $('.timeline').append(html);
    else
      $('#main').html(html);
    // 微博名片
    WB2.anyWhere(function (W) {
      W.widget.hoverCard({
        id:     'timeline',
        search: true
      });
    });
  });
};


// 评论列表
QuickWeb.on('/comments/:id', function (e) {
  var id = e.param.id;
  var target = '#pop-window-body';
  loadingComment(target);
  var params = {id: id};
  if (e.query.previous_cursor)
    params.max_id = e.query.previous_cursor;
  WB2.anyWhere(function (W) {
    W.parseCMD('/comments/show.json', function(sResult, bStatus){
      sResult.id = id;
      showStatusComment(e, sResult, target);
      showPopWindow(580);
    },params, {method: 'get'});
  });
});

var loadingComment = function (target) {
  $(target + ' .comment-bottom').html('<div class="loading"><img src="loading.gif"></div>');
};

// 显示评论
var showStatusComment = function (e, sResult, target) {
  console.log(sResult);
  // 替换链接及时间描述文本
  var url = /((http|https|ftp):\/\/[a-zA-Z0-9_\-\/&#^=\+\?%\.]+)/g;
  moment.lang('zh-cn');
  var comments = sResult.comments;
  for (var i in comments) {
    comments[i].created_at_text = moment(comments[i].created_at).fromNow();
    comments[i].text = comments[i].text.replace(url, '<a href="$1" target="_blank" title="打开链接 $1">$1</a>');
  }
  // 渲染页面
  var $obj = $(target + ' .status-comment-item');
  if ($obj.length > 0)
    var tpl = 'comment';
  else
    var tpl = 'comment_main';
  e.render(tpl, sResult, function (err, html) {
    $(target + ' .comment-bottom').remove();
    if ($obj.length > 0)
      $(target + ' .status-comment').append(html);
    else
      $(target).html(html);
    // 微博名片
    WB2.anyWhere(function (W) {
      W.widget.hoverCard({
        id:     target,
        search: true
      });
    });
  });
};

