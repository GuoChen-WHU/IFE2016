import { BUS } from './BUS.js';
import { shell, addMessage } from './shell.js';
import { adapter } from './adapter.js';

const ANIMATION_INTERVAL = 50,

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
getId = function () {
  return usableIds.shift() || guid++;
};

/**
 * 创建飞船的工厂方法
 */
createCraft = function ( dynamicSys, energySys ) {
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
   * 改变飞船的状态
   */
  craft.changeState = function ( state ) {
      this.state = state;
      if ( state === 'move' ) {
        clearTimeout( this.timer );
        this.moving();
      } else if ( state === 'stop' ) {
        clearTimeout( this.timer );
        this.stopping();
      }
    };

  /**
   * 飞行状态
   */
  craft.moving = function ( moveSpeed, consumeSpeed ) {
    if ( this.energy <= 0 ) {
      this.energy = 0;
      this.changeState( 'stop' );
      addMessage({
        type: 'normal',
        content: 'The craft' + this.id + ' stopped due to lack of energy.'
      });
    } else {

      // 让shell渲染移动效果
      shell.move( this.id, moveSpeed * ANIMATION_INTERVAL / 1000 );

      this.energy -= consumeSpeed *
          ANIMATION_INTERVAL / 1000;
      shell.energyChange( this.id, this.energy );

      this.timer = setTimeout( this.moving.bind( this ), ANIMATION_INTERVAL );
    }
  };

  /**
   * 停止状态
   */
  craft.stopping = function ( chargeSpeed ) {
    this.energy += chargeSpeed *
        ANIMATION_INTERVAL / 1000;

    if ( this.energy >= 100 ) {
      this.energy = 100;
    } else {
      this.timer = setTimeout( this.stopping.bind( this ), 
        ANIMATION_INTERVAL );
    }
    shell.energyChange( this.id, this.energy );
  };

  /**
   * 自爆系统提供的销毁功能
   */
  craft.destroy = function () {
    clearTimeout( this.timer );
    shell.destroy( this.id );
    BUS.remove( this.reciever );
    usableIds.push( this.id );
  };

  /**
   * 信号接收处理系统
   */
  craft.reciever = function ( binary ) {
    var self = craft,
        data = adapter( binary );

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

  // 信号接收系统监听BUS中的消息
  BUS.listen( craft.reciever );

  // 装配不同的动力、能源系统
  switch ( dynamicSys ) {
    case 'FORWARD':
      craft.moving = craft.moving.bind( craft, FORWARD.moveSpeed, 
        FORWARD.consumeSpeed );
      break;
    case 'GALLOP':
      craft.moving = craft.moving.bind( craft, GALLOP.moveSpeed, 
        GALLOP.consumeSpeed );
      break;
    case 'SURPASS':
      craft.moving = craft.moving.bind( craft, SURPASS.moveSpeed, 
        SURPASS.consumeSpeed );
      break;
  }
  switch ( energySys ) {
    case 'POWER':
      craft.stopping = craft.stopping.bind( craft, POWER.chargeSpeed );
      break;
    case 'LIGHT':
      craft.stopping = craft.stopping.bind( craft, LIGHT.chargeSpeed );
      break;
    case 'FOREVER':
      craft.stopping = craft.stopping.bind( craft, FOREVER.chargeSpeed );
      break;
  }

  // 让shell进行渲染
  shell.create( craft.id, craft.track );

  return craft;
};

export { createCraft };