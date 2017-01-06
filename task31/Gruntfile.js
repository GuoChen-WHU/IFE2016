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
          'src/**/*.js',
          './index.html'
        ]
      },
      
      build_css: {
        tasks: [ 'less' ],
        files: [ 'src/less/*.less' ]
      },

      build_js: {
        tasks: [ 'jshint' ],
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
      options: {
        esversion: 6
      },
      files: [ 'src/js/**.js' ]
    }

  });

  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );

  grunt.registerTask( 'live', [ 'connect', 'watch' ] );
  grunt.registerTask( 'build', [ 'less', 'jshint' ] );
};