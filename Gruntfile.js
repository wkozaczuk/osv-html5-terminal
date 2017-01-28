module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      default : {
        tsconfig: true
      }
    },
    copy: {
      library1: {
        src: "node_modules/systemjs/dist/system.js",
        dest: 'dist/systemjs/system.js'
      },
      library2: {
        src: "node_modules/systemjs/dist/system.js.map",
        dest: 'dist/systemjs/system.js.map'
      },
      library3: {
        expand: true,
        cwd: 'node_modules/',
        src: "typescript-collections/**",
        dest: 'dist/'
      },
      other: {
        expand: true,
        src: ["index.html","commands.json"],
        dest: 'dist'
      }
    },
    less: {
      dist: {
        options: {
          paths: [
            'src/less'
          ],
          cleancss: true
        },
        files: {
          'dist/css/osv.css': 'css/less/main.less'
        }
      }
    },
    connect: {
        server: {
            options: {
                port: 8001,
                hostname: '*',
                base: 'dist',
                keepalive: true
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', [
    "ts",
    'copy:*',
    'less:dist'
  ]);
};
