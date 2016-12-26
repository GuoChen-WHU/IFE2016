/*
 * 指挥官模块
*/

import { createCraft } from './craft.js';
import { BUS } from './BUS.js';
import { addMessage } from './shell.js';
import { adapter } from './adapter.js';

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
create = function ( dynamicSys, energySys ) {
  if ( craftNum < 4 ) {
    var craft = createCraft( dynamicSys, energySys );
    craftState[ craft.id ] = 'stop';
    craftNum++;
  } else {
    addMessage({
      type: 'warning',
      content: 'The commander think there are too much crafts!'
    });
  }
};

/**
 * 命令飞船移动
 */
move = function ( id ) {
  var moveCommand = new Command( BUS, {
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
  var stopCommand = new Command( BUS, {
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
  var destroyCommand = new Command( BUS, {
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
  this.receiver.broadcast( adapter( this.data ) );
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