// > Components
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
var zip         = require('gulp-zip');





// > Functions
// >> On Error
var onError = function ( err ) {
	util.beep();
	console.log( err );
};





// >> Get timestamp
var getTimestamp = function(){
	var d = new Date();
	var yy = d.getFullYear().toString().substr(-2);
	var mm = (d.getMonth() + 1).toString();
	var dd = d.getDate().toString();

	if ( mm.length === 1 ) {
		mm =  '0' + mm;
	}

	if ( dd.length === 1 ) {
		dd =  '0' + mmdd
	}

	var t = yy + mm + dd;
	return t;
};





// > Tasks
// >> Copy Images
gulp.task('images', function () {
	return gulp.src(config.images.src)
		.pipe(gulp.dest(config.images.dest))
		.pipe(notify({message: '>> ✔︎ Images', onLast: true}));
});





// >> Process .PUG files into 'dist' folder
gulp.task( 'templates', function() {
	return gulp.src( config.templates.src )
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(data(function(file) {
			delete require.cache[require.resolve(config.settings.src)];
			return require(config.settings.src);
		}))
		.pipe(pug({pretty: '	'}))
		.pipe(gulp.dest(config.templates.dest))
		.pipe(notify({message: 'Templates OK', onLast: true}));
});





// >> Process partials .Pug files into 'dist' folder
gulp.task( 'templatePartials' , function(cb) {
	return gulp.src(config.templates.src)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(data(function(file) {
			delete require.cache[require.resolve(config.settings.src)];
			return require(config.settings.src);
		}))
		.pipe(pug({pretty: '	'}))
		.pipe(gulp.dest(config.templates.dest));
});





// >> Add target attribute to links
gulp.task('targets', function() {
	return gulp.src(config.html.src)
		.pipe(cheerio(function ($, file) {
			$('a').each(function () {
				$(this).attr('target','_blank');
			});
			$('img').each(function(index, el) {
				var newSRC = config.settings.path.local + $(this).attr('src');
				$(this).attr('src', newSRC);
			});
		}))
		.pipe(gulp.dest( config.settings.folders.dest ))
		.pipe(notify({message: 'All your blank targets are belong to us', onLast: true}));
});





// >> Create a development server with BrowserSync
gulp.task('go', ['default'], function () {
	browserSync.init({
		server : {
			baseDir: config.settings.folders.dest
		},
		ghostMode: false,
		online: true
	});
	gulp.watch(config.watch.images, ['bs-reload', ['images']]);
	gulp.watch(config.watch.templates, ['templates']);
	gulp.watch(config.watch.templatePartials, ['templatePartials']);
	gulp.watch(config.watch.html, ['bs-reload']);
});




// >> Generate 'public' folder
gulp.task('default', ['clean'], function (cb) {
	runSequence('templates', ['images','targets'], cb);
});





// >> Delete Public folder
gulp.task('clean', del.bind(null, ['dist']));





// >> Force a browser page reload
gulp.task('bs-reload', function(cb) {
	runSequence('targets', cb);
	browserSync.reload();
});




// >> Compress dist folder into a ZIP file
gulp.task('zip', function() {
	var zipName = getTimestamp() + '-' + config.settings.zipName + '.zip';
	return gulp.src(config.settings.folders.dest + '/**/*.*')
		.pipe(zip(zipName))
		.pipe(gulp.dest(config.settings.folders.deliverables));
});
