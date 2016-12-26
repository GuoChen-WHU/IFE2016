'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BUS = undefined;

var _shell = require('./shell.js');

var delay = 300;

var clientList = [],
    // 消息订阅者
broadcast,
    notify,
    listen,
    remove,
    BUS;

/**
 * 广播命令，有10%概率失败
 */
broadcast = function send(data) {
  var success = Math.random() < 0.1 ? false : true;

  if (success) {
    (0, _shell.addMessage)({
      type: 'noraml',
      content: 'Send command ' + data + ' via BUS'
    });
    setTimeout(function () {
      notify(data);
    }, delay);
  } else {
    (0, _shell.addMessage)({
      type: 'warning',
      content: 'Command dismissed, try again...'
    });
    send(data);
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
 * BUS对象
 */
exports.BUS = BUS = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};

exports.BUS = BUS;
