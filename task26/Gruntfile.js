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
        tasks: [ 'jshint', 'babel', 'browserify' ],
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
    },

    babel: {
      options: {
        presets: [ 'babel-preset-es2015' ]
      },
      dist: {
        files: {
          'build/js/craft.js': 'src/js/craft.js',
          'build/js/commander.js': 'src/js/commander.js',
          'build/js/mediator.js': 'src/js/mediator.js',
          'build/js/task.js': 'src/js/task.js'
        }
      }
    },

    browserify: {
      dist: {
        files: {
          'build/js/bundle.js': [ 
            'build/js/craft.js', 
            'build/js/commander.js',
            'build/js/mediator.js',
            'build/js/task.js'
          ]
        }
      }
    }

  });

  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-babel' );
  grunt.loadNpmTasks( 'grunt-browserify' );

  grunt.registerTask( 'live', [ 'connect', 'watch' ] );
  grunt.registerTask( 'build', [ 'less', 'jshint' ] );
};