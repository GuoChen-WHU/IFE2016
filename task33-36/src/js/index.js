var mapModel = require( './mapModel' ),
    mapView = require( './mapView' ),
    robotModel = require( './robotModel' ),
    robotView = require( './robotView' ),
    container = document.getElementsByClassName( 'container' )[ 0 ];

mapView.init( container );
mapModel.init( 20, 20 );
robotView.init( container );
robotModel.init( 2, 2, 'top' );
