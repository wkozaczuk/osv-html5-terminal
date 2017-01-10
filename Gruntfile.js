module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      library1: {
        src: "node_modules/systemjs/dist/system.js",
        dest: 'dist/systemjs/system.js'
      },
      library2: {
        expand: true,
        cwd: 'node_modules/',
        src: "typescript-collections/**",
        dest: 'dist/'
      },
      html: {
        expand: true,
        src: "index.html",
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks("grunt-ts");

  grunt.registerTask('default', [
    //"ts",
    'copy:*',
    'less:dist'
  ]);
};
