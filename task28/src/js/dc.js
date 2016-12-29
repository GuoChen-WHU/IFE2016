import { adapter } from './adapter.js';
import { shell } from './shell.js';
import { BUS } from './BUS.js';

var dc,
    receiver,
    craftNum = 0,
    handler;

/**
 * 行星上的信号接收器
 */
receiver = function ( binary ) {
  handler( binary );
};

/**
 * 处理接收器传过来的数据
 */
handler = function ( binary ) {
  var data = adapter.toObj( binary );

  if ( data.status === 'destroy' ) {
    shell.monitor.remove( data.id );
    craftNum--;
  } else {
    shell.monitor.update( data );
  }
};

/**
 * 数据处理中心的公共API
 */
dc = {

  getCraftNum: function () {
    return craftNum;
  },

  /**
   * 新建飞船的状态信息
   */
  init: function ( id, dynamicSys, energySys ) {
    var record = {
      id: id,
      dynamicSys: dynamicSys,
      energySys: energySys,
      status: 'stop',
      energy: 100
    };
    craftNum++;
    shell.monitor.add( record );
  }
};

BUS.listen( 'status', receiver );

export { dc };