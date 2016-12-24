(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _tree = require('./tree.js');

var data = {
  '英超': {
    '切尔西': {
      '阿扎尔': {},
      '科斯塔': {},
      '威廉': {}
    },
    '阿森纳': {
      '桑切斯': {}
    },
    '曼联': {
      '伊布': {}
    }
  }
},
    container = document.getElementById('container');

(0, _tree.initComponent)(container, data);

},{"./tree.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * tree.js
 * tree-view component module for ife2016 task25
*/

//---------------- BEGIN MODULE SCOPE VARIABLES --------------
var
// 组件配置属性
configMap = {
  mainHTML: '<div class="tree" tree-node-id="0"></div>' + '<div class="control">' + '<section>' + '<input id="insert-input" type="text">' + '<button id="insert-button">插入</button>' + '</section>' + '<section>' + '<button id="delete-button">删除</button>' + '</section>' + '<section>' + '<input id="search-input" type="text">' + '<button id="bfs-button">广度优先搜索</button>' + '<button id="dfs-button">深度优先搜索</button>' + '</section>' + '</div>'
},

// 状态变量
stateMap = {
  tranResult: [],
  searchResult: [],
  timer: null,
  currentId: undefined,
  target: '',
  selected: null,
  rootNode: null,
  guid: 0,
  data: null
},

// DOM缓存
DOMMap = {};
//----------------- END MODULE SCOPE VARIABLES ---------------

//------------------- BEGIN UTILITY METHODS ------------------ 
/* 
 * 节点添加Class
 */
function addClass(ele, className) {
  if (ele.className === '') {
    ele.className = className;
  } else {
    ele.className += ' ' + className;
  }
}

/* 
 * 节点移除Class
 */
function removeClass(ele, className) {
  var classNames = ele.className.split(' ');
  if (classNames.indexOf(className) === -1) {
    return;
  }
  if (classNames.length === 1) {
    ele.className = '';
  } else if (classNames.indexOf(className) === 0) {
    ele.className = ele.className.replace(className + ' ', '');
  } else {
    ele.className = ele.className.replace(' ' + className, '');
  }
}

/**
 * 节点是否含有Class
 */
function hasClass(ele, className) {
  return (' ' + ele.className + ' ').indexOf(' ' + className + ' ') > -1;
}

/**
 * 惰性加载的通用事件绑定函数(函数重写jshint过不了...)
 */
/* jshint ignore:start */
function addEvent(ele, type, handler) {
  if (window.addEventListener) {
    addEvent = function addEvent(ele, type, handler) {
      ele.addEventListener(type, handler, false);
    };
  } else if (window.attachEvent) {
    addEvent = function addEvent(ele, type, handler) {
      ele.attachEvent('on' + type, handler);
    };
  } else {
    addEvent = function addEvent(ele, type, handler) {
      ele['on' + type] = handler;
    };
  }

  addEvent(ele, type, handler);
}
/* jshint ignore:end */

/**
 * 广度优先遍历
 */
function bft(node, process) {
  var queue = [],
      current,
      i,
      len;

  if (node) {
    queue.push(node);

    while (queue.length !== 0) {
      current = queue.shift();
      len = current.children.length;
      for (i = 0; i < len; i++) {
        queue.push(current.children[i]);
      }
      // 回调函数可以返回false提前终止遍历
      if (process(current) === false) {
        return;
      }
    }
  }
}

/**
 * 深度优先遍历
 */
function dft(node, process) {
  var stack = [],
      current,
      i,
      len;

  if (node) {
    stack.push(node);

    while (stack.length !== 0) {
      current = stack.pop();

      // child入栈“从后往前”，这样遍历的顺序才是“从前往后”
      len = current.children.length;
      for (i = len - 1; i >= 0; i--) {
        stack.push(current.children[i]);
      }
      if (process(current) === false) {
        return;
      }
    }
  }
}
//-------------------- END UTILITY METHODS -------------------

//--------------------- BEGIN MODEL METHODS ------------------
/**
 * 节点类构造函数
 */
function Node(value, parent) {
  this.id = getId();
  this.value = value;
  this.children = [];
  this.parent = parent;
}

/**
 * 构造节点时，获取guid
 */
function getId() {
  return stateMap.guid++;
}

Node.prototype.insertChild = function (value) {
  var newNode = new Node(value, this);
  this.children.push(newNode);
  return newNode;
};

Node.prototype.deleteChild = function (child) {
  var index = this.children.indexOf(child);
  this.children.splice(index, 1);
};

Node.prototype.destroy = function () {
  this.parent.deleteChild(this);
  this.id = null;
  this.value = null;
  this.children = null;
  this.parent = null;
};

/**
 * 根据JSON数据构造树结构
 */
function initTree() {
  var key, child;

  stateMap.rootNode = new Node('root', null);
  buildAt(stateMap.rootNode, stateMap.data);

  /*
   * 递归辅助函数
   */
  function buildAt(node, data) {
    var key, child;

    for (key in data) {
      if (data.hasOwnProperty(key)) {
        child = node.insertChild(key);
        buildAt(child, data[key]);
      }
    }
  }
}

/** 
 * 遍历时用的处理函数，简单地将节点id加到tranResult数组中
 */
function traverse(node) {
  stateMap.tranResult.push(node.id);
}

/**
 * 搜索时用的处理函数，把节点id加到tranResult中，如果当前节点
 * 是目标节点，把它的id记录在searchResult中。
 */
function search(node) {
  stateMap.tranResult.push(node.id);
  if (node.value === stateMap.target) {
    stateMap.searchResult.push(node.id);
  }
}

/** 
 * 插入时用的处理函数，遇到目标节点时插入子节点
 */
function insert(value, node) {
  if (parseInt(getNodeId(stateMap.selected)) === node.id) {
    node.insertChild(value);
    // 每次都完全重绘，select、match等样式会没掉，效率也低，需要修改
    renderTree();
    return false;
  }
}

/** 
 * 删除时用的处理函数，检查子节点中有没有目标节点，有就删掉
 */
function destroy(node) {
  var selectedId = parseInt(getNodeId(stateMap.selected));
  if (selectedId === node.id) {
    node.destroy();
    // 每次都完全重绘，select、match等样式会没掉，效率也低，需要修改
    renderTree();
    return false;
  }
}

/**
 * 重置状态函数，包括清除定时器、还原节点样式、重置currentId、
 * searchResult、tranResult、target等状态变量的值
 */
function reset() {
  clearInterval(stateMap.timer);
  if (stateMap.currentId) {
    removeClass(getNodeEle(stateMap.currentId), 'current');
    stateMap.currentId = undefined;
  }
  stateMap.searchResult.forEach(function (id) {
    removeClass(getNodeEle(id), 'match');
  });
  stateMap.searchResult = [];
  stateMap.tranResult = [];
  stateMap.target = '';
}
//-------------------- END MODEL HANDLERS --------------------

//--------------------- BEGIN DOM METHODS --------------------
/*
 * 缓存DOM元素
 */
function setDOMMap() {
  DOMMap = {
    treeRoot: document.getElementsByClassName('tree')[0],
    insertInput: document.getElementById('insert-input'),
    insertButton: document.getElementById('insert-button'),
    deleteButton: document.getElementById('delete-button'),
    searchInput: document.getElementById('search-input'),
    bfsButton: document.getElementById('bfs-button'),
    dfsButton: document.getElementById('dfs-button')
  };
}

/**
 * 渲染数据
 */
function renderTree() {
  DOMMap.treeRoot.innerHTML = getChildEleStr(stateMap.rootNode);

  /**
   * 渲染数据辅助递归函数
   */
  function getChildEleStr(node) {
    var str = '';
    node.children.forEach(function (child, index) {
      str += '<div class="node" tree-node-id="' + child.id + '">' + '<span class="arrow">▾</span>' + '<span class="node-value">' + child.value + '</span>' + getChildEleStr(child) + '</div>';
    });
    return str;
  }
}

/**
 * 动画显示结果
 */
function displayResult() {
  stateMap.currentId = stateMap.tranResult.shift();
  addClass(getNodeEle(stateMap.currentId), 'current');

  // 启动定时器，“current节点”每秒往前挪一次
  stateMap.timer = setInterval(function () {
    var lastNode = getNodeEle(stateMap.currentId);
    stateMap.currentId = stateMap.tranResult.shift();
    var currentNode = getNodeEle(stateMap.currentId);

    // 遍历过程中，调整“current节点”
    if (stateMap.currentId !== undefined) {
      // 如果节点被折叠，把它显示出来
      display(currentNode);
      // current节点前移
      addClass(currentNode, 'current');
      removeClass(lastNode, 'current');
      // 如果遇到要搜索的节点，把它标识出来
      if (stateMap.searchResult.indexOf(stateMap.currentId) !== -1) {
        addClass(currentNode, 'match');
      }
    }

    // 遍历结束，清除定时器和current节点；如果有搜索目标且没有
    // 搜索到，弹出提示
    else {
        clearInterval(stateMap.timer);
        removeClass(lastNode, 'current');
        if (stateMap.target !== '' && stateMap.searchResult.length === 0) {
          alert('没有找到指定节点！');
        }
      }
  }, 500);
}

/*
 * 显示节点
 */
function display(nodeEle) {
  if (hasClass(nodeEle.parentNode, 'collapse')) {
    removeClass(nodeEle.parentNode, 'collapse');
  }
}

/*
 * 切换节点的折叠、展开
 */
function toggle(nodeEle) {
  if (hasClass(nodeEle, 'collapse')) {
    removeClass(nodeEle, 'collapse');
  } else {
    addClass(nodeEle, 'collapse');
  }
}

/*
 * 选中节点
 */
function select(nodeEle) {
  // 先把之前的选择去掉
  if (stateMap.selected) {
    removeClass(stateMap.selected, 'select');
  }
  // 如果选的是同一个元素，取消选择；否则切换选择
  if (stateMap.selected === nodeEle) {
    stateMap.selected = undefined;
  } else {
    addClass(nodeEle, 'select');
    stateMap.selected = nodeEle;
  }
}

/**
 * 根据节点id获取对应DOM节点
 */
function getNodeEle(id) {
  return document.querySelector('[tree-node-id="' + id + '"]');
}

/**
 * 根据DOM节点获取对应树节点id
 */
function getNodeId(ele) {
  return ele.getAttribute('tree-node-id');
}
//---------------------- END DOM METHODS ---------------------

//------------------- BEGIN EVENT HANDLERS -------------------
/**
 * 处理点击事件
 */
function handlerClick(e) {

  // 点击树节点或标签节点，都视为选中节点
  if (e.target.getAttribute('tree-node-id') !== null) {
    select(e.target);
    return;
  }
  if (e.target.className === 'node-value') {
    select(e.target.parentNode);
    return;
  }

  // 点击箭头，进行相应节点的展开、折叠
  if (e.target.className === 'arrow') {
    toggle(e.target.parentNode);
    return;
  }
}

/*
 * 处理插入事件
 */
function handlerInsert(e) {
  var node,
      value = DOMMap.insertInput.value.trim();

  if (!stateMap.selected) {
    alert('请单击选择要插入子节点的节点！');
  } else if (value === '') {
    alert('请输入要插入的节点内容！');
  } else {
    // 函数柯里化传入insert第一个参数
    bft(stateMap.rootNode, insert.bind(null, value));
  }
}

/*
 * 处理删除事件
 */
function handlerDelete(e) {
  if (!stateMap.selected) {
    alert('请单击选择要删除的节点！');
  } else {
    bft(stateMap.rootNode, destroy);
    stateMap.selected = null;
  }
}

/*
 * 处理搜索事件
 */
function handlerSearch(e) {
  var tranFunction;

  reset();
  stateMap.target = DOMMap.searchInput.value.trim();

  if (stateMap.target === '') {
    alert('请输入要搜索的节点内容！');
  } else {
    tranFunction = e.target.id === 'bfs-button' ? bft : dft;
    tranFunction(stateMap.rootNode, search);
    displayResult();
  }
}
//-------------------- END EVENT HANDLERS --------------------

//------------------- BEGIN PUBLIC METHODS -------------------
/*
 * 组件初始化函数
 */
function initComponent(container, data) {

  // 先做组件的渲染
  container.innerHTML = configMap.mainHTML;

  // 缓存DOM元素
  setDOMMap();

  // 渲染树结构
  stateMap.data = data;
  initTree();
  renderTree();

  // 绑定事件
  addEvent(DOMMap.treeRoot, 'click', handlerClick);
  addEvent(DOMMap.insertButton, 'click', handlerInsert);
  addEvent(DOMMap.deleteButton, 'click', handlerDelete);
  addEvent(DOMMap.bfsButton, 'click', handlerSearch);
  addEvent(DOMMap.dfsButton, 'click', handlerSearch);
}
//--------------------- END PUBLIC METHODS -------------------

exports.initComponent = initComponent;

},{}]},{},[2,1]);
