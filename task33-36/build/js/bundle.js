(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var robot = require( './robot' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ];

executeButton.addEventListener( 'click', function () {
  switch ( commandInput.value ) {
    case 'GO':
      robot.forward();
      break;
    case 'TUN LEF':
      robot.turn( 'left' );
      break;
    case 'TUN RIG':
      robot.turn( 'right' );
      break;
    case 'TUN BAC':
      robot.turn( 'back' );
      break;
  }
});
},{"./robot":5}],2:[function(require,module,exports){
var map = require( './map' ),
    mapView = require( './mapView' ),
    robot = require( './robot' ),
    robotView = require( './robotView' ),
    container = document.getElementsByClassName( 'container' )[ 0 ];

mapView.init( container );
map.init( 20, 20 );
robotView.init( container );
robot.init();

},{"./map":3,"./mapView":4,"./robot":5,"./robotView":6}],3:[function(require,module,exports){
var util = require( './util' ),
    mapView = require( './mapView' ),
    map = {},
    init,
    isAccessible;

/**
 * 根据传入的尺寸初始化地图
 *
 * @param { number } width
 * @param { number } height
 */
init = function ( width, height ) {
  var i, j;

  map = {
    data: [],
    width: width,
    height: height
  };
  for ( i = 1; i < height + 1; i++ ) {
    map.data[ i ] = [];
    for ( j = 1; j < width + 1; j++ ) {
      map.data[ i ][ j ] = {};
    }
  }

  // 绑定map模型和视图
  util.extend( new util.Subject(), map );
  map.addObserver( mapView );
  map.notify( 'init', map );
};

/**
 * 根据传入的坐标判断该格是否可进入
 *
 * @param { number } x
 * @param { number } y
 * @returns { boolean }
 */
isAccessible = function ( x, y ) {
  return x > 0 && y > 0 && map.data[ y ] !== undefined && 
    map.data[ y ][ x ] !== undefined;
};

module.exports = {
  init: init,
  isAccessible: isAccessible
};
},{"./mapView":4,"./util":7}],4:[function(require,module,exports){
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
  var type = Array.prototype.shift.call( arguments ),
      map = Array.prototype.shift.call( arguments );

  switch ( type ) {
    case 'init':
      this.render( map.width, map.height );
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

module.exports = mapView;
},{"./util":7}],5:[function(require,module,exports){
var util = require( './util' ),
    map = require( './map' ),
    robotView = require( './robotView' ),
    robot = {},
    init,
    moveTo,
    turnTo,
    forward,
    turn,

    // 存储变换方向结果
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
    };

/**
 * 初始化
 *
 * @param { number } x
 * @param { number } y
 * @param { string } direction
 */
init = function ( x, y, direction ) {
  robot = {
    position: [ 1, 1 ],
    direction: 'top'
  };

  util.extend( new util.Subject(), robot );
  robot.addObserver( robotView );
  robot.notify( robot.position, robot.direction );
};

/**
 * 移动到指定的位置,成功返回true,否则返回false
 *
 * @param { number } x
 * @param { number } y
 * @returns { boolean }
 */
moveTo = function ( x, y ) {
  if ( map.isAccessible( x, y ) ) {
    robot.position = [ x, y ];
    robot.notify( robot.position, robot.direction );
    return true;
  } else {
    return false;
  }
};

/**
 * 转向指定的方向
 *
 * @param { string } direction
 */
turnTo = function ( direction ) {
  robot.direction = direction;
  robot.notify( robot.position, robot.direction );
};

forward = function () {
  var resultX = robot.position[ 0 ],
      resultY = robot.position[ 1 ];

  switch ( robot.direction ) {
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

  moveTo( resultX, resultY );
};

turn = function ( drctChange ) {
  var direction = robot.direction;

  turnTo( turnMap[ direction ][ drctChange ] );
};

module.exports = {
  init: init,
  forward: forward,
  turn: turn
};
},{"./map":3,"./robotView":6,"./util":7}],6:[function(require,module,exports){
var util = require( './util' ),
    robotEle,
    directionMap = {
      'top': 0,
      'right': 90,
      'bottom': 180,
      'left': 270
    },
    robotView = {},
    cellSize = 30;

util.extend( new util.Observer(), robotView );

robotView.init = function ( container ) {
  robotEle = document.createElement( 'div' );
  robotEle.className = 'robot';
  container.appendChild( robotEle );
};

robotView.update = function () {
  var position = Array.prototype.shift.call( arguments ),
      direction = Array.prototype.shift.call( arguments );

  robotEle.style.left = ( position[ 0 ] - 1 ) * cellSize + 'px';
  robotEle.style.top = ( position[ 1 ] - 1 ) * cellSize + 'px';
  robotEle.style.transform = 'rotate(' + directionMap[ direction ] + 'deg)';
};

module.exports = robotView;
},{"./util":7}],7:[function(require,module,exports){
/**
 * 观察者模式实现
 */

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
  var args = Array.prototype.slice.call( arguments );
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

module.exports = {
  Subject: Subject,
  Observer: Observer,
  extend: extend
};
},{}]},{},[1,2,3,4,5,6,7]);
