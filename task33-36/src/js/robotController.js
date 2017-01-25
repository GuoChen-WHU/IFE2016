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