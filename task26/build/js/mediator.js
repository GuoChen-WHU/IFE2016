'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mediator = undefined;

var _shell = require('./shell.js');

var clientList = [],
    // 消息订阅者
broadcast,
    notify,
    listen,
    remove,
    mediator;

/**
 * 广播命令，有30%概率失败
 */
broadcast = function broadcast(data) {
  var success = Math.random() < 0.3 ? false : true;
  (0, _shell.addMessage)({
    type: 'normal',
    content: 'The commander command craft' + data.id + ' to ' + data.command
  });

  if (success) {
    setTimeout(function () {
      notify(data);
    }, 1000);
  } else {
    (0, _shell.addMessage)({
      type: 'warning',
      content: 'But the command is dismissed!'
    });
  }
};

/**
 * 通知所有监听者
 */
notify = function notify() {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = clientList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var client = _step.value;

      client.apply(null, arguments);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

/**
 * 添加监听者
 */
listen = function listen(fn) {
  clientList.push(fn);
};

/**
 * 移除监听者
 */
remove = function remove(fn) {
  var len = clientList.length;
  for (var i = 0; i < len; i++) {
    if (clientList[i] === fn) {
      clientList.splice(i, 1);
      return;
    }
  }
};

/**
 * mediator对象
 */
exports.mediator = mediator = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};

exports.mediator = mediator;
