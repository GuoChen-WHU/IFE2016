var mainHTML = '<ul class="console"></ul>',
    jqueryMap,
    setJqueryMap,
    addMessage,
    initConsole;

/**
 * 缓存DOM元素
 */
setJqueryMap = function () {
  jqueryMap = {
    $console: $( '.console' )
  };
};

/**
 * 控制台输出消息
 */
addMessage = function ( message ) {
  var ele = '<li class="' + message.type + '">' + message.content + '</li>';
  jqueryMap.$console.append( ele );
  jqueryMap.$console.prop( 'scrollTop', jqueryMap.$console.prop( 'scrollTop' ) + 18 );
};

/**
 * 初始化
 */
initConsole = function ( $container ) {
  $container.append( mainHTML );
  setJqueryMap();
};

export { addMessage, initConsole };