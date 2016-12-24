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
