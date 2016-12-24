(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commander = undefined;

var _craft = require('./craft.js');

var _mediator = require('./mediator.js');

var _shell = require('./shell.js');

var craftState = [],
    // 指挥官假设的飞船状态
craftNum = 0,
    // 指挥官已知的飞船数量
commander,
    create,
    move,
    stop,
    destroy,
    Command;

/**
 * 创建飞船
 */
/*
 * 指挥官模块
*/

create = function create() {
  if (craftNum < 4) {
    var craft = (0, _craft.createCraft)();
    craftState[craft.id] = 'stop';
    craftNum++;
  } else {
    (0, _shell.addMessage)({
      type: 'warning',
      content: 'The commander think there are too much crafts!'
    });
  }
};

/**
 * 命令飞船移动
 */
move = function move(id) {
  var moveCommand = new Command(_mediator.mediator, {
    id: id,
    command: 'move'
  });
  moveCommand.execute();
  craftState[id] = 'move';
};

/**
 * 命令飞船停止
 */
stop = function stop(id) {
  var stopCommand = new Command(_mediator.mediator, {
    id: id,
    command: 'stop'
  });
  stopCommand.execute();
  craftState[id] = 'stop';
};

/**
 * 命令飞船销毁
 */
destroy = function destroy(id) {
  var destroyCommand = new Command(_mediator.mediator, {
    id: id,
    command: 'destroy'
  });
  destroyCommand.execute();
  craftState[id] = undefined;
  craftNum--;
};

/**
 * Command类
 */
Command = function Command(receiver, data) {
  this.receiver = receiver;
  this.data = data;
};

/**
 * 执行命令
 */
Command.prototype.execute = function () {
  this.receiver.broadcast(this.data);
};

/**
 * 指挥官对象
 */
exports.commander = commander = {
  create: create,
  move: move,
  stop: stop,
  destroy: destroy
};

exports.commander = commander;

},{"./craft.js":2,"./mediator.js":3,"./shell.js":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCraft = undefined;

var _mediator = require('./mediator.js');

var _shell = require('./shell.js');

var MOVE_SPEED = 20.0,
    // 单位：角度/秒
ENERGY_CONSUME_PER_SECOND = 5.0,
    ENERGY_CHARGE_PER_SECOND = 2.0,
    ANIMATION_INTERVAL = 50;

var guid = 1,
    usableIds = [],
    getId,
    createCraft;

/**
 * 给新建的飞船分配Id
 */
getId = function getId() {
  return usableIds.shift() || guid++;
};

/**
 * 创建飞船的工厂方法
 */
exports.createCraft = createCraft = function createCraft() {
  var craft = {
    id: getId(),
    energy: 100,
    state: 'stop',
    timer: null
  };

  craft.track = craft.id; // 轨道简单地设成和id一样

  /**
   * 动力系统提供的飞行功能
   */
  craft.move = function () {
    if (this.state === 'stop' && this.energy > 0) {
      this.changeState('move');
    }
  };

  /**
   * 动力系统提供的停止飞行功能
   */
  craft.stop = function () {
    if (this.state === 'move') {
      this.changeState('stop');
    }
  };

  /**
   * 改变飞船的状态
   */
  craft.changeState = function (state) {
    this.state = state;
    if (state === 'move') {
      clearTimeout(this.timer);
      this.moving();
    } else if (state === 'stop') {
      clearTimeout(this.timer);
      this.stopping();
    }
  };

  /**
   * 飞行状态
   */
  craft.moving = function () {
    if (this.energy <= 0) {
      this.energy = 0;
      this.changeState('stop');
      (0, _shell.addMessage)({
        type: 'normal',
        content: 'The craft' + this.id + ' stopped due to lack of energy.'
      });
    } else {

      // 让shell渲染移动效果
      _shell.shell.move(this.id, MOVE_SPEED * ANIMATION_INTERVAL / 1000);

      this.energy -= ENERGY_CONSUME_PER_SECOND * ANIMATION_INTERVAL / 1000;
      _shell.shell.energyChange(this.id, this.energy);

      this.timer = setTimeout(this.moving.bind(this), ANIMATION_INTERVAL);
    }
  };

  /**
   * 停止状态
   */
  craft.stopping = function () {
    this.energy += ENERGY_CHARGE_PER_SECOND * ANIMATION_INTERVAL / 1000;

    if (this.energy >= 100) {
      this.energy = 100;
    } else {
      this.timer = setTimeout(this.stopping.bind(this), ANIMATION_INTERVAL);
    }
    _shell.shell.energyChange(this.id, this.energy);
  };

  /**
   * 自爆系统提供的销毁功能
   */
  craft.destroy = function () {
    clearTimeout(this.timer);
    _shell.shell.destroy(this.id);
    _mediator.mediator.remove(this.reciever);
    usableIds.push(this.id);
  };

  /**
   * 信号接收处理系统
   */
  craft.reciever = function (data) {
    var self = craft;

    // 先判断是不是给自己的
    if (parseInt(data.id) === self.id) {
      switch (data.command) {
        case 'move':
          self.move();
          break;
        case 'stop':
          self.stop();
          break;
        case 'destroy':
          self.destroy();
      }
    }
  };

  // 信号接收系统监听mediator中的消息
  _mediator.mediator.listen(craft.reciever);

  // 让shell进行渲染
  _shell.shell.create(craft.id, craft.track);

  return craft;
};

exports.createCraft = createCraft;

},{"./mediator.js":3,"./shell.js":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mediator = undefined;

var _shell = require('./shell.js');

var clientList = [],
    // 消息订阅者
broadcast,
    notify,
    listen,
    remove,
    mediator;

/**
 * 广播命令，有30%概率失败
 */
broadcast = function broadcast(data) {
  var success = Math.random() < 0.3 ? false : true;
  (0, _shell.addMessage)({
    type: 'normal',
    content: 'The commander command craft' + data.id + ' to ' + data.command
  });

  if (success) {
    setTimeout(function () {
      notify(data);
    }, 1000);
  } else {
    (0, _shell.addMessage)({
      type: 'warning',
      content: 'But the command is dismissed!'
    });
  }
};

/**
 * 通知所有监听者
 */
notify = function notify() {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = clientList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var client = _step.value;

      client.apply(null, arguments);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

/**
 * 添加监听者
 */
listen = function listen(fn) {
  clientList.push(fn);
};

/**
 * 移除监听者
 */
remove = function remove(fn) {
  var len = clientList.length;
  for (var i = 0; i < len; i++) {
    if (clientList[i] === fn) {
      clientList.splice(i, 1);
      return;
    }
  }
};

/**
 * mediator对象
 */
exports.mediator = mediator = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};

exports.mediator = mediator;

},{"./shell.js":4}],4:[function(require,module,exports){
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

},{"./commander.js":1}],5:[function(require,module,exports){
'use strict';

var _shell = require('./shell.js');

var container = document.getElementById('container');
(0, _shell.init)(container);

},{"./shell.js":4}]},{},[2,1,3,4,5]);
