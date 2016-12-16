(function() {
  var tagInput = document.getElementById( 'tag-input' ),
      tagQueueEle = document.getElementById( 'tag-queue' ),
      hobbyInput = document.getElementById( 'hobby-input' ),
      hobbyButton = document.getElementById( 'hobby-button'),
      hobbyQueueEle = document.getElementById( 'hobby-queue' ),
      tagQueue, hobbyQueue;

  tagQueue = {
    init: function ( rootEle, input ) {
      this.items = [];
      this.rootEle = rootEle;
      this.input = input;

      // 绑定事件
      this.input.addEventListener( 'keydown', this.handlerInput.bind( this ));
      this.rootEle.addEventListener( 'click', this.handlerClick.bind( this ) );
    },

    insertItem: function ( value ) {
      var item = value.trim();
      if ( item !== '' && this.items.indexOf( item ) === -1 ) {
        this.items.push( item );
      } else {
        return;
      }
      if ( this.items.length > 10 ) {
        this.items.shift();
      }
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
    },

    handlerInput: function ( e ) {
      var value = e.target.value;
      if ( e.keyCode === 32 || e.keyCode === 188 || e.keyCode === 13 ) {
        this.insertItem( value );
        e.target.value = '';
        e.preventDefault();
      }
    },

    handlerClick: function ( e ) {
      if ( e.target.className === 'queue-item' ) {
        this.deleteItem( e.target );
      }
    }

  };
  tagQueue.init( tagQueueEle, tagInput );

  // hobby队列的功能都委托给tagQueue
  // 添加自己的init和handlerInput逻辑
  hobbyQueue = Object.create( tagQueue );
  hobbyQueue.init = function ( rootEle, input, inputButton ) {
    this.items = [];
    this.rootEle = rootEle;
    this.input = input;
    this.inputButton = inputButton;

    this.inputButton.addEventListener( 'click', this.handlerInput.bind( this ));
  };
  hobbyQueue.getItems = function ( str ) {
    var pattern = new RegExp( '[\\s,，、]+', 'g' );
    return str.trim().split( pattern );
  };

  hobbyQueue.handlerInput = function ( e ) {
    var value = this.input.value,
        items = this.getItems( value );

    items.map( function ( item, index ) {
      this.insertItem( item );
    }.bind( this ));
  };
  hobbyQueue.init( hobbyQueueEle, hobbyInput, hobbyButton );

}());