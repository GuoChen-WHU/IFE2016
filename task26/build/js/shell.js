'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMessage = exports.init = exports.shell = undefined;

var _commander = require('./commander.js');

var mainHTML = '<div class="shell">' + '<div class="universe">' + '<div class="planet"></div>' + '</div>' + '<div class="panel">' + '<button class="control-button" data-command="create">创建新飞船</button>' + '</div>' + '<ul class="console"></ul>' + '</div>',
    DomMap,
    create,
    move,
    energyChange,
    destroy,
    setDomMap,
    addMessage,
    getDegree,
    setDegree,
    handleClick,
    shell,
    init;

/**
 * 创建飞船和相应的按钮
 */
/*
 * shell模块,负责界面的渲染
*/
create = function create(id, track) {
  // 飞船本身的html
  var html = '<div class="craft track' + track + '" id="craft' + id + '">' + '<div class="craft-body">' + id + '号 <span class="energy">100</span>%' + '</div>' + '<div class="craft-head"></div>' + '</div>';
  DomMap.universe.innerHTML += html;

  // 面板上对应控制按钮的html
  var controlHtml = '<div class="controls" id="controls' + id + '">' + '<span>对' + id + '号飞船下达命令：</span>' + '<button class="control-button" data-target="' + id + '" data-command="move">开始飞行</button>' + '<button class="control-button" data-target="' + id + '" data-command="stop">停止飞行</button>' + '<button class="control-button" data-target="' + id + '" data-command="destroy">销毁</button>' + '</div>';

  DomMap.panel.innerHTML += controlHtml;
};

/**
 * 移动飞船
 */
move = function move(id, diff) {
  var craft = document.getElementById('craft' + id),
      deg = getDegree(craft) + diff;
  setDegree(craft, deg);
};

/**
 * 改变飞船的电量显示
 */
energyChange = function energyChange(id, energy) {
  document.querySelector('#craft' + id + ' .energy').innerHTML = energy.toFixed(1);
};

/**
 * 删除飞船和相应按钮
 */
destroy = function destroy(id) {
  var craft = document.getElementById('craft' + id);
  DomMap.universe.removeChild(craft);

  var control = document.getElementById('controls' + id);
  DomMap.panel.removeChild(control);
};

/**
 * 初始化界面
 */
exports.init = init = function init(container) {
  container.innerHTML += mainHTML;
  setDomMap();

  // 按钮点击事件都委托给panel处理
  DomMap.panel.addEventListener('click', handleClick);
};

/**
 * 缓存DOM元素
 */
setDomMap = function setDomMap() {
  DomMap = {
    universe: document.getElementsByClassName('universe')[0],
    panel: document.getElementsByClassName('panel')[0],
    console: document.getElementsByClassName('console')[0]
  };
};

/**
 * 控制台输出消息
 */
exports.addMessage = addMessage = function addMessage(message) {
  var ele = '<li class="' + message.type + '">' + message.content + '</li>';
  DomMap.console.innerHTML += ele;
  DomMap.console.scrollTop += 18;
};

/**
 * 处理按钮点击事件
 */
handleClick = function handleClick(e) {
  if (e.target.className === 'control-button') {
    switch (e.target.getAttribute('data-command')) {
      case 'create':
        _commander.commander.create();
        break;
      case 'move':
        _commander.commander.move(e.target.getAttribute('data-target'));
        break;
      case 'stop':
        _commander.commander.stop(e.target.getAttribute('data-target'));
        break;
      case 'destroy':
        _commander.commander.destroy(e.target.getAttribute('data-target'));
        break;
    }
  }
};

/**
 * 获取元素的tranform属性rotate中的角度值
 */
getDegree = function getDegree(ele) {
  if (ele.style.transform === '') {
    return 0;
  }
  var pattern = /\((\d+)d/;
  return parseInt(pattern.exec(ele.style.transform)[1]);
};

setDegree = function setDegree(ele, value) {
  ele.style.transform = 'rotate(' + value + 'deg)';
};

exports.shell = shell = {
  create: create,
  move: move,
  energyChange: energyChange,
  destroy: destroy
};

exports.shell = shell;
exports.init = init;
exports.addMessage = addMessage;
