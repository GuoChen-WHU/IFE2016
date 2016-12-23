import { addMessage } from './shell.js';

var clientList = [], // 消息订阅者
    broadcast,
    notify,
    listen,
    remove,
    mediator;

/**
 * 广播命令，有30%概率失败
 */
broadcast = function ( data ) {
  var success = Math.random() < 0.3 ? false : true;
  addMessage({
    type: 'normal',
    content: 'The commander command craft' + data.id + ' to ' + data.command
  });

  if ( success ) {
    setTimeout( function () {
      notify( data );
    }, 1000 );
  } else {
    addMessage({
      type: 'warning',
      content: 'But the command is dismissed!'
    });
  }
};

/**
 * 通知所有监听者
 */
notify = function () {
  for ( let client of clientList ) {
    client.apply( null, arguments );
  }
};

/**
 * 添加监听者
 */
listen = function ( fn ) {
  clientList.push( fn );
};

/**
 * 移除监听者
 */
remove = function ( fn ) {
  var len = clientList.length;
  for ( let i = 0; i < len; i++ ) {
    if ( clientList[ i ] === fn ) {
      clientList.splice( i, 1 );
      return;
    }
  }
};

/**
 * mediator对象
 */
mediator = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};

export { mediator };