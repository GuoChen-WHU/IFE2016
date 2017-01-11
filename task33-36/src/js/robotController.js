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