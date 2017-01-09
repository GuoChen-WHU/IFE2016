var map = require( './map' ),
    mapView = require( './mapView' ),
    robot = require( './robot' ),
    robotView = require( './robotView' ),
    container = document.getElementsByClassName( 'container' )[ 0 ];

mapView.init( container );
map.init( 20, 20 );
robotView.init( container );
robot.init();
