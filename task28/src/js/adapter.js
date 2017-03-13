function toBinary ( data ) {
  // 前四位飞船编号，先在前面加3个0，加上转成的二进制数后在取后四位，
  // 可以达到在前面补0到4位的效果
  var result = ( '000' + parseInt( data.id ).toString( 2 )).slice( -4 );

  // 中间四位命令或状态
  switch ( data.command || data.status ) {
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
  // 如果有能源百分比，加到后八位
  if ( data.energy ) {
    result += ( '0000000' + parseInt( data.energy ).toString( 2 )).slice( -8 );
  }

  return result;
}

function toObj ( binary ) {
  var result = {},
      type;

  result.id = parseInt( binary.slice( 0, 4 ), 2 );

  type = binary.length === 8 ? 'command' : 'status';

  switch( binary.slice( 4, 8 ) ) {
    case '0001':
      result[ type ] = 'move';
      break;
    case '0010':
      result[ type ] = 'stop';
      break;
    case '1100':
      result[ type ] = 'destroy';
      break;
  }
  if ( type === 'status' ) {
    result.energy = parseInt( binary.slice( 8 ), 2 );
  }

  return result;
}

module.exports = {
  toBinary: toBinary,
  toObj   : toObj
};