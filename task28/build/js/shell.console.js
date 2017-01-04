'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var mainHTML = '<ul class="console"></ul>',
    jqueryMap,
    setJqueryMap,
    addMessage,
    initConsole;

/**
 * 缓存DOM元素
 */
setJqueryMap = function setJqueryMap() {
  jqueryMap = {
    $console: $('.console')
  };
};

/**
 * 控制台输出消息
 */
exports.addMessage = addMessage = function addMessage(message) {
  var ele = '<li class="' + message.type + '">' + message.content + '</li>';
  jqueryMap.$console.append(ele);
  jqueryMap.$console.prop('scrollTop', jqueryMap.$console.prop('scrollTop') + 18);
};

/**
 * 初始化
 */
exports.initConsole = initConsole = function initConsole($container) {
  $container.append(mainHTML);
  setJqueryMap();
};

exports.addMessage = addMessage;
exports.initConsole = initConsole;
