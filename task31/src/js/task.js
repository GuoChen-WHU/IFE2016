(function() {
  var data = {
        '北京': [
          '北京大学',
          '清华大学',
          '北京航空航天大学'
        ],
        '上海': [
          '复旦大学',
          '上海交通大学',
          '同济大学'
        ],
        '武汉': [
          '武汉大学',
          '华中科技大学',
          '华中师范大学'
        ]
      },
      tabs = document.getElementsByClassName( 'tab' ),
      tabContents = document.getElementsByClassName( 'tab-content' ),
      initSelect,
      hasClass, addClass, removeClass, toggleClass;

  [].forEach.call( tabs, function ( tab, index ) {
    tab.addEventListener( 'click', function () {
      var checked = tab.firstElementChild.checked;
      if ( checked ) {
        toggleClass( tabContents[ index ], 'show', 'hide' );
        [].forEach.call( tabContents, function ( tabContent, order, tabContents ) {
          if ( order !== index ) {
            toggleClass( tabContent, 'hide', 'show' );
          }
        });
      } 
    });
  });

  initSelect = function () {
    var select1 = document.getElementsByClassName( 'select1' )[ 0 ],
        select2 = document.getElementsByClassName( 'select2' )[ 0 ],
        option1,
        option2,
        option1Ele,
        option2Eles = {},
        isFirst = true;

    // select1的选项先填好
    for ( option1 in data ) {
      if ( data.hasOwnProperty( option1 )) {
        option1Ele = document.createElement( 'option' );
        option1Ele.innerText = option1;
        select1.appendChild( option1Ele );

        // select1的option对应的select2中的option先把DOM元素建好，
        // 放在optionsEles里面
        data[ option1 ].forEach( function ( option ) {
          var option2Ele = document.createElement( 'option' );
          option2Ele.innerText = option;
          if ( !option2Eles[ option1 ] ) {
            option2Eles[ option1 ] = [];
          }
          option2Eles[ option1 ].push( option2Ele );
        });

        // 第一个option1对应的option2都填好
        if ( isFirst ) {
          option2Eles[ option1 ].forEach( function ( optionEle ) {
            select2.appendChild( optionEle );
          });
          isFirst = false;
        }
      }
    }

    select1.addEventListener( 'change', function ( e ) {
      select2.innerHTML = '';
      option2Eles[ select1.options[ select1.selectedIndex ].text ].forEach( function ( ele ) {
        select2.appendChild( ele );
      });
    });

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
    if ( hasClass( ele, className ) ) {
      ele.className =
        (' ' + ele.className + ' ').replace( ' ' + className + ' ', ' ' ).trim();
    }
  };

  toggleClass = function ( ele, attach, remove ) {
    // 如果只传进一个字符串
    if ( Object.prototype.toString.call( attach ) === '[object String]' )
    {
      addClass( ele, attach );
    } else if (  Object.prototype.ToString.call( attach ) === '[object Array]' ) {
      attach.forEach( function ( item ) {
        addClass( ele, item );
      });
    }
    if ( Object.prototype.toString.call( remove ) === '[object String]' )
    {
      removeClass( ele, remove );
    } else if (  Object.prototype.ToString.call( remove ) === '[object Array]' ) {
      remove.forEach( function ( item ) {
        removeClass( ele, item );
      });
    }
  };

  initSelect();
}());