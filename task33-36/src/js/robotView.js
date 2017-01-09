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