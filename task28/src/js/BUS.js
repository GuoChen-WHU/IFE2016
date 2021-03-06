/*
 * BUS模块
*/
var addMessage = require('./shell.console.js').addMessage;

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
broadcast = function send ( event, data ) {
  var success = Math.random() < 0.1 ? false : true;

  if ( success ) {
    addMessage({
      type: 'normal',
      content: 'Message sent successfully.'
    });
    setTimeout( function () {
      notify( event, data );
    }, delay );
  } else {
    addMessage({
      type: 'warning',
      content: 'Message dismissed in BUS, try again later.'
    });
    setTimeout( function () {
      send( event, data );
    }, delay );
  }
};

/**
 * 通知所有监听者
 */
notify = function ( event, data ) {
  clientList[ event ].map(function (client) {
    client.apply( null, [ data ]);
  });
};

/**
 * 添加监听者
 */
listen = function ( event, fn ) {
  if ( !clientList[ event ] ) {
    clientList[ event ] = [ fn ];
  } else {
    clientList[ event ].push( fn );
  }
};

/**
 * 移除监听者
 */
remove = function ( event, fn ) {
  var len;
  if ( clientList[ event ] ) {
    len = clientList[ event ].length;
    for ( var i = 0; i < len; i++ ) {
      if ( clientList[ event ][ i ] === fn ) {
        clientList[ event ].splice( i, 1 );
        return;
      }
    }
  }
};

/**
 * BUS对象
 */
module.exports = BUS = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};