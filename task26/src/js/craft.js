import { mediator } from './mediator.js';
import { shell, addMessage } from './shell.js';

const MOVE_SPEED = 20.0, // 单位：角度/秒
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
  craft.moving = function () {
    if ( this.energy <= 0 ) {
      this.energy = 0;
      this.changeState( 'stop' );
      addMessage({
        type: 'normal',
        content: 'The craft' + this.id + ' stopped due to lack of energy.'
      });
    } else {

      // 让shell渲染移动效果
      shell.move( this.id, MOVE_SPEED * ANIMATION_INTERVAL / 1000 );

      this.energy -= ENERGY_CONSUME_PER_SECOND *
          ANIMATION_INTERVAL / 1000;
      shell.energyChange( this.id, this.energy );

      this.timer = setTimeout( this.moving.bind( this ), ANIMATION_INTERVAL );
    }
  };

  /**
   * 停止状态
   */
  craft.stopping = function () {
    this.energy += ENERGY_CHARGE_PER_SECOND *
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
    mediator.remove( this.reciever );
    usableIds.push( this.id );
  };

  /**
   * 信号接收处理系统
   */
  craft.reciever = function ( data ) {
    var self = craft;

    // 先判断是不是给自己的
    if ( parseInt( data.id ) === self.id ) {
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

  // 让shell进行渲染
  shell.create( craft.id, craft.track );

  return craft;
};

export { createCraft };