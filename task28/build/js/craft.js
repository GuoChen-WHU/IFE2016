'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCraft = undefined;

var _BUS = require('./BUS.js');

var _shell = require('./shell.js');

var _adapter = require('./adapter.js');

var _shellConsole = require('./shell.console.js');

var ANIMATION_INTERVAL = 50,
    EMIT_INTERVAL = 1000,


// 动力系统
DYNAMICSYS = {
  FORWARD: {
    moveSpeed: 30,
    consumeSpeed: 5
  },
  GALLOP: {
    moveSpeed: 50,
    consumeSpeed: 7
  },
  SURPASS: {
    moveSpeed: 80,
    consumeSpeed: 9
  }
},


// 能源系统
ENERGYSYS = {
  POWER: { chargeSpeed: 2 },
  LIGHT: { chargeSpeed: 3 },
  FOREVER: { chargeSpeed: 4 }
};

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

  var Craft = function Craft() {
    this.id = getId();
    this.energy = 100;
    this.state = 'stop';
    this.track = this.id; // 轨道简单地设成和id一样
    this.timer = null; // 运动定时器
    this.emitter = null; // 发射信号定时器
  };

  /**
   * 动力系统提供的飞行功能
   */
  Craft.prototype.move = function () {
    if (this.state !== 'move' && this.energy > 0) {
      this.state = 'move';
      clearTimeout(this.timer);

      this.timer = setTimeout(function moving() {
        if (this.energy <= 0) {
          this.energy = 0;
          this.stop();
          (0, _shellConsole.addMessage)({
            type: 'warning',
            content: 'Craft ' + this.id + ' stopped due to lack of energy.'
          });
        } else {
          // 让shell渲染移动效果
          _shell.shell.move(this.id, this.dynamicSys.moveSpeed * ANIMATION_INTERVAL / 1000);

          this.energy -= this.dynamicSys.consumeSpeed * ANIMATION_INTERVAL / 1000;
          _shell.shell.energyChange(this.id, this.energy);

          this.timer = setTimeout(moving.bind(this), ANIMATION_INTERVAL);
        }
      }.bind(this), ANIMATION_INTERVAL);
    }
  };

  /**
   * 动力系统提供的停止飞行功能
   */
  Craft.prototype.stop = function () {
    if (this.state !== 'stop') {
      this.state = 'stop';
      clearTimeout(this.timer);

      this.timer = setTimeout(function stopping() {
        this.energy += this.energySys.chargeSpeed * ANIMATION_INTERVAL / 1000;

        if (this.energy >= 100) {
          this.energy = 100;
        } else {
          this.timer = setTimeout(stopping.bind(this), ANIMATION_INTERVAL);
        }
        _shell.shell.energyChange(this.id, this.energy);
      }.bind(this), ANIMATION_INTERVAL);
    }
  };

  /**
   * 自爆系统提供的销毁功能
   */
  Craft.prototype.destroy = function () {

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
  Craft.prototype.emit = function (data) {
    var binary = _adapter.adapter.toBinary(data);
    (0, _shellConsole.addMessage)({
      type: 'normal',
      content: 'Craft ' + this.id + ' emit a message:' + binary
    });
    _BUS.BUS.broadcast('status', binary);
  };

  /**
   * 信号接收处理系统
   */
  Craft.prototype.receiver = function (binary) {
    var self = craft,
        data = _adapter.adapter.toObj(binary);

    // 先判断是不是给自己的
    if (data.id === self.id) {

      (0, _shellConsole.addMessage)({
        type: 'normal',
        content: 'Craft ' + self.id + ' receive command:' + binary
      });

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

  var craft = new Craft();

  // 信号接收系统监听BUS中的命令
  _BUS.BUS.listen('command', craft.receiver);

  // 装配不同的动力、能源系统
  craft.dynamicSys = DYNAMICSYS[dynamicSys];
  craft.energySys = ENERGYSYS[energySys];

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
