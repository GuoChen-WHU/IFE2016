import { addMessage } from './shell.js';

const delay = 300;

var clientList = [], // 消息订阅者
    broadcast,
    notify,
    listen,
    remove,
    BUS;

/**
 * 广播命令，有10%概率失败
 */
broadcast = function send ( data ) {
  var success = Math.random() < 0.1 ? false : true;

  if ( success ) {
    addMessage({
      type: 'noraml',
      content: 'Send command ' + data + ' via BUS'
    });
    setTimeout( function () {
      notify( data );
    }, delay );
  } else {
    addMessage({
      type: 'warning',
      content: 'Command dismissed, try again...'
    });
    send( data );
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
 * BUS对象
 */
BUS = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};

export { BUS };