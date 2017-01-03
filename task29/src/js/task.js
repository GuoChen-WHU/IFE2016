(function() {
  var text = {
        success: '验证通过',
        fail   : '验证失败'
      },
      button = document.getElementById( 'validate-button' ),
      input = document.getElementsByName( 'name' )[ 0 ],
      result = document.getElementsByClassName( 'result' )[ 0 ],
      validate,
      hasClass, addClass, removeClass;

  button.addEventListener( 'click', function () {
    if ( validate( input.value )) {
      result.innerText = text.success;
      removeClass( result, 'fail' );
      addClass( result, 'success' );
    } else {
      result.innerText = text.fail;
      removeClass( result, 'success' );
      addClass( result, 'fail' );
    }
  });

  validate = function ( value ) {
    var length = 0;
    Array.prototype.forEach.call( value.trim(), 
      function ( char, index, string ) {
        length += string.charCodeAt( index ) < 128 ? 1 : 2;
      }
    );
    return length >= 4 && length <= 16;
  };

  hasClass = function ( ele, className ) {
    return (' ' + ele.className + ' ').indexOf( ' ' + className + ' ' ) != -1;
  };

  addClass = function ( ele, className ) {
    if ( !hasClass( ele, className )) {
      ele.className = (ele.className + ' ' + className).trim();
    }
  };

  removeClass = function( ele, className ) {
    if ( hasClass( ele, className )) {
      ele.className = ele.className.replace( className, '' ).trim();
    }
  };
}());