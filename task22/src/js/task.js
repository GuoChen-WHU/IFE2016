(function() {

  var inorderButton = document.getElementById( 'inorder-button' ),
      preorderButton = document.getElementById( 'preorder-button'),
      postorderButton = document.getElementById( 'postorder-button'),
      rootEle = document.getElementsByClassName( 'tree')[ 0 ],
      result = [],
      timer = null;

  function inOrder( node, process ) {
    if ( node ) {
      if ( node.firstElementChild !== null ) {
        inOrder( node.firstElementChild, process );
      }

      process( node );

      if ( node.lastElementChild !== null ) {
        inOrder( node.lastElementChild, process );
      }
    }
  }

  function preOrder( node, process ) {
    if ( node ) {
      process( node );

      if ( node.firstElementChild !== null ) {
        preOrder( node.firstElementChild, process );
      }

      if ( node.lastElementChild !== null ) {
        preOrder( node.lastElementChild, process );
      }
    }
  }

  function postOrder( node, process ) {
    if ( node ) {
      if ( node.firstElementChild !== null ) {
        postOrder( node.firstElementChild, process );
      }

      if ( node.lastElementChild !== null ) {
        postOrder( node.lastElementChild, process );
      }

      process( node );
    }
  }

  function addToResult( node ) {
    result.push( node );
  }

  function displayResult() {
    var i = 0;

    addClass( result[ i ], 'current' );
    timer = setInterval( function () {
      i++;
      if ( i < result.length ) {
        addClass( result[ i ], 'current' );
        removeClass( result[ i - 1 ], 'current' );
      } else {
        clearInterval( timer );
        removeClass( result[ i - 1 ], 'current' );
      }
    }, 1000);
  }

  function reset() {
    clearInterval( timer );
    result = [];
  }

  function addClass( ele, className ) {
    if ( ele.className === '' ) {
      ele.className = className;
    } else {
      ele.className += ' ' + className;
    }
  }

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

  inorderButton.addEventListener( 'click', function () {
    reset();
    inOrder( rootEle.firstElementChild, addToResult );
    displayResult();
  });
  preorderButton.addEventListener( 'click', function () {
    reset();
    preOrder( rootEle.firstElementChild, addToResult );
    displayResult();
  });
  postorderButton.addEventListener( 'click', function () {
    reset();
    postOrder( rootEle.firstElementChild, addToResult );
    displayResult();
  });

}( document ));