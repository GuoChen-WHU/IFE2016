(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var robotController = require( './robotController' ),
    util = require( './util' ),
    mapModel = require( './mapModel' ),
    robotModel = require( './robotModel' );

/**
 * 显示行号的侧栏
 */
var indicator = {
  /**
   * 当前执行的命令行号
   */
  current: 0,
  /**
   * 执行出错的行号
   */
  errors: [],

  ele: document.getElementsByClassName( 'indicator' )[ 0 ],

  /**
   * 开始执行某一行命令
   * @param {number} index
   */
  startProcessing: function ( index ) {
    util.addClass( this.ele.rows[ index ], 'processing' );
  },

  /**
   * 结束执行某一行命令
   * @param {number} index
   */
  endProcessing: function ( index ) {
    util.removeClass( this.ele.rows[ index ], 'processing' );
  },

  /**
   * 设置当前执行的命令行
   * @param {number} index
   */  
  setCurrent: function ( index ) {
    this.endProcessing( this.current );
    this.current = index;
    this.startProcessing( this.current );
    console.input.scrollTop = index * 16;
  },

  /**
   * 标记某一行出错
   * @param {number} index
   */
  setError: function ( index ) {
    util.addClass( this.ele.rows[ index ], 'error' );
    this.errors.push( index );
  },

  /**
   * 添加若干行号
   * @param {number} num
   */
  addRows: function ( num ) {
    var i,
        row;
    num = num || 1;

    for ( i = 0; i < num; i++ ) {
      row = this.ele.insertRow();
      row.innerHTML = '<td>' + this.ele.rows.length + '</td>';
    }
  },

  /**
   * 移除若干行号
   * @param {number} num
   */
  removeRows: function ( num ) {
    var i;
    num = num || 1;

    for ( i = 0; i < num; i++ ) {
      this.ele.deleteRow( -1 );
    }
  },

  /**
   * 设置有多少个行号
   * @param {number} num
   */
  setRows: function ( num ) {
    var now = this.ele.rows.length,
        diff = num - now;

    if ( diff === 0 ) return;
    return diff > 0 ? this.addRows( diff ) : this.removeRows( -diff );
  },

  /**
   * 重置当前执行行、出错行等状态
   */
  reset: function () {
    util.removeClass( this.ele.rows[ this.current ], 'processing' );
    this.errors.forEach( function ( index ) {
      util.removeClass( this.ele.rows[ index ], 'error' );
    });
    this.current = 0;
    this.errors = [];
  }
};

/**
 * 控制台对象
 */
var console = {
  indicator: indicator,
  input: document.getElementsByClassName( 'console-input' )[ 0 ],

  commands: [],
  /**
   * 当前执行的命令在commands中的索引
   */
  commandIndex: -1,

  init: function () {

    this.input.value = 'MOV RIG\nGO\nTUN RIG';
    this.input.addEventListener( 'input', this.onInput.bind( this ));
    this.input.addEventListener( 'scroll', this.onScroll.bind( this ));

    var executeBtn = document.getElementsByClassName( 'console-execute' )[ 0 ],
        randomBtn = document.getElementsByClassName( 'console-random' )[ 0 ],
        drawBtn = document.getElementsByClassName( 'console-draw' )[ 0 ];

    executeBtn.addEventListener( 'click', this.onExecute.bind( this ));
    randomBtn.addEventListener( 'click', this.onRandomBuild.bind( this ));
    drawBtn.addEventListener( 'click', this.onDraw.bind( this ));
  },

  /**
   * 执行命令
   */
  onExecute: function () {
    this.reset();
    this.commands = this.input.value.split( '\n' );
    this.executeLoop();
  },

  /**
   * input有输入时，调整行号的显示
   */
  onInput: function () {
    var num = this.input.value.split( '\n' ).length;
    this.indicator.setRows( num );
  },

  /**
   * input滑动时，相应滑动行号
   */
  onScroll: function ( e ) {
    this.indicator.ele.scrollTop = e.target.scrollTop;
  },

  /**
   * 随机生成墙，避开机器人所在的一格
   */
  onRandomBuild: function () {
    // 随机生成一个数组，每个元素是一个坐标
    var coors = randomCoors( 10, 20 );

    // 机器人在的这一格不修
    var current = robotModel.getPosition();
    coors.forEach( function ( coor ) {
      if ( coor[ 0 ] !== current[ 0 ] || coor[ 1 ] !== current[ 1 ] )
        mapModel.setCell( coor, { color: '#f00' } );
    });
  },

  /**
   * 画笑脸
   */
  onDraw: function () {
    // 直接改变input.value不会触发input事件，只好直接调用onInput方法
    this.input.value = smileCommands;
    this.onInput();
    this.onExecute();
  },

  /**
   * 执行命令循环
   */
  executeLoop: function () {

    // 如果有命令需要执行且没有命令正在执行，执行下一条命令
    if ( this.commands.length && !robotController.executing ) {
      var command = this.commands.shift();
      this.commandIndex++;

      // 当前行号高亮
      this.indicator.setCurrent( this.commandIndex );
      
      // robotController处理命令
      if ( !robotController.handlerCommand( command ) ) {
        this.indicator.setError( this.commandIndex );
      }
    }

    // 如果还有命令没执行完或者最后一条命令还在执行，继续任务循环
    if ( this.commands.length || robotController.executing ) {
      setTimeout( this.executeLoop.bind( this ), 1 );
    } else {
      
      // 最后一条命令也执行完了
      this.indicator.endProcessing( this.commandIndex );
    }
  },

  /**
   * 重置状态
   */
  reset: function () {
    this.commands = [];
    this.commandIndex = -1;
    this.indicator.reset();
  }
};

/**
 * 生成min和max之间个数的随机坐标
 * @param {number} min
 * @param {number} max
 */
function randomCoors ( min, max ) {
  var num = Math.floor( min + Math.random() * ( max - min ) ),
      coors = [],
      width = mapModel.getWidth(),
      height = mapModel.getHeight(),
      i,
      x,
      y;

  for ( i = 0; i < num; i++ ) {
    x = Math.round( 1 + Math.random() * ( width - 1 ) );
    y = Math.round( 1 + Math.random() * ( height - 1 ) );
    coors.push( [x, y] );
  }
  return coors;
}

/**
 * 生成笑脸的命令
 */
var smileCommands = 'MOV TO 3 7\n' +
      'BUILD\n' +
      'MOV TO 4 6\n' +
      'BUILD\n' +
      'MOV TO 5 5\n' +
      'BUILD\n' +
      'MOV TO 6 5\n' +
      'BUILD\n' +
      'MOV TO 7 5\n' +
      'BUILD\n' +
      'MOV TO 8 6\n' +
      'BUILD\n' +
      'MOV TO 9 7\n' +
      'BUILD\n' +
      'MOV TO 12 7\n' +
      'BUILD\n' +
      'MOV TO 13 6\n' +
      'BUILD\n' +
      'MOV TO 14 5\n' +
      'BUILD\n' +
      'MOV TO 15 5\n' +
      'BUILD\n' +
      'MOV TO 16 5\n' +
      'BUILD\n' +
      'MOV TO 17 6\n' +
      'BUILD\n' +
      'MOV TO 18 7\n' +
      'BUILD\n' +
      'MOV TO 5 15\n' +
      'BUILD\n' +
      'MOV TO 6 16\n' +
      'BUILD\n' +
      'MOV TO 7 17\n' +
      'BUILD\n' +
      'MOV TO 8 18\n' +
      'BUILD\n' +
      'MOV TO 9 19\n' +
      'BUILD\n' +
      'MOV TO 10 19\n' +
      'BUILD\n' +
      'MOV TO 11 19\n' +
      'BUILD\n' +
      'MOV TO 12 19\n' +
      'BUILD\n' +
      'MOV TO 13 18\n' +
      'BUILD\n' +
      'MOV TO 14 17\n' +
      'BUILD\n' +
      'MOV TO 15 16\n' +
      'BUILD\n' +
      'MOV TO 16 15\n' +
      'BUILD';

console.init();
},{"./mapModel":3,"./robotController":5,"./robotModel":6,"./util":8}],2:[function(require,module,exports){
var mapModel = require( './mapModel' ),
    mapView = require( './mapView' ),
    robotModel = require( './robotModel' ),
    robotView = require( './robotView' ),
    container = document.getElementsByClassName( 'container' )[ 0 ];

mapView.init( container );
mapModel.init( 20, 20 );
robotView.init( container );
robotModel.init( 2, 2, 'top' );

},{"./mapModel":3,"./mapView":4,"./robotModel":6,"./robotView":7}],3:[function(require,module,exports){
var util = require( './util' ),
    mapView = require( './mapView' ),
    map = {},
    init,
    setCell,
    getWidth,
    getHeight,
    isAccessible,
    getNeighbors;

// 绑定map模型和视图
util.extend( new util.Subject(), map );
map.addObserver( mapView );

/**
 * 根据传入的尺寸初始化地图
 *
 * @param { number } width
 * @param { number } height
 */
init = function ( width, height ) {
  var i, j;

  map.data = [];
  map.width = width;
  map.height = height;
  for ( i = 1; i < height + 1; i++ ) {
    map.data[ i ] = [];
    for ( j = 1; j < width + 1; j++ ) {
      map.data[ i ][ j ] = {};
    }
  }

  map.notify( 'init', map.width, map.height );
};

setCell = function ( position, data ) {
  var x = position[ 0 ],
      y = position[ 1 ];
  map.data[ y ][ x ] = data;
  map.notify( 'cellChange', x, y, map.data[ y ][ x ] );
};

getWidth = function () {
  return map.width;
};

getHeight = function () {
  return map.height;
};

/**
 * 根据传入的坐标判断该格是否可进入
 *
 * @param { number } x
 * @param { number } y
 * @returns { boolean }
 */
isAccessible = function ( position ) {
  var x = position[ 0 ],
      y = position[ 1 ];
      
  // 没有color属性就没有墙
  return isInside( position ) && !map.data[ y ][ x ].color;
};

isInside = function ( position ) {
  var x = position[ 0 ],
      y = position[ 1 ];
      
  return x > 0 && y > 0 && x <= map.width && y <= map.height;
};

var neighbors = [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, -1 ], [ 0, 1 ],
                  [ 1, -1 ], [ 1, 0 ], [ 1, 1 ] ];

getNeighbors = function ( position ) {
  var x = position[ 0 ],
      y = position[ 1 ];

  return neighbors.map( function ( neighbor ) {
    if ( isAccessible( x + neighbor[ 0 ], y + neighbor[ 1 ] ) ) {
      return [ x + neighbor[ 0 ], y + neighbor[ 1 ] ];
    }
  });
};

module.exports = {
  init: init,
  setCell: setCell,
  getWidth: getWidth,
  getHeight: getHeight,
  isAccessible: isAccessible
};
},{"./mapView":4,"./util":8}],4:[function(require,module,exports){
var util = require( './util' ),
    mapEle,
    mapView = {};

util.extend( new util.Observer(), mapView );

mapView.init = function ( container ) {
  mapEle = document.createElement( 'table' );
  mapEle.className = 'map';
  mapEle.border = 1;
  container.appendChild( mapEle );
};

mapView.update = function () {
  var type = Array.prototype.shift.call( arguments );

  switch ( type ) {
    case 'init':
      var width = Array.prototype.shift.call( arguments ),
          height = Array.prototype.shift.call( arguments );
      this.render( width, height );
      break;
    case 'cellChange':
      var x = Array.prototype.shift.call( arguments ),
          y = Array.prototype.shift.call( arguments ),
          data = Array.prototype.shift.call( arguments );
      this.updateCell( x, y, data );
      break;
  }
};

mapView.render = function ( width, height ) {
  var i,
      j,
      row,
      cell;
  
  for ( i = 0; i < height; i++ ) {
    row = document.createElement( 'tr' );
    for ( j = 0; j < width; j++ ) {
      cell = document.createElement( 'td' );
      cell.className = 'map-cell';
      cell.setAttribute( 'coordinate', ( j + 1 ) + ',' + ( i + 1 ) );
      row.appendChild( cell );
    }
    mapEle.appendChild( row );
  }
};

mapView.updateCell = function ( x, y, data ) {
  var coorAttr = x + ',' + y;
      cell = document.querySelector( '[coordinate="' + coorAttr + '"]' );

  cell.style.backgroundColor = data.color;
};

module.exports = mapView;
},{"./util":8}],5:[function(require,module,exports){
var robotModel = require( './robotModel' ),
    mapModel = require( './mapModel' ),
    robotController = {},
    endExecuting,
    forward,
    getForwardCoor,
    turn,
    turnTo,
    translate,
    move,
    moveTo,
    turnMap = {
      left: {
        left: 'bottom',
        right: 'top',
        back: 'right'
      },
      right: {
        left: 'top',
        right: 'bottom',
        back: 'left'
      },
      top: {
        left: 'left',
        right: 'right',
        back: 'bottom'
      },
      bottom: {
        left: 'right',
        right: 'left',
        back: 'top'
      }
    },
    buildWall,
    brushWall,
    defaultColor = '#f00',
    composer;

composer = {
  tasks: [],
  timer: null,
  addTask: function ( task, cost ) {
    var args = Array.prototype.slice.call( arguments, 2 );
    args.unshift( null );
    this.tasks.push( { task: Function.prototype.bind.apply( task, args ), cost: cost || 0 } );
  },
  next: function ( endCallback ) {
    var current = this.tasks.shift();
    if ( current ) {
      var result = current.task();
      if ( result === true ) {
        this.timer = setTimeout( this.next.bind( this, endCallback ), current.cost );
      } else {
        endCallback();
        throw new Error( result );
      }
    } else {
      endCallback();
    }
  },
  clean: function () {
    this.tasks = [];
    clearTimeout( this.timer );
  }
};

robotController.handlerCommand = function ( command ) {
  var step,
      i,
      dirc;

  // GO命令
  var goRegExp = /^GO(?:\s(\d+))?$/,
      goMatchResult = command.match( goRegExp );
  if ( goMatchResult ) {
    composer.clean();
    this.executing = true;
    // 没有捕获到移动步数，那就是移动一步
    step = parseInt( goMatchResult[ 1 ] ) || 1;

    for ( i = 0; i < step; i++ ) {
      composer.addTask( forward, 1000 );
    }
    try {
      composer.next( endExecuting );
    } catch ( e ) {
      console.log( e.message );
      return false;
    }
    return true;
  }

  // TRA命令
  var traRegExp = /^TRA\s(TOP|LEF|RIG|BOT)(?:\s(\d+))?$/,
      traMatchResult = command.match( traRegExp );
  if ( traMatchResult ) {
    composer.clean();
    this.executing = true;
    dirc = traMatchResult[ 1 ];
    step = parseInt( traMatchResult[ 2 ] ) || 1;
    for ( i = 0; i < step; i++ ) {
      composer.addTask( translate, 1000, dirc );
    }
    try {
      composer.next( endExecuting );
    } catch ( e ) {
      console.log( e.message );
      return false;
    }
    return true;
  }

  // MOV命令
  var movRegExp = /^MOV\s(TOP|LEF|RIG|BOT)(?:\s(\d+))?$/,
      movMatchResult = command.match( movRegExp ),
      dircTransMap = { TOP: 'top', LEF: 'left', RIG: 'right', BOT: 'bottom' };
  if ( movMatchResult ) {
    composer.clean();
    this.executing = true;
    dirc = dircTransMap[ movMatchResult[ 1 ] ];
    step = parseInt( movMatchResult[ 2 ] ) || 1;
    
    if ( robotModel.getDirection() !== dirc ) {
      composer.addTask( turnTo, 1000, dirc );
    }
    for ( i = 0; i < step; i++ ) {
      composer.addTask( forward, 1000 );
    }
    try {
      composer.next( endExecuting );
    } catch ( e ) {
      console.log( e.message );
      return false;
    }
    return true;
  }

  // MOV TO 命令
  var mtRegExp = /^MOV\sTO\s(\d+)\s(\d+)$/,
      mtMatchResult = command.match( mtRegExp );

  if ( mtMatchResult ) {
    composer.clean();
    this.executing = true;
    composer.addTask( moveTo, 1000, mtMatchResult[ 1 ], mtMatchResult[ 2 ] );
    try {
      composer.next( endExecuting );
    } catch ( e ) {
      console.log( e.message );
      return false;
    }
    return true;
  }

  // BRU命令
  var bruRegExp = /^BRU\s(#[A-Za-z0-9]{3,6})$/;
      bruMatchResult = command.match( bruRegExp );
  if ( bruMatchResult ) {
    brushWall( bruMatchResult[ 1 ] );
    return true;
  }

  switch ( command ) {
    case 'TUN LEF':
      composer.clean();
      this.executing = true;
      composer.addTask( turn, 1000, 'left' );
      composer.next( endExecuting );
      return true;
    case 'TUN RIG':
      composer.clean();
      this.executing = true;
      composer.addTask( turn, 1000, 'right' );
      composer.next( endExecuting );
      return true;
    case 'TUN BAC':
      composer.clean();
      this.executing = true;
      composer.addTask( turn, 1000, 'back' );
      composer.next( endExecuting );
      return true;
    case 'BUILD':
      return buildWall();
  }
};

// 动画结束后将executing设为false
endExecuting = function () {
  robotController.executing = false;
};

// 前进一步
forward = function () {
  var coor = getForwardCoor();
  if ( mapModel.isAccessible( coor ) ) {
    robotModel.setPosition( coor );
    return true;
  } else {
    return 'Can\'t move forward';
  }
};

// 获取前面一格的坐标
getForwardCoor = function () {
  var resultX = robotModel.position[ 0 ],
      resultY = robotModel.position[ 1 ];

  switch ( robotModel.direction ) {
    case 'top':
     resultY--;
     break;
    case 'right':
     resultX++;
     break;
    case 'bottom':
     resultY++;
     break;
    case 'left':
     resultX--;
     break;
  }
  return [ resultX, resultY ];
};

// 转向
turn = function ( drctChange ) {
  var direction = robotModel.direction;

  robotModel.setDirection( turnMap[ direction ][ drctChange ] );
  return true;
};

turnTo = function ( dirc ) {
  robotModel.setDirection( dirc );
  return true;
};

// 平移
translate = function ( dirc ) {
  var resultX = robotModel.position[ 0 ],
      resultY = robotModel.position[ 1 ];

  switch ( dirc ) {
    case 'LEF':
      resultX--;
      break;
    case 'TOP':
      resultY--;
      break;
    case 'RIG':
      resultX++;
      break;
    case 'BOT':
      resultY++;
      break;
  }
  if ( mapModel.isAccessible( [ resultX, resultY ] ) ) {
    robotModel.setPosition( [ resultX, resultY ] );
    return true;
  } else {
    return 'Can\'t translate to ' + resultX + ',' + resultY;
  }
};

// 根据寻路算法移动到某单元格
moveTo = function ( x, y ) {
  if ( mapModel.isAccessible( [ x, y ] ) ) {
    robotModel.setPosition( [ x, y ] );
    return true;
  } else {
    return false;
  }
};

// 前面一格建墙
buildWall = function () {
  var coor = getForwardCoor();
  if ( mapModel.isAccessible( coor ) ) {
    mapModel.setCell( coor, { color: defaultColor } );
    return true;
  } else {
    console.log( 'Wall already exists.' );
    return false;
  }
};

// 粉刷面前的墙
brushWall = function ( color ) {
  var coor = getForwardCoor();
  if ( !mapModel.isAccessible( coor ) ) {
    mapModel.setCell( coor, { color: color } );
    return true;
  } else {
    console.log( 'No wall here.' );
    return false;
  }
};

module.exports = robotController;
},{"./mapModel":3,"./robotModel":6}],6:[function(require,module,exports){
var util = require( './util' ),
    robotView = require( './robotView' ),
    robotModel = {};

util.extend( new util.Subject(), robotModel );
robotModel.addObserver( robotView );

/**
 * 初始化
 *
 * @param { number } x
 * @param { number } y
 * @param { string } direction
 */
robotModel.init = function ( x, y, direction ) {
  this.setPosition( [ x, y ] );
  this.setDirection( direction );
};

robotModel.setPosition = function ( position ) {
  var oldX = this.position && this.position[ 0 ],
      oldY = this.position && this.position[ 1 ];

  if ( oldX !== position[ 0 ] || oldY !== position[ 1 ] ) {
    this.position = position;
    this.notify( 'change:position', this.position );
  }
};

robotModel.getPosition = function () {
  return this.position;
};

robotModel.setDirection = function ( direction ) {
  if ( this.direction !== direction ) {
    this.notify( 'change:direction', this.direction, direction );
    this.direction = direction;
  }
};

robotModel.getDirection = function () {
  return this.direction;
};

module.exports = robotModel;
},{"./robotView":7,"./util":8}],7:[function(require,module,exports){
var util = require( './util' ),
    robotEle,
    robotView = {},
    angleDiffMap = {
      top: {
        left: -90,
        right: 90,
        bottom: 180
      },
      right: {
        top: -90,
        bottom: 90,
        left: 180
      },
      bottom: {
        right: -90,
        top: 180,
        left: 90
      },
      left: {
        top: 90,
        right: 180,
        bottom: -90
      }
    },
    // 为了初始化的时候，old direction没有值的情况加的
    angleMap = {
      top: 0,
      right: 90,
      bottm: 180,
      left: -90
    },
    cellSize = 30;

util.extend( new util.Observer(), robotView );

robotView.init = function ( container ) {
  robotEle = document.createElement( 'div' );
  robotEle.className = 'robot';
  container.appendChild( robotEle );
};

robotView.update = function ( type ) {
  switch ( type ) {
    case 'change:position':
      var position = arguments[ 1 ];
      robotEle.style.left = ( position[ 0 ] - 1 ) * cellSize + 'px';
      robotEle.style.top = ( position[ 1 ] - 1 ) * cellSize + 'px';
      break;
    case 'change:direction':
      // 初始化的时候，old direction是undefined
      if ( !arguments[ 1 ] ) {
        setAngle( angleMap[ arguments[ 2 ] ] );
      } else {
        var diff = angleDiffMap[ arguments[ 1 ] ][ arguments[ 2 ] ],
            oldAngle = getAngle(),
            newAngle = oldAngle + diff;

        setAngle( newAngle );
      }
      break;
   }
};

function getAngle() {
  if ( robotEle.style.transform === '' ) {
    setAngle( 0 );
    return 0;
  } else {
    var pattern = /\(([\d.]+)deg/;
    return parseFloat( robotEle.style.transform.match( pattern )[ 1 ] );
  }
}

function setAngle( value ) {
  robotEle.style.transform = 'rotate(' + value + 'deg)';
}

module.exports = robotView;
},{"./util":8}],8:[function(require,module,exports){
// 观察者模式实现
//----------------

/**
 * 目标类
 */
function Subject() {
  this.observers = [];
}

/**
 * 添加观察者
 *
 * @param { Observer } observer
 */
Subject.prototype.addObserver = function ( observer ) {
  this.observers.push( observer );
};

/**
 * 移除观察者
 *
 * @param { Observer } observer
 */
Subject.prototype.removeObserver = function ( observer ) {
  var index = this.observers.indexOf( observer );
  
  return index > -1 ? this.observers.slice( index, 1 ) : null;
};

/**
 * 通知观察者
 *
 * @param arguments
 */
Subject.prototype.notify = function () {
  var args = arguments;
  this.observers.forEach( function ( observer ) {
    observer.update.apply( observer, args );
  });
};

/**
 * 观察者类
 */
function Observer () {
}

/**
 * 更新观察者
 *
 * @param { Object } context
 */
Observer.prototype.update = function ( context ) {
  throw 'Update method not instanced!';
};

/**
 * 扩展对象
 *
 * @param { Object } obj
 * @param { Object } extension
 */
function extend( obj, extension ) {
  var key;
  for ( key in obj ) {
    extension[ key ] = obj[ key ];
  }
}

function hasClass ( ele, className ) {
  return (' ' + ele.className + ' ').indexOf( ' ' + className + ' ' ) != -1;
}

function addClass ( ele, className ) {
  if ( !hasClass( ele, className )) {
    ele.className = (ele.className + ' ' + className).trim();
  }
}

function removeClass ( ele, className ) {
  if ( hasClass( ele, className )) {
    ele.className = ele.className.replace( className, '' ).trim();
  }
}

module.exports = {
  Subject: Subject,
  Observer: Observer,
  extend: extend,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass
};
},{}]},{},[1,2,3,4,5,6,7,8]);
