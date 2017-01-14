// 观察者模式实现
//----------------

/**
 * 目标类
 */
function Subject() {
  this.observers = [];
}

/**
 * 添加观察者
 *
 * @param { Observer } observer
 */
Subject.prototype.addObserver = function ( observer ) {
  this.observers.push( observer );
};

/**
 * 移除观察者
 *
 * @param { Observer } observer
 */
Subject.prototype.removeObserver = function ( observer ) {
  var index = this.observers.indexOf( observer );
  
  return index > -1 ? this.observers.slice( index, 1 ) : null;
};

/**
 * 通知观察者
 *
 * @param arguments
 */
Subject.prototype.notify = function () {
  var args = arguments;
  this.observers.forEach( function ( observer ) {
    observer.update.apply( observer, args );
  });
};

/**
 * 观察者类
 */
function Observer () {
}

/**
 * 更新观察者
 *
 * @param { Object } context
 */
Observer.prototype.update = function ( context ) {
  throw 'Update method not instanced!';
};

/**
 * 扩展对象
 *
 * @param { Object } obj
 * @param { Object } extension
 */
function extend( obj, extension ) {
  var key;
  for ( key in obj ) {
    extension[ key ] = obj[ key ];
  }
}

function hasClass ( ele, className ) {
  return (' ' + ele.className + ' ').indexOf( ' ' + className + ' ' ) != -1;
}

function addClass ( ele, className ) {
  if ( !hasClass( ele, className )) {
    ele.className = (ele.className + ' ' + className).trim();
  }
}

function removeClass ( ele, className ) {
  if ( hasClass( ele, className )) {
    ele.className = ele.className.replace( className, '' ).trim();
  }
}

module.exports = {
  Subject: Subject,
  Observer: Observer,
  extend: extend,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass
};