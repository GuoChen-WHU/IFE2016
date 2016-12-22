import { mediator } from './mediator.js';

const MOVE_SPEED = '20px',
      ENERGY_CONSUME_PER_SECOND = 5.0,
      ENERGY_CHARGE_PER_SECOND = 2.0,
      ANIMATION_INTERVAL = 5000;

var guid = 0,
    usableIds = [],
    getId,
    createCraft;

/**
 * 给新建的飞船分配Id
 */
getId = function () {
  return usableIds.shift() || guid++;
};

/**
 * 创建飞船的工厂方法
 */
createCraft = function () {
  var craft = {
    id: getId(),
    energy: 100,
    state: 'stop',
    track: this.id // 轨道简单地设成和id一样
  };

  /**
   * 动力系统提供的飞行功能
   */
  craft.move = function () {
    if ( this.state === 'stop' && this.energy > 0 ) {
      this.changeState( 'move' );
    }
  };

  /**
   * 动力系统提供的停止飞行功能
   */
  craft.stop = function () {
    if ( this.state === 'move' ) {
      this.changeState( 'stop' );
    }
  };

  /**
   * 管理飞船的状态
   */
  craft.changeState = (function () {
    var timer,
        moving,
        stopping;

    moving = function () {
      if ( this.energy <= 0 ) {
        this.energy = 0;
        this.changeState( 'stop' );
      } else {
        console.log( 'Move, energy ' + this.energy + '% left.' );
        this.energy -= ENERGY_CONSUME_PER_SECOND *
            ANIMATION_INTERVAL / 1000;
        timer = setTimeout( moving.bind( this ), ANIMATION_INTERVAL );
      }
    };

    stopping = function () {
      if ( this.energy >= 100 ) {
        this.energy = 100;
      } else {
        this.energy += ENERGY_CHARGE_PER_SECOND *
            ANIMATION_INTERVAL / 1000;
        console.log( 'Charging, energy ' + this.energy + '% left.' );
        timer = setTimeout( stopping.bind( this ), ANIMATION_INTERVAL );
      }
    };

    return function ( state ) {
      this.state = state;
      if ( state === 'move' ) {
        clearTimeout( timer );
        moving.bind( this )();
      } else if ( state === 'stop' ) {
        clearTimeout( timer );
        console.log( 'Stop' );
        stopping.bind( this )();
      }
    };
  }());

  /**
   * 自爆系统提供的销毁功能
   */
  craft.destroy = function () {
    console.log( 'Craft' + this.id + ' destroyed.' );
    return usableIds.push( this.id );
  };

  /**
   * 信号接收处理系统
   */
  craft.reciever = function ( data ) {
    var self = craft;

    // 先判断是不是给自己的
    if ( data.id === self.id ) {
      switch ( data.command ) {
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
  mediator.listen( craft.reciever );

  return craft;
};

export { createCraft };