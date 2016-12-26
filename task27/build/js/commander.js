'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commander = undefined;

var _craft = require('./craft.js');

var _BUS = require('./BUS.js');

var _shell = require('./shell.js');

var _adapter = require('./adapter.js');

/*
 * 指挥官模块
*/

var craftState = [],
    // 指挥官假设的飞船状态
craftNum = 0,
    // 指挥官已知的飞船数量
commander,
    create,
    move,
    stop,
    destroy,
    Command;

/**
 * 创建飞船
 */
create = function create(dynamicSys, energySys) {
  if (craftNum < 4) {
    var craft = (0, _craft.createCraft)(dynamicSys, energySys);
    craftState[craft.id] = 'stop';
    craftNum++;
  } else {
    (0, _shell.addMessage)({
      type: 'warning',
      content: 'The commander think there are too much crafts!'
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
  craftState[id] = 'move';
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
  craftState[id] = 'stop';
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
  craftState[id] = undefined;
  craftNum--;
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
  this.receiver.broadcast((0, _adapter.adapter)(this.data));
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
