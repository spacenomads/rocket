var browserSync = require('browser-sync');
var cheerio     = require('gulp-cheerio');
var config      = require('./config.json');
var data        = require('gulp-data');
var del         = require('del');
var gulp        = require('gulp');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
var pug         = require('gulp-pug');
var rename      = require('gulp-rename');
var runSequence = require('run-sequence');
var util        = require('gulp-util');



var development_folder = '_dev',
		parts_folder = 'parts',
		distribution_folder = 'dist';





var onError = function ( err ) {
	util.beep();
	console.log( err );
};





// > Process .PUG files into 'public' folder
gulp.task( 'templates', function() {
	return gulp.src( config.templates.src )
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	  .pipe(data(function(file) {
      delete require.cache[require.resolve(config.settings.src)];
      return require(config.settings.src);
    }))
    .pipe( pug({}))
		.pipe(gulp.dest(config.templates.dest))
		.pipe(notify({message: 'Templates OK', onLast: true}));
});





// > Process partials .Pug files into 'public' folder
gulp.task( 'templatePartials' , function(cb) {
	return gulp.src(config.templates.src)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(data(function(file) {
      delete require.cache[require.resolve(config.settings.src)];
      return require(config.settings.src);
    }))
		.pipe(pug({}))
		.pipe(gulp.dest(config.templates.dest));
});






gulp.task('targets', function() {
	console.log( 'All your blank targets are belong to us' );
	return gulp.src([ config.html.src ])
    .pipe(cheerio(function ($, file) {
      $('a').each(function () {
        $( this ).attr('target','_blank');
      });
    }))
    .pipe(gulp.dest( config.folders.dest ));
});





// > Create a development server with BrowserSync
gulp.task('go', ['default'], function () {
	browserSync.init({
		server : {
			baseDir: config.folders.dest
		},
		ghostMode: false,
		online: true
	});
	gulp.watch(config.watch.images, ['bs-reload', ['images']]);
	gulp.watch(config.watch.templates, ['templates']);
	gulp.watch(config.watch.templatePartials, ['templatePartials']);
	gulp.watch(config.watch.html, ['bs-reload']);
});




// > Generate 'public' folder
gulp.task('default', ['clean'], function (cb) {
	runSequence('templates', ['images'], cb);
});





// > Delete Public folder
gulp.task('clean', del.bind(null, [config.folders.dest]));





// > Force a browser page reload
gulp.task('bs-reload', function () {
	browserSync.reload();
});
