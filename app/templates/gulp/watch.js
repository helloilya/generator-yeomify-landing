'use strict';

var fs = require('fs'),
	gulp = require('gulp'),
	sync = require('browser-sync'),
	wiredep = require('wiredep').stream,
	config = require('./config');

var $ = require('gulp-load-plugins')();

/**
 *	BrowserSync task
 *	@desc Init BrowserSync
 */

gulp.task('watch:sync', function() {

	sync({
		open: false,
		startPath: '/',
		server: {
			baseDir: config.src,
			index: 'index.html'
		}
	});

});

/**
 *	Styles task
 *	@desc Concatenate css, copy file to temp folder
 *	@todo Add sourcemap
 *	@return
 */

gulp.task('watch:styles', function() {

	if(config.folder.styles && config.css === 'styles') {

		return gulp.src(config.src + config.folder.styles + '/**/*.css')
			.pipe($.plumber())
			.pipe($.concat('style.css'))
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe(sync.reload({
				stream: true
			}));

	}

});

/**
 *	Less task
 *	@desc Concatenate/compress less, copy file to temp folder
 *	@todo Add sourcemaps
 *	@return
 */

gulp.task('watch:less', function() {

	if(config.folder.styles && config.css === 'less') {

		return gulp.src(config.src + config.folder.styles + '/style.less')
			.pipe($.plumber())
			.pipe($.less())
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe(sync.reload({
				stream: true
			}));

	}

});

/**
 *	Sass task
 *	@desc Concatenate/compress sass, copy file to temp folder
 *	@return
 */

gulp.task('watch:sass', function() {

	if(config.folder.styles && config.css === 'sass') {

		return gulp.src(config.src + config.folder.styles + '/**/*.scss')
			.pipe($.plumber())
			.pipe($.rubySass({
				style: 'nested',
				check: true
			}))
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe(sync.reload({
				stream: true
			}));

	}

});

/**
 *	Validation styles task
 *	@extends sass, less, styles
 *	@desc Validate styles with csslint
 *	@todo Remove tmp folder before lint run; Lint config as external file
 *	@return
 */

gulp.task('watch:lintstyles', ['watch:sass', 'watch:less', 'watch:styles'], function() {

	return gulp.src(config.src + config.tmp + '/**/*.css')
		.pipe($.csslint({
			'box-sizing': false,
			'text-indent': false,
			'font-sizes': false,
		}))
		.pipe($.csslint.reporter());

});

/**
 *	Jade task
 *	@desc Compile jade templates
 *	@return
 */

gulp.task('watch:jade', function() {

	if(config.folder.jade) {

		return gulp.src(config.src + config.folder.jade + '/**/[^_]*.jade')
			.pipe($.plumber())
			.pipe($.jade({ pretty: '\t' }))
			.pipe(gulp.dest(config.src))
			.pipe(sync.reload(
				{ stream: true }
			));

	}

});

/**
 *	Bower task
 *	@extends jade
 *	@desc Inject bower dependencies in html
 *	@todo Install bower dependencies before run wiredep task
 *	@return
 */

gulp.task('watch:wiredep', ['watch:jade'], function() {

	if(config.folder.vendors && fs.existsSync(config.src + config.folder.vendors)) {

		return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
			.pipe(wiredep({
				directory: config.src + config.folder.vendors
			}))
			.pipe(gulp.dest(config.src));

	}

});

/**
 *	Scripts task
 *	@desc Validate js files
 */

gulp.task('watch:scripts', function() {

	if(config.folder.scripts) {

		gulp.src(config.src + config.folder.scripts + '/**/*.js')
			.pipe($.plumber())
			.pipe($.jshint())
			.pipe($.jshint.reporter())
			.pipe($.jsvalidate())
			.pipe(sync.reload({
				stream: true
			}));

	}

});

/**
 *	Html task
 *	@desc Validate html files
 */

gulp.task('watch:html', function() {

	gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.plumber())
		.pipe($.htmlhint())
		.pipe($.htmlhint.reporter())
		.pipe(sync.reload({
			stream: true
		}));

});

/**
 *	Inject task
 *	@extends wiredep, lintstyles, jade
 *	@desc Inject js and css files in html
 */

gulp.task('watch:inject', ['watch:wiredep', 'watch:jade', 'watch:lintstyles'], function() {

	var sources = [
		config.src + config.tmp + '/**/*.css'
	];

	if(config.folder.scripts) {
		sources.push(config.src + config.folder.scripts + '/**/*.js');
	}

	var transform = {
		transform: function(filepath, file, i, length) {
			filepath = filepath.slice(filepath.slice(1).indexOf('/') + 2);
			return $.inject.transform.apply($.inject.transform, [filepath, file, i, length]);
		}
	};

	gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(sources), transform))
		.pipe(gulp.dest(config.src));

});

/**
 *	Watch
 *	@extends inject, sync
 *	@desc Run browser sync and watcher for src folder
 *	@todo Show notify when watch is running
 */

gulp.task('watch', ['watch:inject', 'watch:sync'], function() {

	if(config.folder.styles && config.css) {
		gulp.watch(config.src + config.folder.styles + '/**/*.{css,scss,less}', ['watch:lintstyles']);
	}

	if(config.folder.jade) {
		gulp.watch(config.src + config.folder.jade + '/**/*.jade', ['watch:jade']);
	}

	if(config.folder.scripts) {
		gulp.watch(config.src + config.folder.scripts + '/**/*.js', ['watch:scripts']);
	}

	gulp.watch([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'], ['watch:html']);

});