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
 *	@return
 */

gulp.task('watch:styles', function() {

	if(config.folder.styles && config.css === 'styles') {

		return gulp.src(config.src + config.folder.styles + '/**/*.css')
			.pipe($.plumber())
			.pipe($.sourcemaps.init())
			.pipe($.concat('style.css'))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Less task
 *	@desc Concatenate/compress less, copy file to temp folder
 *	@return
 */

gulp.task('watch:less', function() {

	if(config.folder.styles && config.css === 'less') {

		return gulp.src(config.src + config.folder.styles + '/style.less')
			.pipe($.plumber())
			.pipe($.sourcemaps.init())
			.pipe($.less())
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

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
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Stylus task
 *	@desc Concatenate/compress stylus, copy file to temp folder
 *	@return
 */

gulp.task('watch:stylus', function() {

	if(config.folder.styles && config.css === 'stylus') {

		return gulp.src(config.src + config.folder.styles + '/style.styl')
			.pipe($.plumber())
			.pipe($.sourcemaps.init())
			.pipe($.stylus())
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Validation styles task
 *	@extends sass, less, styles
 *	@desc Validate styles with csslint
 *	@return
 */

gulp.task('watch:lintstyles', ['watch:sass', 'watch:less', 'watch:stylus', 'watch:styles'], function() {

	return gulp.src(config.src + config.tmp + '/**/*.css')
		.pipe($.csslint('.csslintrc'))
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
			.pipe(gulp.dest(config.src));

	}

});

/**
 *	Bower task
 *	@extends jade
 *	@desc Inject bower dependencies in html
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
			.pipe($.jshint('.jshintrc'))
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
		.pipe($.htmlhint('.htmlhintrc'))
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
		transform: function(filepath, file, i, length, targetFile) {

			var root = config.src.slice(2),
				targetpath = targetFile.path.slice(targetFile.path.indexOf(root) + root.length);

			filepath = filepath.slice(filepath.slice(1).indexOf('/') + 2);

			if(targetpath.indexOf('/') + 1) {
				filepath = '../' + filepath;
			}

			return $.inject.transform.apply($.inject.transform, [filepath, file, i, length, targetFile]);

		}
	};

	return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(sources), transform))
		.pipe(gulp.dest(config.src))
		.pipe(sync.reload(
			{ stream: true }
		));

});

/**
 *	Watch
 *	@extends inject, sync
 *	@desc Run browser sync and watcher for src folder
 */

gulp.task('watch', ['watch:inject', 'watch:sync'], function() {

	if(config.folder.styles && config.css) {
		gulp.watch(config.src + config.folder.styles + '/**/*.{css,scss,less,styl}', ['watch:inject']);
	}

	if(config.folder.jade) {
		gulp.watch(config.src + config.folder.jade + '/**/*.jade', ['watch:inject']);
	}

	if(config.folder.scripts) {
		gulp.watch(config.src + config.folder.scripts + '/**/*.js', ['watch:scripts']);
	}

	gulp.watch([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'], ['watch:html']);

});