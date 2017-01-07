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