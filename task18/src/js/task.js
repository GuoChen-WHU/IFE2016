(function() {
  var queueEle = document.getElementById( 'queue' ),
      leftIn = document.getElementById( 'left-in' ),
      leftOut = document.getElementById( 'left-out' ),
      rightIn = document.getElementById( 'right-in' ),
      rightOut = document.getElementById( 'right-out' );

  leftIn.addEventListener( 'click', function () {
    var value = parseInt( document.getElementById( 'input' ).value ),
        newItem;

    if ( validate( value ) ) {
      newItem = document.createElement( 'li' );
      newItem.className = 'queue-item';
      newItem.innerHTML = value;
      queueEle.insertBefore( newItem, queueEle.childNodes[ 0 ]);
    } else {
      alert( '请输入合法数字！');
    }
  });

  leftOut.addEventListener( 'click', function () {
    var len = queueEle.childNodes.length, 
        i;

    // 遍历childNodes，移除第一个li元素
    for ( i = 0; i < len; i++ ) {
      if ( queueEle.childNodes[ i ].nodeType === 1 ) {
        queueEle.removeChild( queueEle.childNodes[ i ]);
        return;    
      }
    }

    // 没有遍历到，说明没有队列元素了
    alert( '队列中没有元素了！' );
  });

  rightIn.addEventListener( 'click', function () {
    var value = parseInt( document.getElementById( 'input' ).value ),
        newItem;

    if ( validate( value ) ) {
      newItem = document.createElement( 'li' );
      newItem.className = 'queue-item';
      newItem.innerHTML = value;
      queueEle.appendChild( newItem );
    } else {
      alert( '请输入合法数字！');
    }
  });

  rightOut.addEventListener( 'click', function () {
    var len = queueEle.childNodes.length, 
        i;

    // 反向遍历childNodes，移除第一个li元素
    for ( i = len - 1; i >= 0; i-- ) {
      if ( queueEle.childNodes[ i ].nodeType === 1 ) {
        queueEle.removeChild( queueEle.childNodes[ i ]);
        return;    
      }
    }

    // 没有遍历到，说明没有队列元素了
    alert( '队列中没有元素了！' );
  });

  // 队列元素的点击事件委托到队列上执行
  queueEle.addEventListener( 'click', function ( e ) {
    if ( e.target.className === 'queue-item' ) {
      queueEle.removeChild( e.target );
    }
  });

  // 判断是不是数字
  function validate( value ) {
    return value === +value;
  }

}());