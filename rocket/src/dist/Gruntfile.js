module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

  cachebreaker: {
      dev: {
        options: {
          match: ['.js','.css'],
          replacement: 'time',
          position: 'append'
        },
        files: {
          src: ['./**/*.html']
        }
      }
    }
// cachebreaker: {

//     dev: {
//         options: {
//             match: ['style.css','css/style.css'],
//         },
//         files: {
//             src: ['test.html',"about.html"]
//         }
//     }
// }
	
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-cache-breaker');
  grunt.registerTask('default', ['cachebreaker']);
};
