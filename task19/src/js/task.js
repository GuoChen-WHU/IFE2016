(function() {
  var queueEle = document.getElementById( 'queue' ),
      leftIn = document.getElementById( 'left-in' ),
      leftOut = document.getElementById( 'left-out' ),
      rightIn = document.getElementById( 'right-in' ),
      rightOut = document.getElementById( 'right-out' ),
      randomInsert = document.getElementById( 'random-insert' ),
      insertSort = document.getElementById( 'insert-sort' ),
      queue;

  queue = (function ( queueEle ) {
    var nums = [],
        leftIn, leftOut, rightIn, rightOut, refresh, randomInsert,
        insertSort;
    
    leftIn = function ( value ) {
      if ( nums.length > 60 ) {
        alert( '队列元素过多！' );
        return;
      }
      nums.unshift( value );
      refresh( nums );
    };

    leftOut = function () {
      if ( nums.length === 0 ) {
        alert( '队列为空！' );
        return;
      }
      nums.shift();
      refresh( nums );
    };

    rightIn = function ( value ) {
      if ( nums.length > 60 ) {
        alert( '队列元素过多！' );
        return;
      }
      nums.push( value );
      refresh( nums );
    };

    rightOut = function () {
      if ( nums.length === 0 ) {
        alert( '队列为空！' );
        return;
      }
      nums.pop();
      refresh( nums );
    };

    refresh = function ( nums ) {
      var items = nums.map( function ( item, index ) {
        return '<li class="queue-item" title="' + item + 
               '" style="height:' + item * 2 + 'px"></li>';
      });

      queueEle.innerHTML = items.join( '' );
    };

    insertSort = function () {
      var i,
          j,
          key;

      for ( j = 1; j < nums.length; j++ ) {
        key = nums[ j ];
        i = j - 1;
        while ( i >= 0 && nums[ i ] > key ) {
          nums[ i + 1 ] = nums[ i ];
          i--;
        }
        nums[ i + 1 ] = key;
        (function ( nums ) {
          
          // 在闭包内保留一份nums的副本
          var copy = [],
              i;
          for ( i = 0; i < nums.length; i++ ) {
            copy[ i ] = nums[ i ];
          }

          setTimeout( function () {
            refresh( copy );
          }, j * 1000 );
        }( nums ));
      }
    };

    randomInsert = function () {
      var i = 0;
      for ( ; i < 10; i++ ) {
        nums[ i ] = Math.round( Math.random() * 90 + 10 );
      }
      refresh( nums );
    };

    return {
      leftIn: leftIn,
      leftOut: leftOut,
      rightIn: rightIn,
      rightOut: rightOut,
      insertSort: insertSort,
      randomInsert: randomInsert
    };
  })( queueEle );

  leftIn.addEventListener( 'click', function () {
    var value = parseInt( document.getElementById( 'input' ).value );

    if ( validate( value ) ) {
      queue.leftIn( value );
    } else {
      alert( '请输入0-100内的合法数字！');
    }
  });

  leftOut.addEventListener( 'click', function () {
    queue.leftOut();
  });

  rightIn.addEventListener( 'click', function () {
    var value = parseInt( document.getElementById( 'input' ).value );

    if ( validate( value ) ) {
      queue.rightIn( value );
    } else {
      alert( '请输入0-100内的合法数字！');
    }
  });

  rightOut.addEventListener( 'click', function () {
    queue.rightOut();
  });

  // 队列元素的点击事件委托到队列上执行
  queueEle.addEventListener( 'click', function ( e ) {
    if ( e.target.className === 'queue-item' ) {
      queueEle.removeChild( e.target );
    }
  });

  // 判断数字是否合法
  function validate( value ) {
    return value >= 10 && value <= 100;
  }

  randomInsert.addEventListener( 'click', function () {
    queue.randomInsert();
  });

  insertSort.addEventListener( 'click', function () {
    queue.insertSort();
  });

}());