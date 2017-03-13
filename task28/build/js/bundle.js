(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * BUS模块
*/
var addMessage = require('./shell.console.js').addMessage;

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
broadcast = function send ( event, data ) {
  var success = Math.random() < 0.1 ? false : true;

  if ( success ) {
    addMessage({
      type: 'normal',
      content: 'Message sent successfully.'
    });
    setTimeout( function () {
      notify( event, data );
    }, delay );
  } else {
    addMessage({
      type: 'warning',
      content: 'Message dismissed in BUS, try again later.'
    });
    setTimeout( function () {
      send( event, data );
    }, delay );
  }
};

/**
 * 通知所有监听者
 */
notify = function ( event, data ) {
  clientList[ event ].map(function (client) {
    client.apply( null, [ data ]);
  });
};

/**
 * 添加监听者
 */
listen = function ( event, fn ) {
  if ( !clientList[ event ] ) {
    clientList[ event ] = [ fn ];
  } else {
    clientList[ event ].push( fn );
  }
};

/**
 * 移除监听者
 */
remove = function ( event, fn ) {
  var len;
  if ( clientList[ event ] ) {
    len = clientList[ event ].length;
    for ( var i = 0; i < len; i++ ) {
      if ( clientList[ event ][ i ] === fn ) {
        clientList[ event ].splice( i, 1 );
        return;
      }
    }
  }
};

/**
 * BUS对象
 */
module.exports = BUS = {
  broadcast: broadcast,
  listen: listen,
  remove: remove
};
},{"./shell.console.js":7}],2:[function(require,module,exports){
function toBinary ( data ) {
  // 前四位飞船编号，先在前面加3个0，加上转成的二进制数后在取后四位，
  // 可以达到在前面补0到4位的效果
  var result = ( '000' + parseInt( data.id ).toString( 2 )).slice( -4 );

  // 中间四位命令或状态
  switch ( data.command || data.status ) {
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
  if ( data.energy ) {
    result += ( '0000000' + parseInt( data.energy ).toString( 2 )).slice( -8 );
  }

  return result;
}

function toObj ( binary ) {
  var result = {},
      type;

  result.id = parseInt( binary.slice( 0, 4 ), 2 );

  type = binary.length === 8 ? 'command' : 'status';

  switch( binary.slice( 4, 8 ) ) {
    case '0001':
      result[ type ] = 'move';
      break;
    case '0010':
      result[ type ] = 'stop';
      break;
    case '1100':
      result[ type ] = 'destroy';
      break;
  }
  if ( type === 'status' ) {
    result.energy = parseInt( binary.slice( 8 ), 2 );
  }

  return result;
}

module.exports = {
  toBinary: toBinary,
  toObj   : toObj
};
},{}],3:[function(require,module,exports){
/*
 * 指挥官模块
*/
var createCraft = require('./craft.js').createCraft;
var BUS = require('./BUS.js');
var adapter = require('./adapter.js');
var dc = require('./dc.js');
var addMessage = require('./shell.console.js').addMessage;

var commander,
    create,
    move,
    stop,
    destroy,
    Command;

/**
 * 创建飞船
 */
create = function ( dynamicSys, energySys ) {
  if ( dc.getCraftNum() < 4 ) {
    var craft = createCraft( dynamicSys, energySys );
    dc.init( craft.id, dynamicSys, energySys );
  } else {
    addMessage({
      type: 'warning',
      content: 'There are too much crafts!'
    });
  }
};

/**
 * 命令飞船移动
 */
move = function ( id ) {
  var moveCommand = new Command( BUS, {
    id: id,
    command: 'move' 
  });
  moveCommand.execute();
};

/**
 * 命令飞船停止
 */
stop = function ( id ) {
  var stopCommand = new Command( BUS, {
    id: id,
    command: 'stop'
  });
  stopCommand.execute();
};

/**
 * 命令飞船销毁
 */
destroy = function ( id ) {
  var destroyCommand = new Command( BUS, {
    id: id,
    command: 'destroy'
  });
  destroyCommand.execute();
};

/**
 * Command类
 */
Command = function ( receiver, data ) {
  this.receiver = receiver;
  this.data = data;
};

/**
 * 执行命令
 */
Command.prototype.execute = function () {
  this.receiver.broadcast( 'command', adapter.toBinary( this.data ) );
};

/**
 * 指挥官对象
 */
module.exports = commander = {
  create: create,
  move: move,
  stop: stop,
  destroy: destroy
};

},{"./BUS.js":1,"./adapter.js":2,"./craft.js":4,"./dc.js":5,"./shell.console.js":7}],4:[function(require,module,exports){
/*
 * 飞船模块
*/
var globalEvent = require('./globalEvent.js');

var BUS = require('./BUS.js');
var adapter = require('./adapter.js');
var addMessage = require('./shell.console.js').addMessage;

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

var stateMap = {},
    guid = 1,
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
  
  var Craft = function () {
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
    if ( this.state !== 'move' && this.energy > 0 ) {
      this.state = 'move';
      clearTimeout( this.timer );

      this.timer = setTimeout( function moving () {
        if ( this.energy <= 0 ) {
          this.energy = 0;
          this.stop();
          addMessage({
            type: 'warning',
            content: 'Craft ' + this.id + ' stopped due to lack of energy.'
          });
        } else {
          // 让shell渲染移动效果
          globalEvent.trigger( 'move', this.id, this.dynamicSys.moveSpeed * ANIMATION_INTERVAL / 1000 );

          this.energy -= this.dynamicSys.consumeSpeed *
              ANIMATION_INTERVAL / 1000;
          globalEvent.trigger( 'energyChange', this.id, this.energy );

          this.timer = setTimeout( moving.bind( this ), ANIMATION_INTERVAL );
        }
      }.bind( this ), ANIMATION_INTERVAL );
    }
  };

  /**
   * 动力系统提供的停止飞行功能
   */
  Craft.prototype.stop = function () {
    if ( this.state !== 'stop' ) {
      this.state = 'stop';
      clearTimeout( this.timer );

      this.timer = setTimeout( function stopping() {
        this.energy += this.energySys.chargeSpeed *
          ANIMATION_INTERVAL / 1000;

        if ( this.energy >= 100 ) {
          this.energy = 100;
        } else {
          this.timer = setTimeout( stopping.bind( this ), 
            ANIMATION_INTERVAL );
        }
        globalEvent.trigger( 'energyChange', this.id, this.energy );
      }.bind( this ), ANIMATION_INTERVAL );
    }
  };

  /**
   * 自爆系统提供的销毁功能
   */
  Craft.prototype.destroy = function () {

    // 先把两个定时器清除
    clearTimeout( this.timer );
    clearTimeout( this.emitter );

    // 发送销毁信息
    this.emit({
      id: this.id,
      status: 'destroy',
      energy: this.energy
    });

    globalEvent.trigger( 'destroy', this.id );
    BUS.remove( 'command', this.receiver );
    usableIds.push( this.id );

    // 飞船对象的引用设为null
    stateMap[ 'craft' + this.id ] = null;
  };

  /**
   * 信号发射器的发射信号功能
   */
  Craft.prototype.emit = function ( data ) {
    var binary = adapter.toBinary( data );
    addMessage({
      type: 'normal',
      content: 'Craft ' + this.id + ' emit a message:' + binary
    });
    BUS.broadcast( 'status', binary );
  };

  /**
   * 信号接收处理系统
   */
  Craft.prototype.receiver = function ( binary ) {
    var self = craft,
        data = adapter.toObj( binary );

    // 先判断是不是给自己的
    if ( data.id === self.id ) {

      addMessage({
        type: 'normal',
        content: 'Craft ' + self.id + ' receive command:' + binary
      });

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

  var craft = new Craft();

  // 信号接收系统监听BUS中的命令
  BUS.listen( 'command', craft.receiver );

  // 装配不同的动力、能源系统
  craft.dynamicSys = DYNAMICSYS[ dynamicSys ];
  craft.energySys = ENERGYSYS[ energySys ];

  // 信号发射器开始定时发送状态消息
  craft.emitter = setTimeout( function emitStatus () {
    var self = craft;

    self.emit({
      id: self.id,
      status: self.state,
      energy: self.energy
    });

    self.emitter = setTimeout( emitStatus, EMIT_INTERVAL );
  }, EMIT_INTERVAL );

  globalEvent.trigger( 'create', craft.id, craft.track );

  // 模块内保存该craft的引用，销毁时用于删除
  stateMap[ 'craft' + craft.id ] = craft;

  return craft;
};

module.exports = {
  createCraft: createCraft
};
},{"./BUS.js":1,"./adapter.js":2,"./globalEvent.js":6,"./shell.console.js":7}],5:[function(require,module,exports){
/*
 * 数据中心模块
*/
var adapter = require('./adapter.js');
var monitor = require('./shell.monitor.js').monitor;
var BUS = require('./BUS.js');

var dc,
    receiver,
    craftNum = 0,
    handler;

/**
 * 行星上的信号接收器
 */
receiver = function ( binary ) {
  handler( binary );
};

/**
 * 处理接收器传过来的数据
 */
handler = function ( binary ) {
  var data = adapter.toObj( binary );

  if ( data.status === 'destroy' ) {
    monitor.removeRecord( data.id );
    craftNum--;
  } else {
    monitor.updateRecord( data );
  }
};

/**
 * 数据处理中心的公共API
 */
dc = {

  getCraftNum: function () {
    return craftNum;
  },

  /**
   * 新建飞船的状态信息
   */
  init: function ( id, dynamicSys, energySys ) {
    var record = {
      id: id,
      dynamicSys: dynamicSys,
      energySys: energySys,
      status: 'stop',
      energy: 100
    };
    craftNum++;
    monitor.addRecord( record );
  }
};

BUS.listen( 'status', receiver );

module.exports = dc;
},{"./BUS.js":1,"./adapter.js":2,"./shell.monitor.js":9}],6:[function(require,module,exports){
module.exports = {
  handlers: {},

  subscribe: function (event, callback, context) {
    var handlers = this.handlers[event] || (this.handlers[event] = []);
    handlers.push({callback: callback, context: context});
  },

  trigger: function (event) {
    var handlers = this.handlers[event],
        args = Array.prototype.slice.call(arguments, 1);
    handlers.map(function (handler) {
      var callback = handler.callback,
          context = handler.context;

      callback.apply(context, args);
    });
  }
};
},{}],7:[function(require,module,exports){
/*
 * shell.console子模块,负责控制台的渲染
 */
var mainHTML = '<ul class="console"></ul>',
    jqueryMap,
    setJqueryMap,
    addMessage,
    initConsole;

/**
 * 缓存DOM元素
 */
setJqueryMap = function () {
  jqueryMap = {
    $console: $( '.console' )
  };
};

/**
 * 控制台输出消息
 */
addMessage = function ( message ) {
  var ele = '<li class="' + message.type + '">' + message.content + '</li>';
  jqueryMap.$console.append( ele );
  jqueryMap.$console.prop( 'scrollTop', jqueryMap.$console.prop( 'scrollTop' ) + 18 );
};

/**
 * 初始化
 */
initConsole = function ( $container ) {
  $container.append( mainHTML );
  setJqueryMap();
};

module.exports = { 
  addMessage: addMessage,
  initConsole: initConsole
};
},{}],8:[function(require,module,exports){
/*
 * shell模块,负责主界面的渲染
*/
var globalEvent = require('./globalEvent.js');

var initConsole = require('./shell.console.js').initConsole;
var initMonitor = require('./shell.monitor.js').initMonitor;
var commander = require('./commander.js');

var mainHTML = 
      '<div class="shell">' + 
        '<div class="universe">' +
          '<div class="planet"></div>' +
        '</div>' +
        '<div class="panel">' +
          '<section>' +
            '<p>动力系统选择：</p>' +
            '<label class="option">' +
              '<input type="radio" name="dynSys" value="FORWARD">' +
              '前进号(速率30px/s, 能耗5%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="dynSys" value="GALLOP">' +
              '奔腾号(速率50px/s, 能耗7%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="dynSys" value="SURPASS">' +
              '超越号(速率80px/s, 能耗9%/s)' +
            '</label>' +
          '</section>' +
          '<section>' +
            '<p>能源系统选择：</p>' +
            '<label class="option">' +
              '<input type="radio" name="eneSys" value="POWER">' +
              '劲量型(补充能源速度2%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="eneSys" value="LIGHT">' +
              '光能型(补充能源速度3%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="eneSys" value="FOREVER">' +
              '永久型(补充能源速度4%/s)' +
            '</label>' +
          '</section>' +
          '<section>' +
            '<button class="control-button" data-command="create">创建新飞船</button>' +
          '</section>' +
        '</div>' +
      '</div>',
    jqueryMap, dynSysChosen, eneSysChosen,
    createCraft, moveCraft, changeEnergy, destroyCraft,
    setJqueryMap,
    getDegree, setDegree,
    handleClick,
    shell, init;

/**
 * 创建飞船和相应的按钮
 */
createCraft = function ( id, track ) {

  // 飞船本身的html
  var html = 
        '<div class="craft track' + track + '" id="craft' + id + '">' +
          '<div class="craft-body">' +
            id + '号 <span class="energy">100</span>%' +
          '</div>' +
          '<div class="craft-head"></div>' +
        '</div>',
      $craft = $( html );

  jqueryMap.$universe.append( $craft );

  // 缓存
  jqueryMap[ '$craft' + id ] = $craft;
  jqueryMap[ '$energy' + id ] = $craft.find( '.energy' );

  // 面板上对应控制按钮的html
  var controlHtml = 
        '<div class="controls" id="controls' + id + '">' +
          '<span>对' + id + '号飞船下达命令：</span>' +
          '<button class="control-button" data-target="' + id + '" data-command="move">开始飞行</button>' +
          '<button class="control-button" data-target="' + id + '" data-command="stop">停止飞行</button>' +
          '<button class="control-button" data-target="' + id + '" data-command="destroy">销毁</button>' +
        '</div>',
      $control = $( controlHtml );

  jqueryMap.$panel.append( $control );

  // 缓存
  jqueryMap[ '$control' + id ] = $control;
};

/**
 * 移动飞船
 */
moveCraft = function ( id, diff ) {
  var deg = getDegree( jqueryMap[ '$craft' + id ]) + diff;
  setDegree( jqueryMap[ '$craft' + id ], deg );
};

/**
 * 获取元素的tranform属性rotate中的角度值
 */
getDegree = function ( $ele ) {
  var ele = $ele[ 0 ],
      pattern = /\(([\d.]+)d/;

  // 第一次获取transform的时候，把transform设成rotate0
  if ( ele.style.transform === '' ) {
    setDegree( $ele, 0 );
    return 0;
  }
  return parseFloat( pattern.exec( ele.style.transform )[ 1 ]);
};

/**
 * 设置元素的tranform属性rotate中的角度值
 */
setDegree = function ( $ele, value ) {
  $ele[ 0 ].style.transform = 'rotate(' + value + 'deg)';
};

/**
 * 改变飞船的电量显示
 */
changeEnergy = function ( id, energy ) {
  jqueryMap[ '$energy' + id ].text( energy.toFixed( 1 ));
};

/**
 * 删除飞船和相应按钮
 */
destroyCraft = function ( id ) {
  jqueryMap[ '$craft' + id ].remove();
  jqueryMap[ '$control' + id ].remove();

  // 删除缓存
  delete jqueryMap[ '$craft' + id ];
  delete jqueryMap[ '$energy' + id ];
  delete jqueryMap[ '$control' + id ];
};

/**
 * 初始化界面
 */
init = function ( $container ) {
  $container.append( mainHTML );
  setJqueryMap();

  // 初始化子模块
  initMonitor( jqueryMap.$shell );
  initConsole( jqueryMap.$shell );

  // 按钮点击事件都委托给panel处理
  jqueryMap.$panel.bind( 'click', handleClick );

  // 订阅飞船状态事件
  globalEvent.subscribe('create', createCraft);
  globalEvent.subscribe('move', moveCraft);
  globalEvent.subscribe('energyChange', changeEnergy);
  globalEvent.subscribe('destroy', destroyCraft);
};

/**
 * 缓存jQuery元素
 */
setJqueryMap = function () {
  var $shell = $( '.shell' );

  jqueryMap = {
    $shell: $shell,
    $universe: $shell.find( '.universe' ),
    $panel: $shell.find( '.panel' ),
    $monitor: $shell.find( '.records' )
  };
};

/**
 * 处理按钮点击事件
 */
handleClick = function ( e ) {
  if ( e.target.className === 'control-button' ) {
    switch ( e.target.getAttribute( 'data-command' )) {
      case 'create':
        if ( dynSysChosen && eneSysChosen ) {
          commander.create( dynSysChosen, eneSysChosen );
        } else {
          addMessage({
            type: 'warning',
            content: 'Please choose dynamic and energy system first!'
          });
        }
        break;
      case 'move':
        commander.move( parseInt( e.target.getAttribute( 'data-target' )));
        break;
      case 'stop':
        commander.stop( parseInt( e.target.getAttribute( 'data-target' )));
        break;
      case 'destroy':
        commander.destroy( parseInt( e.target.getAttribute( 'data-target' )));
        break;
    }
  } else if ( e.target.getAttribute( 'name' ) === 'dynSys' ) {
    dynSysChosen = e.target.value;
  } else if ( e.target.getAttribute( 'name' ) === 'eneSys' ) {
    eneSysChosen = e.target.value;
  }
};

module.exports = { 
  init: init 
};
},{"./commander.js":3,"./globalEvent.js":6,"./shell.console.js":7,"./shell.monitor.js":9}],9:[function(require,module,exports){
/*
 * shell.monitor子模块,负责监视屏的渲染
*/
var mainHTML = 
      '<div class="monitor">' +
        '<table>' +
          '<tbody class="records">' +
            '<tr>' +
              '<th>飞船</th>' +
              '<th>动力系统</th>' +
              '<th>能源系统</th>' +
              '<th>当前飞行状态</th>' +
              '<th>剩余能耗</th>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>',

    jqueryMap,
    addRecord, updateRecord, removeRecord,
    setJqueryMap, initMonitor,
    monitor;

addRecord = function ( record ) {
  var recordHTML = 
        '<tr>' +
          '<td>' + record.id + '号</td>' +
          '<td>' + record.dynamicSys + '</td>' +
          '<td>' + record.energySys + '</td>' +
          '<td class="record-status">' + record.status + '</td>' +
          '<td class="record-energy">' + record.energy + '%</td>' +
        '</tr>',
      $record = $( recordHTML );

  jqueryMap.$records.append( $record );

  // 缓存
  jqueryMap[ '$record' + record.id ] = $record;
  jqueryMap[ '$record-status' + record.id ] = $record.find( '.record-status' );
  jqueryMap[ '$record-energy' + record.id ] = $record.find( '.record-energy' );
};

updateRecord = function ( data ) {
  jqueryMap[ '$record-status' + data.id ].text( data.status );
  jqueryMap[ '$record-energy' + data.id ].text( data.energy + '%' );
};

removeRecord = function ( id ) {
  jqueryMap[ '$record' + id ].remove();

  delete jqueryMap[ '$record' + id ];
  delete jqueryMap[ '$record-status' + id ];
  delete jqueryMap[ '$record-energy' + id ];
};

/**
 * 缓存DOM元素
 */
setJqueryMap = function () {
  jqueryMap = {
    $records: $( '.records' )
  };
};

/**
 * 初始化
 */
initMonitor = function ( $container ) {
  $container.append( mainHTML );
  setJqueryMap();
};

monitor = {
  addRecord: addRecord,
  updateRecord: updateRecord,
  removeRecord: removeRecord
};

module.exports = { 
  initMonitor: initMonitor, 
  monitor: monitor
};
},{}],10:[function(require,module,exports){
var init = require('./shell.js').init;

var $container = $( '#container' );
init( $container );

},{"./shell.js":8}]},{},[4,3,1,8,7,9,2,5,10]);
