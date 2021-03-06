'use strict';

module.exports = function( grunt ) {

  var lrPort = 35729;
  var lrSnippet = require( 'connect-livereload' )({ port: lrPort });

  var lrMiddleware = function( connect, options ) {
    return [
      lrSnippet,
      connect.static( options.base[0] ),
      connect.directory( options.base[0] )
    ];
  };

  grunt.initConfig({

    connect: {
      options: {
        port: 8000,
        hostname: 'localhost',
        base: '.'
      },
      livereload: {
        options: {
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
          'build/**/*.css',
          'build/**/*.js',
          './index.html'
        ]
      },
      
      build_css: {
        tasks: [ 'less' ],
        files: [ 'src/less/*.less' ]
      },

      build_js: {
        tasks: [ 'jshint', 'browserify' ],
        files: [ 'src/js/*.js' ]
      }
    },

    less: {
      compile: {
        files: {
          'build/css/compiled.css': 'src/less/*.less'
        }
      }
    },

    jshint: {
      files: [ 'src/js/**.js' ]
    },

    browserify: {
      dist: {
        files: {
          'build/js/bundle.js': [
            'src/js/craft.js', 
            'src/js/commander.js',
            'src/js/BUS.js',
            'src/js/shell.js',
            'src/js/shell.console.js',
            'src/js/shell.monitor.js',
            'src/js/adapter.js',
            'src/js/dc.js',
            'src/js/task.js'
          ]
        }
      }
    }

  });

  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-browserify' );

  grunt.registerTask( 'live', [ 'connect', 'watch' ] );
  grunt.registerTask( 'build', [ 'less', 'jshint', 'browserify' ] );
};