'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dc = undefined;

var _adapter = require('./adapter.js');

var _shell = require('./shell.js');

var _BUS = require('./BUS.js');

var dc,
    receiver,
    craftNum = 0,
    handler;

/**
 * 行星上的信号接收器
 */
receiver = function receiver(binary) {
  handler(binary);
};

/**
 * 处理接收器传过来的数据
 */
handler = function handler(binary) {
  var data = _adapter.adapter.toObj(binary);

  if (data.status === 'destroy') {
    _shell.shell.monitor.remove(data.id);
    craftNum--;
  } else {
    _shell.shell.monitor.update(data);
  }
};

/**
 * 数据处理中心的公共API
 */
exports.dc = dc = {

  getCraftNum: function getCraftNum() {
    return craftNum;
  },

  /**
   * 新建飞船的状态信息
   */
  init: function init(id, dynamicSys, energySys) {
    var record = {
      id: id,
      dynamicSys: dynamicSys,
      energySys: energySys,
      status: 'stop',
      energy: 100
    };
    craftNum++;
    _shell.shell.monitor.add(record);
  }
};

_BUS.BUS.listen('status', receiver);

exports.dc = dc;
