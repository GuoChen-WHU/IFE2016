(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function createForm ( container, config ) {

  var fields = [],
      form = document.createElement( 'form' ),
      footer = document.createElement( 'section' ),
      Field, Button,
      onFocusInput, onBlurInput, onSubmitForm, onClearForm;

  /*
   * 字段类
   */
  Field = function ( configMap ) {
    this.label = configMap.label;
    this.type = configMap.type;
    this.name = configMap.name;
    this.validater = configMap.validater;
    this.tips = configMap.tips;
    if ( configMap.relevent ) {
      this.relevent = configMap.relevent;
    }
  };

  /*
   * 初始化字段
   */
  Field.prototype.init = function () {
    this.ele = document.createElement( 'section' );
    this.ele.className = 'field';

    var label = document.createElement( 'label' );
    label.innerText = this.label;
    label.className = 'field-label';

    this.input = document.createElement( 'input' );
    this.input.type = this.type;
    this.input.name = this.name;

    this.note = document.createElement( 'p' );

    this.ele.appendChild( label );
    this.ele.appendChild( this.input );
    this.ele.appendChild( this.note );

    // 绑定事件
    this.input.addEventListener( 'focus', onFocusInput.bind( this ));
    this.input.addEventListener( 'blur', onBlurInput.bind( this ));
  };

  /*
   * 显示提示
   */
  Field.prototype.showTip = function ( type ) {
    this.note.innerText = this.tips[ type ];
    this.note.className = type;
    this.note.style.display = 'block';
  };

  /*
   * 验证字段
   */
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

  /*
   * 字段输入框获得焦点的处理函数
   */
  onFocusInput = function () {
    this.showTip( 'rule' );
  };

  /*
   * 字段输入框失去焦点的处理函数
   */
  onBlurInput = function () {
    this.validate();
  };

  /*
   * 按钮类
   */
  Button = function ( configMap ) {
    this.label = configMap.label;
    this.action = configMap.action;
  };

  /*
   * 按钮的初始化函数
   */
  Button.prototype.init = function () {
    this.ele = document.createElement( 'button' );
    this.ele.innerText = this.label;
    switch ( this.action ) {
      case 'submit':
        this.ele.type = 'submit';
        this.ele.addEventListener( 'click', onSubmitForm );
        break;
      case 'clear':
        this.ele.type = 'button';
        this.ele.addEventListener( 'click', onClearForm );
        break;
    }
  };

  /*
   * 提交表单的处理函数
   */
  onSubmitForm = function ( e ) {
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

  /*
   * 清空表单的处理函数
   */
  onClearForm = function () {
    fields.forEach( function ( field ) {
      field.input.value = '';
      field.note.style.display = 'none';
    });
  };

  config.fields.forEach( function ( item ) {
    var field = new Field( item );
    field.init();
    form.appendChild( field.ele );
    fields.push( field );
  });

  footer.className = "form-footer";
  config.buttons.forEach( function ( item ) {
    var button = new Button( item );
    button.init();
    footer.appendChild( button.ele );
  });
  form.appendChild( footer );

  container.appendChild( form );
};
},{}],2:[function(require,module,exports){
var createForm = require( './form' ),
    container = document.getElementsByClassName( 'container' )[ 0 ],
    configs1 = {
      fields: [
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
          }
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
          }
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
          }
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
          }
        }
      ],
      buttons: [
        {
          label: '注册',
          action: 'submit'
        },
        {
          label: '重新输入',
          action: 'clear'
        }
      ]
    },

    configs2 =  {
      fields: [
        {
          label: '学号',
          type: 'text',
          name: 'id',
          validater: function ( value ) {
            var pattern = /^20[01][0-9]3025900[0-9]{2}$/;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              return pattern.test( value ) ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '请输入有效的学号',
            pass: '学号格式正确',
            fail: '学号格式不正确',
            empty: '学号不能为空'
          }
        },
        {
          label: '密码',
          type: 'password',
          name: 'password',
          validater: function ( value ) {
            var pattern = /^123456$/;
            if ( value.length === 0 ) {
              return 'empty';
            } else {
              return pattern.test( value ) ? 'pass' : 'fail';
            }
          },
          tips: {
            rule: '请输入密码',
            pass: '密码正确',
            fail: '密码不正确',
            empty: '密码不能为空'
          }
        }
      ],
      buttons: [
        {
          label: '登录',
          action: 'submit'
        },
        {
          label: '重新输入',
          action: 'clear'
        }
      ]
    };

createForm( container, configs1 );
createForm( container, configs2 );
},{"./form":1}]},{},[1,2]);
