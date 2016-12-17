(function() {

  var result, 
      timer, 
      currentIndex, 
      target, 
      targetIndexes;

  /**
   * 广度优先遍历
   */
  function bft( node, process ) {
    var queue = [],
        current,
        child;

    if ( node ) {
      queue.push( node );

      while ( queue.length !== 0 ) {
        current = queue.shift();
        child = current.firstElementChild;
        while ( child !== null ) {
          queue.push( child );
          child = child.nextElementSibling;
        }
        process( current );
      }
    }
  }

  /**
   * 深度优先遍历
   */
  function dft( node, process ) {
    var stack = [],
        current,
        child;

    if ( node ) {
      stack.push( node );

      while ( stack.length !== 0 ) {
        current = stack.pop();

        // child入栈“从后往前”，这样遍历的顺序才是“从前往后”
        child = current.lastElementChild;
        while ( child !== null ) {
          stack.push( child );
          child = child.previousElementSibling;
        }
        process( current );
      }
    }
  }

  /* 
   * 遍历时用的处理函数，简单地将节点加到result数组中
   */
  function traverse( node ) {
    result.push( node );
  }

  /*
   * 搜索时用的处理函数，把节点加到result中，如果当前节点
   * 是目标节点，把它在result中的索引记录下。
   */
  function search( node ) {
    result.push( node );
    if ( node.firstChild.nodeValue.trim() === target ) {
      targetIndexes.push( result.length - 1 );
    }
  }

  /*
   * 动画显示结果
   */
  function displayResult() {
    currentIndex = 0;
    addClass( result[ currentIndex ], 'current' );

    // 启动定时器，“current节点”每秒往前挪一次
    timer = setInterval( function () {
      currentIndex++;

      // 遍历过程中，调整“current节点”；如果遇到要搜索的节点，
      // 也把它标识出来
      if ( currentIndex < result.length ) {
        addClass( result[ currentIndex ], 'current' );
        removeClass( result[ currentIndex - 1 ], 'current' );
        if ( targetIndexes.indexOf( currentIndex ) !== -1 ) {
          addClass( result[ currentIndex ], 'select');
        }
      }

      // 遍历结束，清除定时器和current节点；如果有搜索目标且没有
      // 搜索到，弹出提示
      else {
        clearInterval( timer );
        removeClass( result[ currentIndex - 1 ], 'current' );
        currentIndex = undefined;
        if ( target !== '' && targetIndexes.length === 0 ) {
          alert( '没有找到指定节点！' );
        }
      }
    }, 1000);
  }

  /*
   * 重置状态函数，包括清除定时器、还原节点样式、重置currentIndex、
   * targetIndexes、result、target等状态变量的值
   */
  function reset() {
    clearInterval( timer );
    if ( currentIndex ) {
      removeClass( result[ currentIndex ], 'current' );
      currentIndex = undefined;
    }
    targetIndexes.forEach( function ( targetIndex ) {
      removeClass( result[ targetIndex ], 'select' );
    });
    targetIndexes = [];
    result = [];
    target = '';
  }

  /* 
   * 节点添加Class
   */
  function addClass( ele, className ) {
    if ( ele.className === '' ) {
      ele.className = className;
    } else {
      ele.className += ' ' + className;
    }
  }

  /* 
   * 节点移除Class
   */
  function removeClass( ele, className ) {
    var classNames = ele.className.split( ' ' );
    if ( classNames.indexOf( className ) === -1 ) {
      return;
    }
    if ( classNames.length === 1 ) {
      ele.className = '';
    } else if ( classNames.indexOf( className ) === 0 ) {
      ele.className = ele.className.replace( className + ' ', '' );
    } else {
      ele.className = ele.className.replace( ' ' + className, '' );
    }
  }

  /*
   * 初始化函数，绑定按钮上的事件
   */
  function init() {
    var bftButton = document.getElementById( 'bft-button'),
        dftButton = document.getElementById( 'dft-button' ),
        searchInput = document.getElementById( 'search-input' ),
        bfsButton = document.getElementById( 'bfs-button' ),
        dfsButton = document.getElementById( 'dfs-button' ),
        rootEle = document.getElementsByClassName( 'tree')[ 0 ];

    // 初始化模块内的全局变量
    result = [];
    timer = null;
    target = '';
    targetIndexes = [];

    bftButton.addEventListener( 'click', function () {
      reset();
      bft( rootEle.firstElementChild, traverse );
      displayResult();
    });

    dftButton.addEventListener( 'click', function () {
      reset();
      dft( rootEle.firstElementChild, traverse );
      displayResult();
    });

    bfsButton.addEventListener( 'click', function () {
      reset();
      target = searchInput.value.trim();
      bft( rootEle.firstElementChild, search );
      displayResult();
    });
    
    dfsButton.addEventListener( 'click', function () {
      reset();
      target = searchInput.value.trim();
      dft( rootEle.firstElementChild, search );
      displayResult();
    });  
  }

  init();

}( document ));