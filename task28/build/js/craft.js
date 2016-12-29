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
