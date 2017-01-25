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
  var type = Array.prototype.shift.call( arguments );

  switch ( type ) {
    case 'init':
      var width = Array.prototype.shift.call( arguments ),
          height = Array.prototype.shift.call( arguments );
      this.render( width, height );
      break;
    case 'cellChange':
      var x = Array.prototype.shift.call( arguments ),
          y = Array.prototype.shift.call( arguments ),
          data = Array.prototype.shift.call( arguments );
      this.updateCell( x, y, data );
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

mapView.updateCell = function ( x, y, data ) {
  var coorAttr = x + ',' + y;
      cell = document.querySelector( '[coordinate="' + coorAttr + '"]' );

  cell.style.backgroundColor = data.color;
};

module.exports = mapView;