var
		cheerio      = require( 'gulp-cheerio' ),
		data         = require( 'gulp-data' ),
		file_include = require( 'gulp-file-include' ),
		gulp         = require( 'gulp' ),
		gutil        = require( 'gulp-util' ),
		livereload   = require( 'gulp-livereload' ),
		notify       = require( 'gulp-notify' ),
		plumber      = require( 'gulp-plumber' ),
		template     = require( 'gulp-template' );



var development_folder = '_dev',
		parts_folder = 'parts',
		distribution_folder = 'dist';

var onError = function ( err ) {
	gutil.beep();
	console.log( err );
};

gulp.task( 'deploy', function() {
	console.log( 'let\'s deploy this' );
	return gulp.src([ development_folder + '/*.html' ])
		.pipe(file_include({
			prefix: '@@',
			basepath: development_folder + '/' +parts_folder + '/'
	}))
	.pipe(gulp.dest( distribution_folder + '/'));
});

gulp.task( 'template', ['deploy'], function() {
	return gulp.src( distribution_folder +'/*.html' )
	  .pipe(data(function(file) {
      var json = './' + development_folder + '/' + parts_folder + '/settings.json';
      delete require.cache[require.resolve(json)];
      return require(json);
    }))
    .pipe( template() )
	  .pipe( gulp.dest( distribution_folder + '/' ) );
});

gulp.task('targets', ['template'], function() {
	console.log( 'All your blank targets belong to us' );
	return gulp.src([ distribution_folder + '/*.html' ])
    .pipe(cheerio(function ($, file) {
      $('a').each(function () {
        $( this ).attr('target','_blank');
      });
    }))
    .pipe(gulp.dest( distribution_folder + '/' ));
});

gulp.task('watch', function(){
	livereload.listen();
	gulp.watch( development_folder + '/**/*.html', [ 'deploy', 'template', 'targets' ] );
});

gulp.task('default', ['watch']);