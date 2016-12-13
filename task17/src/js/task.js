/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/
(function() {

  // 以下两个函数用于随机模拟生成测试数据
  function getDateStr( dat ) {
    var y = dat.getFullYear();
    var m = dat.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = dat.getDate();
    d = d < 10 ? '0' + d : d;
    return y + '-' + m + '-' + d;
  }

  function randomBuildData(seed) {
    var returnData = {};
    var dat = new Date( "2016-01-01" );
    var datStr = '';
    for (var i = 1; i < 92; i++) {
      datStr = getDateStr(dat);
      returnData[ datStr ] = Math.ceil( Math.random() * seed );
      dat.setDate( dat.getDate() + 1 );
    }
    return returnData;
  }

  var aqiSourceData = {
    "北京": randomBuildData(500),
    "上海": randomBuildData(300),
    "广州": randomBuildData(200),
    "深圳": randomBuildData(100),
    "成都": randomBuildData(300),
    "西安": randomBuildData(500),
    "福州": randomBuildData(100),
    "厦门": randomBuildData(100),
    "沈阳": randomBuildData(500)
  };

  // 用于渲染图表的数据
  var chartData = {};

  // 记录当前页面的表单选项
  var pageState = {
    nowSelectCity: -1,
    nowGraTime: 'day'
  };

  /**
   * 渲染图表
   */
  function renderChart() {
    
    // 获取渲染数据
    var data = chartData[ pageState.nowSelectCity ][ pageState.nowGraTime ],
        chart = document.getElementsByClassName( 'aqi-chart' )[0],

        title,
        item,
        bar,
        level;
      
    // 先把上次画的清空
    chart.innerHTML = '';

    title = document.getElementsByClassName( 'aqi-chart-title' )[0];
    title.innerText = getTitle( data );

    for ( item in data ) {
      if ( data.hasOwnProperty( item )) {
        level = getLevel( data[ item ]);
        bar = document.createElement( 'div' );
        bar.className = 'aqi-chart-bar ' + level;
        bar.title = '时间：' + item + '\naqi：' + data[ item ];
        bar.style.height = Math.round( data[ item ]);
        chart.appendChild( bar );
      }
    }
  }

  /**
   * 获取图标标题
   */
  function getTitle( data ) {
    var graTime = '';

    if ( pageState.nowGraTime === 'day' ) {
      graTime = '每日';
    } else if ( pageState.nowGraTime === 'week' ) {
      graTime = '每周';
    } else if ( pageState.nowGraTime === 'month' ) {
      graTime = '每月';
    }
    
    return pageState.nowSelectCity + '市' + graTime + 
           '空气质量报告'; 
  }

  /**
   * 根据aqi获取污染等级
   */
  function getLevel( value ) {
    var level = '';

    if ( value > 0 && value <= 50 ) { 
      level = 'level1'; 
    } else if ( value > 50 && value <= 100 ) { 
      level = 'level2'; 
    } else if ( value > 100 && value <= 150 ) { 
      level = 'level3'; 
    } else if ( value > 150 && value <= 200 ) { 
      level = 'level4'; 
    } else if ( value > 200 && value <= 300 ) { 
      level = 'level5'; 
    } else if ( value > 300 ) { 
      level = 'level6'; 
    }

    return level;
  }

  /**
   * 日、周、月的radio事件点击时的处理函数
   */
  function graTimeChange() {
    
    // 确定是否选项发生了变化 
    var radios = document.querySelectorAll( '#form-gra-time input'),
        len = radios.length,
        i = 0,
        chosen;

    for ( ; i < len; i++ ) {
      if ( radios[i].checked === true ) {
        chosen = radios[i].value;
        break;
      }
    }

    if ( chosen === pageState.nowGraTime ) {
      return;
    } else {
      // 设置对应数据
      pageState.nowGraTime = chosen;

      // 调用图表渲染函数
      renderChart();
    }
  }

  /**
   * select发生变化时的处理函数
   */
  function citySelectChange() {
    
    // 确定是否选项发生了变化 
    var chosen = document.getElementById( 'city-select' ).value;

    if ( chosen === pageState.nowSelectCity ) {
      return;
    } else {
      // 设置对应数据
      pageState.nowSelectCity = chosen;

      // 调用图表渲染函数
      renderChart();
    }
  }

  /**
   * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
   */
  function initGraTimeForm() {
    var radios = document.querySelectorAll( '#form-gra-time input' ),
        len = radios.length,
        i;

    for ( i = 0; i < len; i++ ) {
      radios[i].addEventListener( 'click', graTimeChange );
    }
  }

  /**
   * 初始化城市Select下拉选择框中的选项
   */
  function initCitySelector() {
    // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
    var citySelect = document.getElementById( 'city-select' ),
        option,
        city;

    for ( city in aqiSourceData ) {
      if ( aqiSourceData.hasOwnProperty( city)) {
        option = document.createElement( 'option' );
        option.innerText = city;
        citySelect.appendChild( option );
      }
    }

    // 设定初始城市为数据第一项对应的城市
    citySelect.value = Object.keys( aqiSourceData )[ 0 ];
    pageState.nowSelectCity = citySelect.value;

    // 给select设置事件，当选项发生变化时调用函数citySelectChange
    citySelect.addEventListener( 'change', citySelectChange );
  }

  /**
   * 初始化图表需要的数据格式
   */
  function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    // 处理好的数据存到 chartData 中
    var city,
        sourceData;

    for ( city in aqiSourceData ) {
      if ( aqiSourceData.hasOwnProperty( city )) {
        sourceData = aqiSourceData[ city ];
        chartData[ city ] = {};
        chartData[ city ].day = sourceData;
        chartData[ city ].week = statisticByWeek( sourceData );
        chartData[ city ].month = statisticByMonth( sourceData );
      }
    }
  }

  /**
   * 按周统计数据
   */
  function statisticByWeek( data ) {
    var date,
        result = {},
        weekStart = '',
        weekEnd = '',
        weekCount = 0,
        weekAvg = 0,
        weekRange = '',
        lastDay = '';

    for ( date in data ) {
      if ( data.hasOwnProperty( date )) {
        if ( weekStart === '' ) {
          weekStart = date;
          weekAvg += data[ date ];
        }
        dif = dateDiff( weekStart, date );
        if ( dif < 7 ) {
          weekCount++;
          weekAvg += data[ date ];
        } else if ( dif === 7 ) {
          weekCount++;
          weekAvg += data[ date ];
          weekAvg = Math.round( weekAvg / weekCount );
          weekEnd = date;
          weekRange = weekStart + '~' + weekEnd;
          result[ weekRange ] = weekAvg;
          weekStart = '';
          weekCount = 0;
          weekAvg = 0;
        } else if ( dif > 7 ) {
          weekEnd = lastDay;
          weekAvg = Math.round( weekAvg / weekCount );
          weekRange = weekStart + '~' + weekEnd;
          result[ weekRange ] = weekAvg;
          weekStart = '';
          weekCount = 0;
          weekAvg = 0;
        }
        lastDay = date;
      }
    }

    return result;
  }

  /**
   * 计算两个日期相差的天数
   */
  function dateDiff( date1, date2 ) {
    var dateOne = new Date( date1 ),
        dateTwo = new Date( date2 );

    return parseInt( Math.abs( dateOne - dateTwo ) / 1000 / 60 / 60/ 24 ) + 1;
  }

  /**
   * 按月统计数据
   */
  function statisticByMonth( data ) {
    var date,
        month,
        monthCount = [],
        monthAvg = [],
        result = {},
        i = 1;

    for (; i < 13; i++ ) {
      monthCount[ i ] = 0;
      monthAvg[ i ] = 0;
    }

    for ( date in data ) {
      if ( data.hasOwnProperty( date )) {
        month = new Date( date ).getMonth() + 1;
        monthCount[ month ] ++;
        monthAvg[ month ] += data[ date ];
      }
    }

    for ( i = 1; i < 13; i++ ) {
      if ( monthCount[ i ] !== 0 ) {
        monthAvg[ i ] = Math.round( monthAvg[i] / monthCount[ i ]);
        result[ i + '月' ] = monthAvg[i];
      }
    }

    return result;
  }
  

  /**
   * 初始化函数
   */
  function init() {
    initGraTimeForm();
    initCitySelector();
    initAqiChartData();
    renderChart();
  }

  init();

})();

