(function() {
  var queueEle = document.getElementById( 'queue' ),
      leftIn = document.getElementById( 'left-in' ),
      leftOut = document.getElementById( 'left-out' ),
      rightIn = document.getElementById( 'right-in' ),
      rightOut = document.getElementById( 'right-out' ),
      input = document.getElementById( 'input' ),
      searchInput = document.getElementById( 'search-input'),
      searchButton = document.getElementById( 'search-button' ),

  queue = (function ( queueEle ) {
    var items = [],
        getItems,
        leftIn, leftOut, rightIn, rightOut, deleteItem,
        searchItem, refresh;

    getItems = function ( str ) {
      var pattern = new RegExp( '[\\s,，、]+', 'g' );
      return str.trim().split( pattern );
    };
    
    leftIn = function ( value ) {
      var inputs = getItems( value ),
          len = inputs.length,
          i;
      
      for ( i = len - 1; i >= 0; i-- ) {
        items.unshift( inputs[ i ]);
      }
      
      refresh();
    };

    leftOut = function () {
      if ( items.length === 0 ) {
        alert( '队列为空！' );
        return;
      }
      items.shift();
      refresh();
    };

    rightIn = function ( value ) {
      var inputs = getItems( value );
      inputs.forEach( function ( input, index ) {
        items.push( input );
      });
      refresh();
    };

    rightOut = function () {
      if ( items.length === 0 ) {
        alert( '队列为空！' );
        return;
      }
      items.pop();
      refresh();
    };

    deleteItem = function ( ele ) {
      var index = ele.getAttribute( 'data-order' );

      if ( items[ index ] !== undefined ) {
        items.splice( index, 1 );
        refresh();
      }
    };

    refresh = function () {
      // DOM元素上加上order，这样单击删除的时候才能和数组内的元素对应
      var itemEles = items.map( function ( item, index ) {
        return '<li class="queue-item" data-order="' + 
               index + '">' + item + '</li>';
      });

      queueEle.innerHTML = itemEles.join( '' );
    };

    searchItem = function ( value ) {
      var itemEles = items.map( function ( item, index ) {
        var itemContent = item.replace( new RegExp( value, 'g' ), 
            '<span class="select">' + value + '</span>');
        return '<li class="queue-item" data-order="' + 
               index + '">' + itemContent + '</li>';
      });

      queueEle.innerHTML = itemEles.join( '' );
    };

    return {
      leftIn: leftIn,
      leftOut: leftOut,
      rightIn: rightIn,
      rightOut: rightOut,
      deleteItem: deleteItem,
      searchItem: searchItem
    };
  })( queueEle );

  leftIn.addEventListener( 'click', function () {
    queue.leftIn( input.value );    
  });

  leftOut.addEventListener( 'click', function () {
    queue.leftOut();
  });

  rightIn.addEventListener( 'click', function () {
    queue.rightIn( input.value );    
  });

  rightOut.addEventListener( 'click', function () {
    queue.rightOut();
  });

  searchButton.addEventListener( 'click', function () {
    var value = searchInput.value.trim();
    if ( value !== '' ) {
      queue.searchItem( value );
    } else {
      alert( '请输入查询字符!' );
    }
  });


  // 队列元素的点击事件委托到队列上执行
  queueEle.addEventListener( 'click', function ( e ) {
    if ( e.target.className === 'queue-item' ) {
      queue.deleteItem( e.target );
    }
  });

}());