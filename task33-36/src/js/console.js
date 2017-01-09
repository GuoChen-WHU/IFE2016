var robot = require( './robot' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ];

executeButton.addEventListener( 'click', function () {
  switch ( commandInput.value ) {
    case 'GO':
      robot.forward();
      break;
    case 'TUN LEF':
      robot.turn( 'left' );
      break;
    case 'TUN RIG':
      robot.turn( 'right' );
      break;
    case 'TUN BAC':
      robot.turn( 'back' );
      break;
  }
});