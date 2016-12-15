(function() {
  var tagInput = document.getElementById( 'tag-input' ),
      tagQueueEle = document.getElementById( 'tag-queue' ),
      interestInput = document.getElementById( 'interest-input' ),
      interestButton = document.getElementById( 'interest-button'),
      interestQueueEle = document.getElementById( 'interest-queue' ),
      tagQueue, interestQueue;

  tagQueue = {
    items: [],
    rootEle: tagQueueEle,

    getItems: function ( str ) {
      var pattern = new RegExp( '[\\s,，、]+', 'g' );
      return str.trim().split( pattern );
    },

    insertItem: function ( value ) {
      var inputs = this.getItems( value );
      
      inputs.map( function ( item, index ) {
        if ( item !== '' && this.items.indexOf( item ) === -1 ) {
          this.items.push( item );
        }
        if ( this.items.length > 10 ) {
          this.items.shift();
        }
      }.bind( this ));
      this.refresh();
    },

    deleteItem: function ( ele ) {
      var index = ele.getAttribute( 'data-order' );

      if ( this.items[ index ] !== undefined ) {
        this.items.splice( index, 1 );
        this.refresh();
      }
    },

    refresh: function () {
      // DOM元素上加上order，这样单击删除的时候才能和数组内的元素对应
      var itemEles = this.items.map( function ( item, index ) {
        return '<li class="queue-item" data-order="' + 
               index + '">' + item + '</li>';
      });

      this.rootEle.innerHTML = itemEles.join( '' );
    }

  };

  tagInput.addEventListener( 'keydown', function ( e ) {
    var value = e.target.value;
    if ( e.keyCode === 32 || e.keyCode === 188 || e.keyCode === 13 ) {
      tagQueue.insertItem( value );
      e.target.value = '';
      e.preventDefault();
    }
  });

  // 单击删除事件
  tagQueueEle.addEventListener( 'click', function ( e ) {
    if ( e.target.className === 'queue-item' ) {
      tagQueue.deleteItem( e.target );
    }
  });

  // interest队列的功能都委托给tagQueue
  interestQueue = Object.create( tagQueue );
  interestQueue.items = [];
  interestQueue.rootEle = interestQueueEle;
  interestButton.addEventListener( 'click', function ( e ) {
    var value = interestInput.value;
    interestQueue.insertItem( value );
  });

}());