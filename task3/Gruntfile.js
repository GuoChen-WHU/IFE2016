'use strict';

module.exports = function( grunt ) {

  // LiveReload的默认端口号
  var lrPort = 35729;
  // 使用connect-livereload模块，生成一个LiveReload脚本
  // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
  var lrSnippet = require('connect-livereload')({ port: lrPort });

  var lrMiddleware = function(connect, options) {
    return [
      // 把脚本，注入到静态文件中
      lrSnippet,
      // 静态文件服务器的路径
      connect.static(options.base[0]),
      // 启用目录浏览
      connect.directory(options.base[0])
    ];
  };

  grunt.initConfig({

    // 通过connect任务，创建一个静态服务器
    connect: {
      options: {
        // 服务器端口号
        port: 8000,
        // 服务器地址(可以使用主机名localhost，也能使用IP)
        hostname: 'localhost',
        // 物理路径(默认为. 即根目录) 
        base: '.'
      },
      livereload: {
        options: {
          // 通过LiveReload脚本，让页面重新加载。
          middleware: lrMiddleware
        }
      }
    },

    watch: {
      livereload: {
        options: {
          livereload: lrPort
        },
        files: [ 
          'css/**/*.css',
          './index.html' 
        ]
      },
      
      build_css: {
        tasks: ['less'],
        files: ['css/src/*.less']
      }
    },

    less: {
      compile: {
        files: {
          'css/build/compiled.css': 'css/src/*.less'
        }
      }
    }

  });

  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-connect');
  grunt.loadNpmTasks( 'grunt-contrib-less');

  grunt.registerTask( 'live', [ 'connect', 'watch' ] );
  grunt.registerTask( 'build', [ 'less' ] );
};