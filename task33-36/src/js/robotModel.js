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