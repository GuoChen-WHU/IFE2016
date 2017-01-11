(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var robotController = require( './robotController' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ],
    clearButton = document.getElementsByClassName( 'console-clear' )[ 0 ];

commandInput.value = 'MOV RIG\nGO\nGO';

executeButton.addEventListener( 'click', function () {
  var commands = commandInput.value.split( '\n' );
  robotController.handlerExecute( commands );
});

clearButton.addEventListener( 'click', function () {
  commandInput.value = '';
});
},{"./robotController":5}],2:[function(require,module,exports){
var mapModel = require( './mapModel' ),
    mapView = require( './mapView' ),
    robotModel = require( './robotModel' ),
    robotView = require( './robotView' ),
    container = document.getElementsByClassName( 'container' )[ 0 ];

mapView.init( container );
mapModel.init( 20, 20 );
robotView.init( container );
robotModel.init();

},{"./mapModel":3,"./mapView":4,"./robotModel":6,"./robotView":7}],3:[function(require,module,exports){
var util = require( './util' ),
    mapView = require( './mapView' ),
    map = {},
    init,
    isAccessible;

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

  map.notify( 'init', map );
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
      
  return x > 0 && y > 0 && map.data[ y ] !== undefined && 
    map.data[ y ][ x ] !== undefined;
};

module.exports = {
  init: init,
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
},{"./util":8}],5:[function(require,module,exports){
var robotModel = require( './robotModel' ),
    mapModel = require( './mapModel' ),
    robotController = {},
    execute,
    forward,
    turn,
    tra,
    turnAndMove,
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

robotController.handlerExecute = function ( commands ) {
  executeOne();

  function executeOne () {
    var command = commands.shift();
    execute( command );
    if ( commands.length ) {
      setTimeout( executeOne, 1000 );
    }
  }
};

execute = function ( command ) {
  switch ( command ) {
    case 'GO':
      forward();
      break;
    case 'TUN LEF':
      turn( 'left' );
      break;
    case 'TUN RIG':
      turn( 'right' );
      break;
    case 'TUN BAC':
      turn( 'back' );
      break;
    case 'TRA LEF':
      tra( 'left' );
      break;
    case 'TRA TOP':
      tra( 'top' );
      break;
    case 'TRA RIG':
      tra( 'right' );
      break;
    case 'TRA BOT':
      tra( 'bottom' );
      break;
    case 'MOV LEF':
      turnAndMove( 'left' );
      break;
    case 'MOV TOP':
      turnAndMove( 'top' );
      break;
    case 'MOV RIG':
      turnAndMove( 'right' );
      break;
    case 'MOV BOT':
      turnAndMove( 'bottom' );
      break;
  }
};

forward = function () {
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
  if ( mapModel.isAccessible( [ resultX, resultY ] ) ) {
    robotModel.setPosition( [ resultX, resultY ] );
  }
};

turn = function ( drctChange ) {
  var direction = robotModel.direction;

  robotModel.setDirection( turnMap[ direction ][ drctChange ] );
};

tra = function ( dirc ) {
  var resultX = robotModel.position[ 0 ],
      resultY = robotModel.position[ 1 ];

  switch ( dirc ) {
    case 'left':
      resultX--;
      break;
    case 'top':
      resultY--;
      break;
    case 'right':
      resultX++;
      break;
    case 'bottom':
      resultY++;
      break;
  }
  if ( mapModel.isAccessible( [ resultX, resultY ] ) ) {
    robotModel.setPosition( [ resultX, resultY ] );
  }
};

turnAndMove = function ( dirc ) {
  robotModel.setDirection( dirc );
  // 两个动作分开
  setTimeout( forward, 300 );
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
  this.position = [ 1, 1 ];
  this.direction = 'top';

  this.notify( this.position, this.direction );
};

robotModel.setPosition = function ( position ) {
  var oldX = this.position[ 0 ],
      oldY = this.position[ 1 ];

  if ( oldX !== position[ 0 ] || oldY !== position[ 1 ] ) {
    this.position = position;
    this.notify( 'change:position', this.position );
  }
};

robotModel.setDirection = function ( direction ) {
  if ( this.direction !== direction ) {
    this.notify( 'change:direction', this.direction, direction );
    this.direction = direction;
  }
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
      var diff = angleDiffMap[ arguments[ 1 ] ][ arguments[ 2 ] ],
          oldAngle = getAngle(),
          newAngle = oldAngle + diff;

      setAngle( newAngle );

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

module.exports = {
  Subject: Subject,
  Observer: Observer,
  extend: extend
};
},{}]},{},[1,2,3,4,5,6,7,8]);
