module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      dist: {
        options: {
          paths: [
            'src/less'
          ],
          cleancss: true
        },
        files: {
          'css/osv.css': 'css/less/main.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', [
    'less:dist'
  ]);
};
