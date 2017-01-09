var util = require( './util' ),
    mapView = require( './mapView' ),
    map = {},
    init,
    isAccessible;

/**
 * 根据传入的尺寸初始化地图
 *
 * @param { number } width
 * @param { number } height
 */
init = function ( width, height ) {
  var i, j;

  map = {
    data: [],
    width: width,
    height: height
  };
  for ( i = 1; i < height + 1; i++ ) {
    map.data[ i ] = [];
    for ( j = 1; j < width + 1; j++ ) {
      map.data[ i ][ j ] = {};
    }
  }

  // 绑定map模型和视图
  util.extend( new util.Subject(), map );
  map.addObserver( mapView );
  map.notify( 'init', map );
};

/**
 * 根据传入的坐标判断该格是否可进入
 *
 * @param { number } x
 * @param { number } y
 * @returns { boolean }
 */
isAccessible = function ( x, y ) {
  return x > 0 && y > 0 && map.data[ y ] !== undefined && 
    map.data[ y ][ x ] !== undefined;
};

module.exports = {
  init: init,
  isAccessible: isAccessible
};