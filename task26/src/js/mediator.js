var clientList = [],
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

  if ( success ) {
    setTimeout( function () {
      notify( data );
    }, 1000 );
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