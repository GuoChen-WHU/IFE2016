(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
broadcast = function send(event, data) {
  var success = Math.random() < 0.1 ? false : true;

  if (success) {
    setTimeout(function () {
      notify(event, data);
    }, delay);
  } else {
    send(event, data);
  }
};

/**
 * 通知所有监听者
 */
notify = function notify(event, data) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = clientList[event][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var client = _step.value;

      client.apply(null, [data]);
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
listen = function listen(event, fn) {
  if (!clientList[event]) {
    clientList[event] = [fn];
  } else {
    clientList[event].push(fn);
  }
};

/**
 * 移除监听者
 */
remove = function remove(event, fn) {
  var len;
  if (clientList[event]) {
    len = clientList[event].length;
    for (var i = 0; i < len; i++) {
      if (clientList[event][i] === fn) {
        clientList[event].splice(i, 1);
        return;
      }
    }
  }
};

/**
 * BUS对象
 */
exports.BUS = BUS = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};

exports.BUS = BUS;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function toBinary(data) {
  // 前四位飞船编号，先在前面加3个0，加上转成的二进制数后在取后四位，
  // 可以达到在前面补0到4位的效果
  var result = ('000' + parseInt(data.id).toString(2)).slice(-4);

  // 中间四位命令或状态
  switch (data.command || data.status) {
    case 'move':
      result += '0001';
      break;
    case 'stop':
      result += '0010';
      break;
    case 'destroy':
      result += '1100';
      break;
  }
  // 如果有能源百分比，加到后八位
  if (data.energy) {
    result += ('0000000' + parseInt(data.energy).toString(2)).slice(-8);
  }

  return result;
}

function toObj(binary) {
  var result = {},
      type;

  result.id = parseInt(binary.slice(0, 4), 2);

  type = binary.length === 8 ? 'command' : 'status';

  switch (binary.slice(4, 8)) {
    case '0001':
      result[type] = 'move';
      break;
    case '0010':
      result[type] = 'stop';
      break;
    case '1100':
      result[type] = 'destroy';
      break;
  }
  if (type === 'status') {
    result.energy = parseInt(binary.slice(8), 2);
  }

  return result;
}

var adapter = {
  toBinary: toBinary,
  toObj: toObj
};

exports.adapter = adapter;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commander = undefined;

var _craft = require('./craft.js');

var _BUS = require('./BUS.js');

var _shell = require('./shell.js');

var _adapter = require('./adapter.js');

var _dc = require('./dc.js');

var commander, create, move, stop, destroy, Command;

/**
 * 创建飞船
 */
/*
 * 指挥官模块
*/

create = function create(dynamicSys, energySys) {
  if (_dc.dc.getCraftNum() < 4) {
    var craft = (0, _craft.createCraft)(dynamicSys, energySys);
    _dc.dc.init(craft.id, dynamicSys, energySys);
  } else {
    (0, _shell.addMessage)({
      type: 'warning',
      content: 'There are too much crafts!'
    });
  }
};

/**
 * 命令飞船移动
 */
move = function move(id) {
  var moveCommand = new Command(_BUS.BUS, {
    id: id,
    command: 'move'
  });
  moveCommand.execute();
};

/**
 * 命令飞船停止
 */
stop = function stop(id) {
  var stopCommand = new Command(_BUS.BUS, {
    id: id,
    command: 'stop'
  });
  stopCommand.execute();
};

/**
 * 命令飞船销毁
 */
destroy = function destroy(id) {
  var destroyCommand = new Command(_BUS.BUS, {
    id: id,
    command: 'destroy'
  });
  destroyCommand.execute();
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
  this.receiver.broadcast('command', _adapter.adapter.toBinary(this.data));
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

},{"./BUS.js":1,"./adapter.js":2,"./craft.js":4,"./dc.js":5,"./shell.js":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCraft = undefined;

var _BUS = require('./BUS.js');

var _shell = require('./shell.js');

var _adapter = require('./adapter.js');

var ANIMATION_INTERVAL = 50,
    EMIT_INTERVAL = 1000,


// 动力系统
FORWARD = {
  moveSpeed: 30,
  consumeSpeed: 5
},
    GALLOP = {
  moveSpeed: 50,
  consumeSpeed: 7
},
    SURPASS = {
  moveSpeed: 80,
  consumeSpeed: 9
},


// 能源系统
POWER = { chargeSpeed: 2 },
    LIGHT = { chargeSpeed: 3 },
    FOREVER = { chargeSpeed: 4 };

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
exports.createCraft = createCraft = function createCraft(dynamicSys, energySys) {
  var craft = {
    id: getId(),
    energy: 100,
    state: 'stop',
    timer: null,
    emitter: null
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
  craft.moving = function (moveSpeed, consumeSpeed) {
    if (this.energy <= 0) {
      this.energy = 0;
      this.changeState('stop');
      (0, _shell.addMessage)({
        type: 'normal',
        content: 'The craft' + this.id + ' stopped due to lack of energy.'
      });
    } else {

      // 让shell渲染移动效果
      _shell.shell.move(this.id, moveSpeed * ANIMATION_INTERVAL / 1000);

      this.energy -= consumeSpeed * ANIMATION_INTERVAL / 1000;
      _shell.shell.energyChange(this.id, this.energy);

      this.timer = setTimeout(this.moving.bind(this), ANIMATION_INTERVAL);
    }
  };

  /**
   * 停止状态
   */
  craft.stopping = function (chargeSpeed) {
    this.energy += chargeSpeed * ANIMATION_INTERVAL / 1000;

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

    // 先把两个定时器清除
    clearTimeout(this.timer);
    clearTimeout(this.emitter);

    // 发送销毁信息
    this.emit({
      id: this.id,
      status: 'destroy',
      energy: this.energy
    });

    _shell.shell.destroy(this.id);
    _BUS.BUS.remove('command', this.reciever);
    usableIds.push(this.id);
  };

  /**
   * 信号发射器的发射信号功能
   */
  craft.emit = function (data) {
    var binary = _adapter.adapter.toBinary(data);
    _BUS.BUS.broadcast('status', binary);
  };

  /**
   * 信号接收处理系统
   */
  craft.reciever = function (binary) {
    var self = craft,
        data = _adapter.adapter.toObj(binary);

    // 先判断是不是给自己的
    if (data.id === self.id) {
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

  // 信号接收系统监听BUS中的命令
  _BUS.BUS.listen('command', craft.reciever);

  // 装配不同的动力、能源系统
  switch (dynamicSys) {
    case 'FORWARD':
      craft.moving = craft.moving.bind(craft, FORWARD.moveSpeed, FORWARD.consumeSpeed);
      break;
    case 'GALLOP':
      craft.moving = craft.moving.bind(craft, GALLOP.moveSpeed, GALLOP.consumeSpeed);
      break;
    case 'SURPASS':
      craft.moving = craft.moving.bind(craft, SURPASS.moveSpeed, SURPASS.consumeSpeed);
      break;
  }
  switch (energySys) {
    case 'POWER':
      craft.stopping = craft.stopping.bind(craft, POWER.chargeSpeed);
      break;
    case 'LIGHT':
      craft.stopping = craft.stopping.bind(craft, LIGHT.chargeSpeed);
      break;
    case 'FOREVER':
      craft.stopping = craft.stopping.bind(craft, FOREVER.chargeSpeed);
      break;
  }

  // 信号发射器开始定时发送状态消息
  craft.emitter = setTimeout(function emitStatus() {
    var self = craft;

    self.emit({
      id: self.id,
      status: self.state,
      energy: self.energy
    });

    self.emitter = setTimeout(emitStatus, EMIT_INTERVAL);
  }, EMIT_INTERVAL);

  // 让shell进行渲染
  _shell.shell.create(craft.id, craft.track);

  return craft;
};

exports.createCraft = createCraft;

},{"./BUS.js":1,"./adapter.js":2,"./shell.js":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dc = undefined;

var _adapter = require('./adapter.js');

var _shell = require('./shell.js');

var _BUS = require('./BUS.js');

var dc,
    receiver,
    craftNum = 0,
    handler;

/**
 * 行星上的信号接收器
 */
receiver = function receiver(binary) {
  handler(binary);
};

/**
 * 处理接收器传过来的数据
 */
handler = function handler(binary) {
  var data = _adapter.adapter.toObj(binary);

  if (data.status === 'destroy') {
    _shell.shell.monitor.remove(data.id);
    craftNum--;
  } else {
    _shell.shell.monitor.update(data);
  }
};

/**
 * 数据处理中心的公共API
 */
exports.dc = dc = {

  getCraftNum: function getCraftNum() {
    return craftNum;
  },

  /**
   * 新建飞船的状态信息
   */
  init: function init(id, dynamicSys, energySys) {
    var record = {
      id: id,
      dynamicSys: dynamicSys,
      energySys: energySys,
      status: 'stop',
      energy: 100
    };
    craftNum++;
    _shell.shell.monitor.add(record);
  }
};

_BUS.BUS.listen('status', receiver);

exports.dc = dc;

},{"./BUS.js":1,"./adapter.js":2,"./shell.js":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMessage = exports.init = exports.shell = undefined;

var _commander = require('./commander.js');

var mainHTML = '<div class="shell">' + '<div class="universe">' + '<div class="planet"></div>' + '</div>' + '<div class="monitor">' + '<table>' + '<tbody class="records">' + '<tr>' + '<th>飞船</th>' + '<th>动力系统</th>' + '<th>能源系统</th>' + '<th>当前飞行状态</th>' + '<th>剩余能耗</th>' + '</tr>' + '</tbody>' + '</table>' + '</div>' + '<div class="panel">' + '<section>' + '<span>动力系统选择：</span>' + '<label>' + '<input type="radio" name="dynSys" value="FORWARD">' + '前进号(速率30px/s, 能耗5%/s)' + '</label>' + '<label>' + '<input type="radio" name="dynSys" value="GALLOP">' + '奔腾号(速率50px/s, 能耗7%/s)' + '</label>' + '<label>' + '<input type="radio" name="dynSys" value="SURPASS">' + '超越号(速率80px/s, 能耗9%/s)' + '</label>' + '</section>' + '<section>' + '<span>能源系统选择：</span>' + '<label>' + '<input type="radio" name="eneSys" value="POWER">' + '劲量型(补充能源速度2%/s)' + '</label>' + '<label>' + '<input type="radio" name="eneSys" value="LIGHT">' + '光能型(补充能源速度3%/s)' + '</label>' + '<label>' + '<input type="radio" name="eneSys" value="FOREVER">' + '永久型(补充能源速度4%/s)' + '</label>' + '</section>' + '<section>' + '<button class="control-button" data-command="create">创建新飞船</button>' + '</section>' + '</div>' + '<ul class="console"></ul>' + '</div>',
    DomMap,
    dynSysChosen,
    eneSysChosen,
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
    init,
    monitor;

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
    console: document.getElementsByClassName('console')[0],
    monitor: document.getElementsByClassName('records')[0]
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
        if (dynSysChosen && eneSysChosen) {
          _commander.commander.create(dynSysChosen, eneSysChosen);
        } else {
          addMessage({
            type: 'warning',
            content: 'Please choose dynamic and energy system first!'
          });
        }
        break;
      case 'move':
        _commander.commander.move(parseInt(e.target.getAttribute('data-target')));
        break;
      case 'stop':
        _commander.commander.stop(parseInt(e.target.getAttribute('data-target')));
        break;
      case 'destroy':
        _commander.commander.destroy(parseInt(e.target.getAttribute('data-target')));
        break;
    }
  } else if (e.target.getAttribute('name') === 'dynSys') {
    dynSysChosen = e.target.value;
  } else if (e.target.getAttribute('name') === 'eneSys') {
    eneSysChosen = e.target.value;
  }
};

/**
 * 获取元素的tranform属性rotate中的角度值
 */
getDegree = function getDegree(ele) {
  if (ele.style.transform === '') {
    return 0;
  }
  var pattern = /\(([\d.]+)d/;
  return parseInt(pattern.exec(ele.style.transform)[1]);
};

setDegree = function setDegree(ele, value) {
  ele.style.transform = 'rotate(' + value + 'deg)';
};

monitor = {
  add: function add(record) {
    var raw = '<td>' + record.id + '号</td>' + '<td>' + record.dynamicSys + '</td>' + '<td>' + record.energySys + '</td>' + '<td class="monitor-status">' + record.status + '</td>' + '<td class="monitor-energy">' + record.energy + '%</td>',
        recordEle = document.createElement('tr');

    recordEle.id = 'record' + record.id;
    recordEle.innerHTML = raw;

    DomMap.monitor.appendChild(recordEle);
  },
  update: function update(data) {
    var statusEle = document.querySelector('#record' + data.id + ' .monitor-status'),
        energyEle = document.querySelector('#record' + data.id + ' .monitor-energy');

    statusEle.innerText = data.status;
    energyEle.innerText = data.energy + '%';
  },
  remove: function remove(id) {
    var recordEle = document.getElementById('record' + id);
    recordEle.parentNode.removeChild(recordEle);
  }
};

exports.shell = shell = {
  create: create,
  move: move,
  energyChange: energyChange,
  destroy: destroy,
  monitor: monitor
};

exports.shell = shell;
exports.init = init;
exports.addMessage = addMessage;

},{"./commander.js":3}],7:[function(require,module,exports){
'use strict';

var _shell = require('./shell.js');

var container = document.getElementById('container');
(0, _shell.init)(container);

},{"./shell.js":6}]},{},[4,3,1,6,2,5,7]);
