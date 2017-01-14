(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var robotController = require( './robotController' ),
    util = require( './util' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ],
    clearButton = document.getElementsByClassName( 'console-clear' )[ 0 ],
    indicator = document.getElementsByClassName( 'row-indicator' )[ 0 ],
    indicatorBody = document.getElementsByClassName( 'indicator-body' )[ 0 ],
    currentRow = 3,
    executeNext,
    index = -1,
    resetLast,
    resetAll,
    errorRows = [],
    commands;

commandInput.value = 'MOV RIG\nGO\nGO';

executeButton.addEventListener( 'click', function () {
  commands = commandInput.value.split( '\n' );
  resetAll();
  executeNext();
});

executeNext = function () {
  var command = commands.shift().trim();
  // 前一行的高亮去掉
  if ( index >= 0 ) {
    util.removeClass( indicatorBody.children[ index ], 'processing' );
  }
  index++;
  // 当前行号高亮
  util.addClass( indicatorBody.children[ index ], 'processing' );
  // robotController处理命令
  if ( !robotController.handlerCommand( command ) ) {
    util.addClass( indicatorBody.children[ index ], 'error' );
    errorRows.push( index );
  }
  if ( commands.length ) {
    setTimeout( executeNext, 1000 );
  } else {
    setTimeout( resetLast, 1000 );
  }
};

resetLast = function () {
  util.removeClass( indicatorBody.children[ index ], 'processing' );
};

resetAll = function () {
  index = -1;
  errorRows.forEach( function ( index ) {
    util.removeClass( indicatorBody.children[ index ], 'error' );
  });
};

clearButton.addEventListener( 'click', function () {
  commandInput.value = '';
});

commandInput.addEventListener( 'scroll', function ( e ) {
  indicator.scrollTop = e.target.scrollTop;
});

commandInput.addEventListener( 'keyup', function ( e ) {
  var rowNum = e.target.value.split( '\n' ).length,
      diff = rowNum - currentRow,
      i,
      row;

  if ( diff === 0 ) return;
  else if ( diff > 0 ) {
    for ( i = 0; i < diff; i++ ) {
      row = document.createElement( 'tr' );
      row.innerHTML = '<td>' + ( currentRow + 1 ) + '</td>';
      indicatorBody.appendChild( row );
      currentRow++;
    }
  } else {
    for ( i = 0; i < -diff; i++ ) {
      indicatorBody.removeChild( indicatorBody.lastElementChild );
      currentRow--;
    }
  }
  
});
},{"./robotController":5,"./util":8}],2:[function(require,module,exports){
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
    forward,
    turn,
    tra,
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

robotController.handlerCommand = function ( command ) {
  var success = false,
      step,
      i,
      dirc;

  // GO命令
  var goRegExp = /^GO(?:\s(\d+))?$/,
      goMatchResult = command.match( goRegExp );
  if ( goMatchResult ) {
    // 没有捕获到移动步数，那就是移动一步
    step = parseInt( goMatchResult[ 1 ] ) || 1;
    for ( i = 0; i < step; i++ ) {
      success = forward();
      if ( !success ) return success;
    }
    return success;
  }

  // TRA命令
  var traRegExp = /^TRA\s(TOP|LEF|RIG|BOT)(?:\s(\d+))?$/,
      traMatchResult = command.match( traRegExp );
  if ( traMatchResult ) {
    dirc = traMatchResult[ 1 ];
    step = parseInt( traMatchResult[ 2 ] ) || 1;
    for ( i = 0; i < step; i++ ) {
      success = tra( dirc );
      if ( !success ) return success;
    }
    return success;
  }

  // MOV命令
  var movRegExp = /^MOV\s(TOP|LEF|RIG|BOT)(?:\s(\d+))?$/,
      movMatchResult = command.match( movRegExp ),
      dircTransMap = { TOP: 'top', LEF: 'left', RIG: 'right', BOT: 'bottom' };
  if ( movMatchResult ) {
    dirc = dircTransMap[ movMatchResult[ 1 ] ];
    step = parseInt( movMatchResult[ 2 ] ) || 1;
    // 先转向
    robotModel.setDirection( dirc );
    // 再forward
    for ( i = 0; i < step; i++ ) {
      success = forward();
      if ( !success ) return success;
    }
    return success;
  }

  switch ( command ) {
    case 'TUN LEF':
      success = turn( 'left' );
      break;
    case 'TUN RIG':
      success = turn( 'right' );
      break;
    case 'TUN BAC':
      success = turn( 'back' );
      break;
  }
  return success;
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
    return true;
  } else {
    return false;
  }
};

turn = function ( drctChange ) {
  var direction = robotModel.direction;

  robotModel.setDirection( turnMap[ direction ][ drctChange ] );
  return true;
};

tra = function ( dirc ) {
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
