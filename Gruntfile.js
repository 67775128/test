module.exports = function (grunt) {
    'use strict';
    var date = new Date();
    var dateFormat = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate()
        + '_' + date.getHours() + date.getMinutes() + date.getSeconds();
    var envs = ['uat','dev','prod'];
    var targetPrefix = envs.indexOf(grunt.option('target')) > -1 ? '.'+grunt.option('target'): '';
    // Project configuration.
    grunt.initConfig({
        clean: ["dist"],
        copy: {
            html: {
                src: 'app/index.html',
                dest: 'dist/index.html'
            },
            assets: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: ['views/**', 'images/**', 'fonts/**', 'i18n/**'],
                    dest: 'dist/'
                }, {
                    expand: true,
                    cwd: 'app/bower_components/font-awesome',
                    src: ['fonts/**'],
                    dest: 'dist/'
                }]
            },
            config: {
                src: 'app/scripts/config.env'+targetPrefix+'.js',
                dest: 'dist/scripts/config.env.js'
            }
        },
        /*rev: {
         files: {
         src: ['dist/!**!/!*.js', 'dist/!**!/!*.css']
         }
         },*/
        useminPrepare: {
            html: 'app/index.html'
        },
        usemin: {
            html: 'dist/index.html',
            options: {
                assetsDirs: ['dist/scripts', 'dist/styles']
            }
        },
        uglify: {
            options: {
                report: 'min',
                mangle: false
            }
        },
        cssmin: {
            options: {
                processImport: false
            }
        },
        cachebreaker: {
            dev: {
                options: {
                    match: ['.min.js', '.env.js', '.min.css', 'favicon.ico'],
                    replacement: function () {
                        return dateFormat;
                    }
                },
                files: {
                    src: ['dist/index.html']
                }
            }
        },
        less: {
            theme: {
                options: {
                    sourceMap: true,
                    sourceMapFilename: "app/styles/theme.css.map",
                    sourceMapURL: "theme.css.map"
                },
                files: {
                    "app/styles/theme.css": "app/less/theme.less",
                }
            },
            app: {
                options: {
                    sourceMap: true,
                    sourceMapFilename: "app/styles/app.css.map",
                    sourceMapURL: "app.css.map"
                },
                files: {
                    "app/styles/app.css": "app/less/app.less",
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            css: {
                files: [
                    "app/styles/theme.css",
                    "app/styles/app.css"
                ],
                tasks: []
            },
            html: {
                files: ['app/views/**/*.html'],
                tasks: []
            },
            js: {
                files: ['app/scripts/config.router.ui.js'],
                tasks: []
            },
            less: {
                options: {
                    livereload: false,
                },
                files: "app/less/*",
                tasks: ["less"]
            }
        },
        connect: {
            prod_ui: {
                options: {
                    base: 'dist/',
                    keepalive: true,
                    middleware: function (connect, options, middlewares) {
                        middlewares.unshift(require('connect-livereload')());
                        return middlewares;
                    }
                }
            },
            ui: {
                options: {
                    base: 'app/',
                    keepalive: true,
                    middleware: function (connect, options, middlewares) {
                        middlewares.unshift(require('connect-livereload')());
                        return middlewares;
                    }
                }
            },
            api: {
                options: {
                    keepalive: true,
                    port: 5001,
                    middleware: function (connect, options, middlewares) {
                        // inject a custom middleware
                        middlewares.unshift(function (req, res, next) {
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', '*');
                            //a console.log('foo') here is helpful to see if it runs
                            return next();
                        });

                        return middlewares;
                    }
                }
            }
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-cache-breaker');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // for development purpose
    grunt.registerTask('dev', ['connect']);

    grunt.registerTask('build', [
        'clean',
        'copy:html',
        'copy:config',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'usemin',
        'cachebreaker',
        'copy:assets'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);

};
