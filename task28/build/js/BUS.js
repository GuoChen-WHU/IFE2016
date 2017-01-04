'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BUS = undefined;

var _shellConsole = require('./shell.console.js');

var delay = 300;

var clientList = {},
    broadcast,
    notify,
    listen,
    remove,
    BUS;

/**
 * 广播命令，有10%概率失败
 */
broadcast = function send(event, data) {
  var success = Math.random() < 0.1 ? false : true;

  if (success) {
    (0, _shellConsole.addMessage)({
      type: 'normal',
      content: 'Message sent successfully.'
    });
    setTimeout(function () {
      notify(event, data);
    }, delay);
  } else {
    (0, _shellConsole.addMessage)({
      type: 'warning',
      content: 'Message dismissed in BUS, try again later.'
    });
    setTimeout(function () {
      send(event, data);
    }, delay);
  }
};

/**
 * 通知所有监听者
 */
notify = function notify(event, data) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = clientList[event][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var client = _step.value;

      client.apply(null, [data]);
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
listen = function listen(event, fn) {
  if (!clientList[event]) {
    clientList[event] = [fn];
  } else {
    clientList[event].push(fn);
  }
};

/**
 * 移除监听者
 */
remove = function remove(event, fn) {
  var len;
  if (clientList[event]) {
    len = clientList[event].length;
    for (var i = 0; i < len; i++) {
      if (clientList[event][i] === fn) {
        clientList[event].splice(i, 1);
        return;
      }
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
