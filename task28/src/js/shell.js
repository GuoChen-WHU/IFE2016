/*
 * shell模块,负责主界面的渲染
*/
var globalEvent = require('./globalEvent.js');

var initConsole = require('./shell.console.js').initConsole;
var initMonitor = require('./shell.monitor.js').initMonitor;
var commander = require('./commander.js');

var mainHTML = 
      '<div class="shell">' + 
        '<div class="universe">' +
          '<div class="planet"></div>' +
        '</div>' +
        '<div class="panel">' +
          '<section>' +
            '<p>动力系统选择：</p>' +
            '<label class="option">' +
              '<input type="radio" name="dynSys" value="FORWARD">' +
              '前进号(速率30px/s, 能耗5%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="dynSys" value="GALLOP">' +
              '奔腾号(速率50px/s, 能耗7%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="dynSys" value="SURPASS">' +
              '超越号(速率80px/s, 能耗9%/s)' +
            '</label>' +
          '</section>' +
          '<section>' +
            '<p>能源系统选择：</p>' +
            '<label class="option">' +
              '<input type="radio" name="eneSys" value="POWER">' +
              '劲量型(补充能源速度2%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="eneSys" value="LIGHT">' +
              '光能型(补充能源速度3%/s)' +
            '</label>' +
            '<label class="option">' +
              '<input type="radio" name="eneSys" value="FOREVER">' +
              '永久型(补充能源速度4%/s)' +
            '</label>' +
          '</section>' +
          '<section>' +
            '<button class="control-button" data-command="create">创建新飞船</button>' +
          '</section>' +
        '</div>' +
      '</div>',
    jqueryMap, dynSysChosen, eneSysChosen,
    createCraft, moveCraft, changeEnergy, destroyCraft,
    setJqueryMap,
    getDegree, setDegree,
    handleClick,
    shell, init;

/**
 * 创建飞船和相应的按钮
 */
createCraft = function ( id, track ) {

  // 飞船本身的html
  var html = 
        '<div class="craft track' + track + '" id="craft' + id + '">' +
          '<div class="craft-body">' +
            id + '号 <span class="energy">100</span>%' +
          '</div>' +
          '<div class="craft-head"></div>' +
        '</div>',
      $craft = $( html );

  jqueryMap.$universe.append( $craft );

  // 缓存
  jqueryMap[ '$craft' + id ] = $craft;
  jqueryMap[ '$energy' + id ] = $craft.find( '.energy' );

  // 面板上对应控制按钮的html
  var controlHtml = 
        '<div class="controls" id="controls' + id + '">' +
          '<span>对' + id + '号飞船下达命令：</span>' +
          '<button class="control-button" data-target="' + id + '" data-command="move">开始飞行</button>' +
          '<button class="control-button" data-target="' + id + '" data-command="stop">停止飞行</button>' +
          '<button class="control-button" data-target="' + id + '" data-command="destroy">销毁</button>' +
        '</div>',
      $control = $( controlHtml );

  jqueryMap.$panel.append( $control );

  // 缓存
  jqueryMap[ '$control' + id ] = $control;
};

/**
 * 移动飞船
 */
moveCraft = function ( id, diff ) {
  var deg = getDegree( jqueryMap[ '$craft' + id ]) + diff;
  setDegree( jqueryMap[ '$craft' + id ], deg );
};

/**
 * 获取元素的tranform属性rotate中的角度值
 */
getDegree = function ( $ele ) {
  var ele = $ele[ 0 ],
      pattern = /\(([\d.]+)d/;

  // 第一次获取transform的时候，把transform设成rotate0
  if ( ele.style.transform === '' ) {
    setDegree( $ele, 0 );
    return 0;
  }
  return parseFloat( pattern.exec( ele.style.transform )[ 1 ]);
};

/**
 * 设置元素的tranform属性rotate中的角度值
 */
setDegree = function ( $ele, value ) {
  $ele[ 0 ].style.transform = 'rotate(' + value + 'deg)';
};

/**
 * 改变飞船的电量显示
 */
changeEnergy = function ( id, energy ) {
  jqueryMap[ '$energy' + id ].text( energy.toFixed( 1 ));
};

/**
 * 删除飞船和相应按钮
 */
destroyCraft = function ( id ) {
  jqueryMap[ '$craft' + id ].remove();
  jqueryMap[ '$control' + id ].remove();

  // 删除缓存
  delete jqueryMap[ '$craft' + id ];
  delete jqueryMap[ '$energy' + id ];
  delete jqueryMap[ '$control' + id ];
};

/**
 * 初始化界面
 */
init = function ( $container ) {
  $container.append( mainHTML );
  setJqueryMap();

  // 初始化子模块
  initMonitor( jqueryMap.$shell );
  initConsole( jqueryMap.$shell );

  // 按钮点击事件都委托给panel处理
  jqueryMap.$panel.bind( 'click', handleClick );

  // 订阅飞船状态事件
  globalEvent.subscribe('create', createCraft);
  globalEvent.subscribe('move', moveCraft);
  globalEvent.subscribe('energyChange', changeEnergy);
  globalEvent.subscribe('destroy', destroyCraft);
};

/**
 * 缓存jQuery元素
 */
setJqueryMap = function () {
  var $shell = $( '.shell' );

  jqueryMap = {
    $shell: $shell,
    $universe: $shell.find( '.universe' ),
    $panel: $shell.find( '.panel' ),
    $monitor: $shell.find( '.records' )
  };
};

/**
 * 处理按钮点击事件
 */
handleClick = function ( e ) {
  if ( e.target.className === 'control-button' ) {
    switch ( e.target.getAttribute( 'data-command' )) {
      case 'create':
        if ( dynSysChosen && eneSysChosen ) {
          commander.create( dynSysChosen, eneSysChosen );
        } else {
          addMessage({
            type: 'warning',
            content: 'Please choose dynamic and energy system first!'
          });
        }
        break;
      case 'move':
        commander.move( parseInt( e.target.getAttribute( 'data-target' )));
        break;
      case 'stop':
        commander.stop( parseInt( e.target.getAttribute( 'data-target' )));
        break;
      case 'destroy':
        commander.destroy( parseInt( e.target.getAttribute( 'data-target' )));
        break;
    }
  } else if ( e.target.getAttribute( 'name' ) === 'dynSys' ) {
    dynSysChosen = e.target.value;
  } else if ( e.target.getAttribute( 'name' ) === 'eneSys' ) {
    eneSysChosen = e.target.value;
  }
};

module.exports = { 
  init: init 
};