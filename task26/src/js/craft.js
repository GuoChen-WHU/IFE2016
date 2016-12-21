var configMap = {
      MOVE_SPEED: '20px',
      ENERGY_CONSUME_PER_SECOND: 5.0,
      ENERGY_CHARGE_PER_SECOND: 2.0,
      ANIMATION_INTERVAL: 50
    },
    stateMap = {
      guid: 0,
      usableIds: []
    },
    getId,
    createCraft;

/**
 * 给新建的飞船分配Id
 */
getId = function () {
  return stateMap.usableIds.shift() || stateMap.guid++;
};

/**
 * 创建飞船的工厂方法
 */
createCraft = function () {
  var craft = {
    id: getId(),
    energy: 100,
    state: 'stop'
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
        refreshMove,
        refreshStop;

    refreshMove = function () {
      if ( this.energy <= 0 ) {
        this.energy = 0;
        this.changeState( 'stop' );
      } else {
        console.log( 'Move, energy ' + this.energy + '% left.' );
        this.energy -= configMap.ENERGY_CONSUME_PER_SECOND *
            configMap.ANIMATION_INTERVAL / 1000;
        timer = setTimeout( refreshMove.bind( this ), configMap.ANIMATION_INTERVAL );
      }
    };

    refreshStop = function () {
      if ( this.energy >= 100 ) {
        this.energy = 100;
      } else {
        this.energy += configMap.ENERGY_CHARGE_PER_SECOND *
            configMap.ANIMATION_INTERVAL / 1000;
        console.log( 'Charging, energy ' + this.energy + '% left.' );
        timer = setTimeout( refreshStop.bind( this ), configMap.ANIMATION_INTERVAL );
      }
    };

    return function ( state ) {
      this.state = state;
      if ( state === 'move' ) {
        clearTimeout( timer );
        refreshMove.bind( this )();
      } else if ( state === 'stop' ) {
        clearTimeout( timer );
        console.log( 'Stop' );
        refreshStop.bind( this )();
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
   * 信号接收处理系统提供的接收信号功能
   */
  craft.recieve = function () {

  };

  return craft;
};

export { createCraft };