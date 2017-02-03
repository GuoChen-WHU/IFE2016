var robotController = require( './robotController' ),
    util = require( './util' ),
    mapModel = require( './mapModel' ),
    robotModel = require( './robotModel' );

/**
 * 显示行号的侧栏
 */
var indicator = {
  /**
   * 当前执行的命令行号
   */
  current: 0,
  /**
   * 执行出错的行号
   */
  errors: [],

  ele: document.getElementsByClassName( 'indicator' )[ 0 ],

  /**
   * 开始执行某一行命令
   * @param {number} index
   */
  startProcessing: function ( index ) {
    util.addClass( this.ele.rows[ index ], 'processing' );
  },

  /**
   * 结束执行某一行命令
   * @param {number} index
   */
  endProcessing: function ( index ) {
    util.removeClass( this.ele.rows[ index ], 'processing' );
  },

  /**
   * 设置当前执行的命令行
   * @param {number} index
   */  
  setCurrent: function ( index ) {
    this.endProcessing( this.current );
    this.current = index;
    this.startProcessing( this.current );
    console.input.scrollTop = index * 16;
  },

  /**
   * 标记某一行出错
   * @param {number} index
   */
  setError: function ( index ) {
    util.addClass( this.ele.rows[ index ], 'error' );
    this.errors.push( index );
  },

  /**
   * 添加若干行号
   * @param {number} num
   */
  addRows: function ( num ) {
    var i,
        row;
    num = num || 1;

    for ( i = 0; i < num; i++ ) {
      row = this.ele.insertRow();
      row.innerHTML = '<td>' + this.ele.rows.length + '</td>';
    }
  },

  /**
   * 移除若干行号
   * @param {number} num
   */
  removeRows: function ( num ) {
    var i;
    num = num || 1;

    for ( i = 0; i < num; i++ ) {
      this.ele.deleteRow( -1 );
    }
  },

  /**
   * 设置有多少个行号
   * @param {number} num
   */
  setRows: function ( num ) {
    var now = this.ele.rows.length,
        diff = num - now;

    if ( diff === 0 ) return;
    return diff > 0 ? this.addRows( diff ) : this.removeRows( -diff );
  },

  /**
   * 重置当前执行行、出错行等状态
   */
  reset: function () {
    util.removeClass( this.ele.rows[ this.current ], 'processing' );
    this.errors.forEach( function ( index ) {
      util.removeClass( this.ele.rows[ index ], 'error' );
    });
    this.current = 0;
    this.errors = [];
  }
};

/**
 * 控制台对象
 */
var console = {
  indicator: indicator,
  input: document.getElementsByClassName( 'console-input' )[ 0 ],

  commands: [],
  /**
   * 当前执行的命令在commands中的索引
   */
  commandIndex: -1,

  init: function () {

    this.input.value = 'MOV RIG\nGO\nTUN RIG';
    this.input.addEventListener( 'input', this.onInput.bind( this ));
    this.input.addEventListener( 'scroll', this.onScroll.bind( this ));

    var executeBtn = document.getElementsByClassName( 'console-execute' )[ 0 ],
        randomBtn = document.getElementsByClassName( 'console-random' )[ 0 ],
        drawBtn = document.getElementsByClassName( 'console-draw' )[ 0 ];

    executeBtn.addEventListener( 'click', this.onExecute.bind( this ));
    randomBtn.addEventListener( 'click', this.onRandomBuild.bind( this ));
    drawBtn.addEventListener( 'click', this.onDraw.bind( this ));
  },

  /**
   * 执行命令
   */
  onExecute: function () {
    this.reset();
    this.commands = this.input.value.split( '\n' );
    this.executeLoop();
  },

  /**
   * input有输入时，调整行号的显示
   */
  onInput: function () {
    var num = this.input.value.split( '\n' ).length;
    this.indicator.setRows( num );
  },

  /**
   * input滑动时，相应滑动行号
   */
  onScroll: function ( e ) {
    this.indicator.ele.scrollTop = e.target.scrollTop;
  },

  /**
   * 随机生成墙，避开机器人所在的一格
   */
  onRandomBuild: function () {
    // 随机生成一个数组，每个元素是一个坐标
    var coors = randomCoors( 10, 20 );

    // 机器人在的这一格不修
    var current = robotModel.getPosition();
    coors.forEach( function ( coor ) {
      if ( coor[ 0 ] !== current[ 0 ] || coor[ 1 ] !== current[ 1 ] )
        mapModel.setCell( coor, { color: '#f00' } );
    });
  },

  /**
   * 画笑脸
   */
  onDraw: function () {
    // 直接改变input.value不会触发input事件，只好直接调用onInput方法
    this.input.value = smileCommands;
    this.onInput();
    this.onExecute();
  },

  /**
   * 执行命令循环
   */
  executeLoop: function () {

    // 如果有命令需要执行且没有命令正在执行，执行下一条命令
    if ( this.commands.length && !robotController.executing ) {
      var command = this.commands.shift();
      this.commandIndex++;

      // 当前行号高亮
      this.indicator.setCurrent( this.commandIndex );
      
      // robotController处理命令
      if ( !robotController.handlerCommand( command ) ) {
        this.indicator.setError( this.commandIndex );
      }
    }

    // 如果还有命令没执行完或者最后一条命令还在执行，继续任务循环
    if ( this.commands.length || robotController.executing ) {
      setTimeout( this.executeLoop.bind( this ), 1 );
    } else {
      
      // 最后一条命令也执行完了
      this.indicator.endProcessing( this.commandIndex );
    }
  },

  /**
   * 重置状态
   */
  reset: function () {
    this.commands = [];
    this.commandIndex = -1;
    this.indicator.reset();
  }
};

/**
 * 生成min和max之间个数的随机坐标
 * @param {number} min
 * @param {number} max
 */
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

/**
 * 生成笑脸的命令
 */
var smileCommands = 'MOV TO 3 7\n' +
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
      'BUILD';

console.init();