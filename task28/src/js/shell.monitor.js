/*
 * shell.monitor子模块,负责监视屏的渲染
*/
var mainHTML = 
      '<div class="monitor">' +
        '<table>' +
          '<tbody class="records">' +
            '<tr>' +
              '<th>飞船</th>' +
              '<th>动力系统</th>' +
              '<th>能源系统</th>' +
              '<th>当前飞行状态</th>' +
              '<th>剩余能耗</th>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>',

    jqueryMap,
    addRecord, updateRecord, removeRecord,
    setJqueryMap, initMonitor,
    monitor;

addRecord = function ( record ) {
  var recordHTML = 
        '<tr>' +
          '<td>' + record.id + '号</td>' +
          '<td>' + record.dynamicSys + '</td>' +
          '<td>' + record.energySys + '</td>' +
          '<td class="record-status">' + record.status + '</td>' +
          '<td class="record-energy">' + record.energy + '%</td>' +
        '</tr>',
      $record = $( recordHTML );

  jqueryMap.$records.append( $record );

  // 缓存
  jqueryMap[ '$record' + record.id ] = $record;
  jqueryMap[ '$record-status' + record.id ] = $record.find( '.record-status' );
  jqueryMap[ '$record-energy' + record.id ] = $record.find( '.record-energy' );
};

updateRecord = function ( data ) {
  jqueryMap[ '$record-status' + data.id ].text( data.status );
  jqueryMap[ '$record-energy' + data.id ].text( data.energy + '%' );
};

removeRecord = function ( id ) {
  jqueryMap[ '$record' + id ].remove();

  delete jqueryMap[ '$record' + id ];
  delete jqueryMap[ '$record-status' + id ];
  delete jqueryMap[ '$record-energy' + id ];
};

/**
 * 缓存DOM元素
 */
setJqueryMap = function () {
  jqueryMap = {
    $records: $( '.records' )
  };
};

/**
 * 初始化
 */
initMonitor = function ( $container ) {
  $container.append( mainHTML );
  setJqueryMap();
};

monitor = {
  addRecord: addRecord,
  updateRecord: updateRecord,
  removeRecord: removeRecord
};

module.exports = { 
  initMonitor: initMonitor, 
  monitor: monitor
};