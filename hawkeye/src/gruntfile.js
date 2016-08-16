
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
		}
	});

	grunt.loadNpmTasks('grunt-cache-breaker');
	grunt.registerTask('default', ['cachebreaker'])
}