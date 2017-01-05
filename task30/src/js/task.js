(function() {
  var form = document.getElementsByTagName( 'form' )[ 0 ],
      configs = [
        {
          label: '名称',
          type: 'text',
          name: 'name',
          validater: function ( value ) {
            var length = 0;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              Array.prototype.forEach.call( value, 
                function ( char, index, string ) {
                  length += string.charCodeAt( index ) < 128 ? 1 : 2;
                }
              );
              return length >= 4 && length <= 16 ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '必填，长度为4-16个字符',
            pass: '名称可用',
            fail: '名称不可用',
            empty: '名称不能为空'
          },
          parent: form
        },
        {
          label: '密码',
          type: 'password',
          name: 'password',
          validater: function ( value ) {
            var pattern = /\w/;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              return value.length >= 6 && value.length <= 16 &&
                Array.prototype.every.call( value, 
                  function ( char ) {
                    return char.match( pattern );
                  }
                ) ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '必填，长度为6-16个字符，可以包括数字、字母和下划线',
            pass: '密码可用',
            fail: '密码不可用',
            empty: '密码不能为空'
          },
          parent: form
        },
        {
          label: '密码确认',
          type: 'password',
          name: 'password-again',
          validater: function ( value, relevent ) {
            var pattern = /\w/;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              return value === relevent ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '再次输入相同密码',
            pass: '密码输入一致',
            fail: '密码输入不一致',
            empty: '密码不能为空'
          },
          parent: form,
          relevent: 'password'
        },
        {
          label: '邮箱',
          type: 'email',
          name: 'email',
          validater: function ( value ) {
            var pattern = /\w+@\w+\.com/;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              return pattern.test( value ) ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '请输入有效的邮箱',
            pass: '邮箱格式正确',
            fail: '邮箱格式错误',
            empty: '邮箱不能为空'
          },
          parent: form
        },
        {
          label: '手机号',
          type: 'text',
          name: 'phone',
          validater: function ( value ) {
            var pattern = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0-9])\d{8}$/;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              return pattern.test( value ) ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '请输入有效的手机号',
            pass: '手机号格式正确',
            fail: '手机号格式错误',
            empty: '手机号不能为空'
          },
          parent: form
        }
      ],
      fields = [],
      Field,
      onFocusInput, onBlurInput;

  Field = function ( configMap ) {
    this.label = configMap.label;
    this.type = configMap.type;
    this.name = configMap.name;
    this.validater = configMap.validater;
    this.tips = configMap.tips;
    this.parent = configMap.parent;
    if ( configMap.relevent ) {
      this.relevent = configMap.relevent;
    }
  };

  Field.prototype.init = function () {
    this.ele = document.createElement( 'section' );
    this.ele.className = 'field';

    var label = document.createElement( 'label' );
    label.innerText = this.label + ' ';

    this.input = document.createElement( 'input' );
    this.input.type = this.type;
    this.input.name = this.name;
    label.appendChild( this.input );
    this.ele.appendChild( label );

    this.note = document.createElement( 'p' );
    this.ele.appendChild( this.note );

    this.parent.appendChild( this.ele );

    // 绑定事件
    this.input.addEventListener( 'focus', onFocusInput.bind( this ));
    this.input.addEventListener( 'blur', onBlurInput.bind( this ));
  };

  Field.prototype.showTip = function ( type ) {
    this.note.innerText = this.tips[ type ];
    this.note.className = type;
  };

  Field.prototype.validate = function () {
    var i, result, releventValue;

    // 如果设置了关联字段
    if ( this.relevent ) {
      for ( i = 0; i < fields.length; i++ ) {
        if ( fields[ i ].name === this.relevent ) {
          releventValue = fields[ i ].input.value.trim();
          break;
        }
      }
    }

    result = this.validater( this.input.value.trim(), releventValue );
    this.showTip( result );
    return result === 'pass';
  };

  onFocusInput = function () {
    this.showTip( 'rule' );
  };

  onBlurInput = function () {
    this.validate();
  };

  onClickButton = function ( e ) {
    var pass = true;
    e.preventDefault();

    // 这里不能用every，否则遇到验证不通过的，遍历就终止了，
    // 就不能检测所有字段了
    fields.forEach( function ( field ) {
      if ( !field.validate() ) {
        pass = false;
      }
    });
    return pass ? alert( '提交成功.' ) : alert( '输入有误！' );
  };

  configs.forEach( function ( item ) {
    var field = new Field( item );
    field.init();
    fields.push( field );
  });

  var button = document.createElement( 'button' );
  button.innerText = '提交';
  form.appendChild( button );

  button.addEventListener( 'click', onClickButton );
}());