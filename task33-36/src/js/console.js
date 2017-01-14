var robotController = require( './robotController' ),
    util = require( './util' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ],
    clearButton = document.getElementsByClassName( 'console-clear' )[ 0 ],
    indicator = document.getElementsByClassName( 'row-indicator' )[ 0 ],
    indicatorBody = document.getElementsByClassName( 'indicator-body' )[ 0 ],
    currentRow = 3,
    executeNext,
    index = -1,
    resetLast,
    resetAll,
    errorRows = [],
    commands;

commandInput.value = 'MOV RIG\nGO\nGO';

executeButton.addEventListener( 'click', function () {
  commands = commandInput.value.split( '\n' );
  resetAll();
  executeNext();
});

executeNext = function () {
  var command = commands.shift().trim();
  // 前一行的高亮去掉
  if ( index >= 0 ) {
    util.removeClass( indicatorBody.children[ index ], 'processing' );
  }
  index++;
  // 当前行号高亮
  util.addClass( indicatorBody.children[ index ], 'processing' );
  // robotController处理命令
  if ( !robotController.handlerCommand( command ) ) {
    util.addClass( indicatorBody.children[ index ], 'error' );
    errorRows.push( index );
  }
  if ( commands.length ) {
    setTimeout( executeNext, 1000 );
  } else {
    setTimeout( resetLast, 1000 );
  }
};

resetLast = function () {
  util.removeClass( indicatorBody.children[ index ], 'processing' );
};

resetAll = function () {
  index = -1;
  errorRows.forEach( function ( index ) {
    util.removeClass( indicatorBody.children[ index ], 'error' );
  });
};

clearButton.addEventListener( 'click', function () {
  commandInput.value = '';
});

commandInput.addEventListener( 'scroll', function ( e ) {
  indicator.scrollTop = e.target.scrollTop;
});

commandInput.addEventListener( 'keyup', function ( e ) {
  var rowNum = e.target.value.split( '\n' ).length,
      diff = rowNum - currentRow,
      i,
      row;

  if ( diff === 0 ) return;
  else if ( diff > 0 ) {
    for ( i = 0; i < diff; i++ ) {
      row = document.createElement( 'tr' );
      row.innerHTML = '<td>' + ( currentRow + 1 ) + '</td>';
      indicatorBody.appendChild( row );
      currentRow++;
    }
  } else {
    for ( i = 0; i < -diff; i++ ) {
      indicatorBody.removeChild( indicatorBody.lastElementChild );
      currentRow--;
    }
  }
  
});