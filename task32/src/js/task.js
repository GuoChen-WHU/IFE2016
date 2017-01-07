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