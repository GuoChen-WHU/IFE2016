/*
 * 数据中心模块
*/
import { adapter } from './adapter.js';
import { monitor } from './shell.monitor.js';
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
    monitor.removeRecord( data.id );
    craftNum--;
  } else {
    monitor.updateRecord( data );
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
    monitor.addRecord( record );
  }
};

BUS.listen( 'status', receiver );

export { dc };