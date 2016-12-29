/*
 * 指挥官模块
*/

import { createCraft } from './craft.js';
import { BUS } from './BUS.js';
import { addMessage } from './shell.js';
import { adapter } from './adapter.js';
import { dc } from './dc.js';

var commander,
    create,
    move,
    stop,
    destroy,
    Command;

/**
 * 创建飞船
 */
create = function ( dynamicSys, energySys ) {
  if ( dc.getCraftNum() < 4 ) {
    var craft = createCraft( dynamicSys, energySys );
    dc.init( craft.id, dynamicSys, energySys );
  } else {
    addMessage({
      type: 'warning',
      content: 'There are too much crafts!'
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
  this.receiver.broadcast( 'command', adapter.toBinary( this.data ) );
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