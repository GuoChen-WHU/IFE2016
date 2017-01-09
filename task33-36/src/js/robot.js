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