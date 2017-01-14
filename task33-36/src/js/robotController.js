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