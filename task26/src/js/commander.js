/*
 * 指挥官模块
*/

import { createCraft } from './craft.js';
import { mediator } from './mediator.js';

var craftState = [], // 指挥官假设的飞船状态
    craftNum = 0, // 指挥官已知的飞船数量
    commander,
    create,
    move,
    stop,
    destroy,
    Command;

/**
 * 创建飞船
 */
create = function () {
  if ( craftNum < 5 ) {
    var craft = createCraft();
    craftState[ craft.id ] = 'stop';
    craftNum++;
  } else {
    throw 'Too much craft!';
  }
};

/**
 * 命令飞船移动
 */
move = function ( id ) {
  var moveCommand = new Command( mediator, {
    id: id,
    command: 'move' 
  });
  moveCommand.execute();
  craftState[ id ] = 'move';
};

/**
 * 命令飞船停止
 */
stop = function ( id ) {
  var stopCommand = new Command( mediator, {
    id: id,
    command: 'stop'
  });
  stopCommand.execute();
  craftState[ id ] = 'stop';
};

/**
 * 命令飞船销毁
 */
destroy = function ( id ) {
  var destroyCommand = new Command( mediator, {
    id: id,
    command: 'destroy'
  });
  destroyCommand.execute();
  craftState[ id ] = undefined;
  craftNum--;
};

/**
 * Command类
 */
Command = function ( receiver, data ) {
  this.receiver = receiver;
  this.data = data;
};

/**
 * 执行命令
 */
Command.prototype.execute = function () {
  this.receiver.broadcast( this.data );
};

/**
 * 指挥官对象
 */
commander = {
  create: create,
  move: move,
  stop: stop,
  destroy: destroy
};

export { commander };