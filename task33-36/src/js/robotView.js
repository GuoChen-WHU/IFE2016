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