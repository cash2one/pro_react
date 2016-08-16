module.exports = function(grunt){
	grunt.initConfig({
	 	cachebreaker: {
			dev: {
				options: {
					match: ['.js'],
					replacement: 'time',
					position: 'append'
				},
				files: {
					src: ['./dist/**/*.html']
				}
			}
		},
		concat: {
			base: {  
				src: [  
					"www/js/lib/jquery.js",  
					"www/js/lib/jquery_rest.js",  
					"www/js/plu/highcharts.js",
					"www/js/paths.conf.js"
				],  
				dest: "dist/js/gzip/concat.js"  
			}
			// mods: {  
			// 	src: [  
			// 		"www/js/lib/react.min.js",  
			// 		"www/js/lib/react-dom.min.js"
			// 	],  
			// 	dest: "dist/js/gzip/mods.min.js"  
			// } 
		},  
		uglify: {
			build: {
				src: 'www/js/lib/require.js',
				dest: 'dist/js/gzip/require.min.js'
				// src: ['www/js/lib/*.js'],
				// dest: ['dist/js/lib/*.js']
			}
		},
		cssmin: {
			target: {
				files: {
					'dist/css/style.css':'dist/css/style.css'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-cache-breaker');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');  
	// grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.registerTask('default', ['concat']);
}