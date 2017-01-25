var robotController = require( './robotController' ),
    util = require( './util' ),
    mapModel = require( './mapModel' ),
    robotModel = require( './robotModel' ),
    commandInput = document.getElementsByClassName( 'console-input' )[ 0 ],
    executeButton = document.getElementsByClassName( 'console-execute' )[ 0 ],
    randomButton = document.getElementsByClassName( 'console-random' )[ 0 ],
    drawButton = document.getElementsByClassName( 'console-draw' )[ 0 ],
    indicator = document.getElementsByClassName( 'row-indicator' )[ 0 ],
    indicatorBody = document.getElementsByClassName( 'indicator-body' )[ 0 ],
    currentRow = 3,
    index = -1,
    errorRows = [],
    commands,
    timer;

commandInput.value = 'MOV RIG\nGO\nTUN RIG';

executeButton.addEventListener( 'click', startExecute);

// 开始执行命令
function startExecute () {
  commands = commandInput.value.split( '\n' );
  resetAll();
  executeLoop();
}

function executeLoop () {
  // 如果有命令需要执行且没有命令正在执行，执行下一条命令
  if ( commands.length && !robotController.executing ) {
    var command = commands.shift();
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
  }
  // 如果还有命令没执行完或者最后一条命令还在执行，继续任务循环
  if ( commands.length || robotController.executing ) {
    timer = setTimeout( executeLoop, 1 );
  } else {
    // 最后一条命令也执行完了
    resetLast();
  }
}

function resetLast () {
  util.removeClass( indicatorBody.children[ index ], 'processing' );
}

function resetAll () {
  index = -1;
  errorRows.forEach( function ( index ) {
    util.removeClass( indicatorBody.children[ index ], 'error' );
  });
  errorRows = [];
}

// 随机修墙
randomButton.addEventListener( 'click', function () {
  // 随机生成一个数组，每个元素是一个坐标
  var coors = randomCoors( 10, 20 );

  // 机器人在的这一格不修
  var current = robotModel.getPosition();
  coors.forEach( function ( coor ) {
    if ( coor[ 0 ] !== current[ 0 ] || coor[ 1 ] !== current[ 1 ] )
      mapModel.setCell( coor, { color: '#f00' } );
  });
});

// 生成min和max之间个数的随机坐标
function randomCoors ( min, max ) {
  var num = Math.floor( min + Math.random() * ( max - min ) ),
      coors = [],
      width = mapModel.getWidth(),
      height = mapModel.getHeight(),
      i,
      x,
      y;

  for ( i = 0; i < num; i++ ) {
    x = Math.round( 1 + Math.random() * ( width - 1 ) );
    y = Math.round( 1 + Math.random() * ( height - 1 ) );
    coors.push( [x, y] );
  }

  return coors;
}

// 画笑脸
drawButton.addEventListener( 'click', function () {
  commandInput.value = 'MOV TO 3 7\n' +
      'BUILD\n' +
      'MOV TO 4 6\n' +
      'BUILD\n' +
      'MOV TO 5 5\n' +
      'BUILD\n' +
      'MOV TO 6 5\n' +
      'BUILD\n' +
      'MOV TO 7 5\n' +
      'BUILD\n' +
      'MOV TO 8 6\n' +
      'BUILD\n' +
      'MOV TO 9 7\n' +
      'BUILD\n' +
      'MOV TO 12 7\n' +
      'BUILD\n' +
      'MOV TO 13 6\n' +
      'BUILD\n' +
      'MOV TO 14 5\n' +
      'BUILD\n' +
      'MOV TO 15 5\n' +
      'BUILD\n' +
      'MOV TO 16 5\n' +
      'BUILD\n' +
      'MOV TO 17 6\n' +
      'BUILD\n' +
      'MOV TO 18 7\n' +
      'BUILD\n' +
      'MOV TO 5 15\n' +
      'BUILD\n' +
      'MOV TO 6 16\n' +
      'BUILD\n' +
      'MOV TO 7 17\n' +
      'BUILD\n' +
      'MOV TO 8 18\n' +
      'BUILD\n' +
      'MOV TO 9 19\n' +
      'BUILD\n' +
      'MOV TO 10 19\n' +
      'BUILD\n' +
      'MOV TO 11 19\n' +
      'BUILD\n' +
      'MOV TO 12 19\n' +
      'BUILD\n' +
      'MOV TO 13 18\n' +
      'BUILD\n' +
      'MOV TO 14 17\n' +
      'BUILD\n' +
      'MOV TO 15 16\n' +
      'BUILD\n' +
      'MOV TO 16 15\n' +
      'BUILD\n';
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