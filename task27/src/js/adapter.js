var adapter = function ( data ) {
  var result;

  // 对象指令转二进制指令
  if ( typeof data === 'object' ) {
    result = ( '000' + parseInt( data.id ).toString( 2 )).slice( -4 );
    switch ( data.command ) {
      case 'move':
        result += '0001';
        break;
      case 'stop':
        result += '0010';
        break;
      case 'destroy':
        result += '1100';
        break;
    }
  } 

  // 二进制指令转对象指令
  else if ( typeof data === 'string' ) {
    result = {};
    result.id = parseInt( data.slice( 0, 4 ), 2 );
    switch( data.slice( 4 ) ) {
      case '0001':
        result.command = 'move';
        break;
      case '0010':
        result.command = 'stop';
        break;
      case '1100':
        result.command = 'destroy';
        break;
    }
  }

  return result;
};

export { adapter };