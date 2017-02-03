var util = require( './util' ),
    mapView = require( './mapView' ),
    map = {},
    init,
    setCell,
    getWidth,
    getHeight,
    isAccessible,
    getNeighbors;

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

  map.notify( 'init', map.width, map.height );
};

setCell = function ( position, data ) {
  var x = position[ 0 ],
      y = position[ 1 ];
  map.data[ y ][ x ] = data;
  map.notify( 'cellChange', x, y, map.data[ y ][ x ] );
};

getWidth = function () {
  return map.width;
};

getHeight = function () {
  return map.height;
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
      
  // 没有color属性就没有墙
  return isInside( position ) && !map.data[ y ][ x ].color;
};

isInside = function ( position ) {
  var x = position[ 0 ],
      y = position[ 1 ];
      
  return x > 0 && y > 0 && x <= map.width && y <= map.height;
};

var neighbors = [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, -1 ], [ 0, 1 ],
                  [ 1, -1 ], [ 1, 0 ], [ 1, 1 ] ];

getNeighbors = function ( position ) {
  var x = position[ 0 ],
      y = position[ 1 ];

  return neighbors.map( function ( neighbor ) {
    if ( isAccessible( x + neighbor[ 0 ], y + neighbor[ 1 ] ) ) {
      return [ x + neighbor[ 0 ], y + neighbor[ 1 ] ];
    }
  });
};

module.exports = {
  init: init,
  setCell: setCell,
  getWidth: getWidth,
  getHeight: getHeight,
  isAccessible: isAccessible
};