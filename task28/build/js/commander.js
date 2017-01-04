'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commander = undefined;

var _craft = require('./craft.js');

var _BUS = require('./BUS.js');

var _adapter = require('./adapter.js');

var _dc = require('./dc.js');

var _shellConsole = require('./shell.console.js');

var commander, create, move, stop, destroy, Command;

/**
 * 创建飞船
 */
/*
 * 指挥官模块
*/
create = function create(dynamicSys, energySys) {
  if (_dc.dc.getCraftNum() < 4) {
    var craft = (0, _craft.createCraft)(dynamicSys, energySys);
    _dc.dc.init(craft.id, dynamicSys, energySys);
  } else {
    (0, _shellConsole.addMessage)({
      type: 'warning',
      content: 'There are too much crafts!'
    });
  }
};

/**
 * 命令飞船移动
 */
move = function move(id) {
  var moveCommand = new Command(_BUS.BUS, {
    id: id,
    command: 'move'
  });
  moveCommand.execute();
};

/**
 * 命令飞船停止
 */
stop = function stop(id) {
  var stopCommand = new Command(_BUS.BUS, {
    id: id,
    command: 'stop'
  });
  stopCommand.execute();
};

/**
 * 命令飞船销毁
 */
destroy = function destroy(id) {
  var destroyCommand = new Command(_BUS.BUS, {
    id: id,
    command: 'destroy'
  });
  destroyCommand.execute();
};

/**
 * Command类
 */
Command = function Command(receiver, data) {
  this.receiver = receiver;
  this.data = data;
};

/**
 * 执行命令
 */
Command.prototype.execute = function () {
  this.receiver.broadcast('command', _adapter.adapter.toBinary(this.data));
};

/**
 * 指挥官对象
 */
exports.commander = commander = {
  create: create,
  move: move,
  stop: stop,
  destroy: destroy
};

exports.commander = commander;
