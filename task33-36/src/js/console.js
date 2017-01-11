var robotController = require( './robotController' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ],
    clearButton = document.getElementsByClassName( 'console-clear' )[ 0 ];

commandInput.value = 'MOV RIG\nGO\nGO';

executeButton.addEventListener( 'click', function () {
  var commands = commandInput.value.split( '\n' );
  robotController.handlerExecute( commands );
});

clearButton.addEventListener( 'click', function () {
  commandInput.value = '';
});