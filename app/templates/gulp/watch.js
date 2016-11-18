'use strict';

var fs = require('fs'),
	gulp = require('gulp'),
	sync = require('browser-sync'),
	wiredep = require('wiredep').stream,
	config = require('./config');

var $ = require('gulp-load-plugins')();

/**
 *	Transform paths function
 *	@desc Update paths before insert css and js into html file
 */

function transformPaths() {

	return {
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

}

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
 *	Css task
 *	@desc Concatenate css, copy file to temp folder, validate css
 *	@return
 */

gulp.task('watch:css', function() {

	if(config.folder.styles && config.csstype === 'css') {

		return gulp.src(config.src + config.folder.styles + '/**/*.css')
			.pipe($.plumber())
			.pipe($.csslint('.csslintrc'))
			.pipe($.csslint.reporter())
			.pipe($.sourcemaps.init())
			.pipe($.concat('style.css'))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Less task
 *	@desc Concatenate/compress less, copy file to temp folder, validate less
 *	@return
 */

gulp.task('watch:less', function() {

	if(config.folder.styles && config.csstype === 'less') {

		return gulp.src(config.src + config.folder.styles + '/**/*.less')
			.pipe($.plumber())
			.pipe($.lesshint('.lesshintrc'))
			.pipe($.lesshint.reporter())
			.pipe($.filter('style.less'))
			.pipe($.sourcemaps.init())
			.pipe($.less())
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Sass task
 *	@desc Concatenate/compress sass, copy file to temp folder, validate sass
 *	@return
 */

gulp.task('watch:sass', function() {

	if(config.folder.styles && config.csstype === 'sass') {

		return gulp.src(config.src + config.folder.styles + '/**/*.scss')
			.pipe($.plumber())
			.pipe($.sassLint())
			.pipe($.sassLint.format())
			.pipe($.filter('style.scss'))
			.pipe($.sourcemaps.init())
			.pipe($.sass({
				outputStyle: 'expanded'
			}))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Stylus task
 *	@desc Concatenate/compress stylus, copy file to temp folder, validate stylus
 *	@return
 */

gulp.task('watch:stylus', function() {

	if(config.folder.styles && config.csstype === 'stylus') {

		return gulp.src(config.src + config.folder.styles + '/**/*.styl')
			.pipe($.plumber())
			.pipe($.stylint({
				config: '.stylintrc'
			}))
			.pipe($.stylint.reporter())
			.pipe($.filter('style.styl'))
			.pipe($.sourcemaps.init())
			.pipe($.stylus())
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Reload styles task
 *	@extends css, sass, less, stylus
 *	@desc Compile styles, run sync reload
 */

gulp.task('watch:reloadstyles', ['watch:css', 'watch:sass', 'watch:less', 'watch:stylus'], function() {

	gulp.src(config.src + config.tmp + '/**/*.css')
		.pipe($.plumber())
		.pipe(sync.reload({
			stream: true
		}));

});

/**
 *	Pug task
 *	@desc Compile pug templates
 *	@return
 */

gulp.task('watch:pug', function() {

	if(config.folder.pug) {

		return gulp.src(config.src + config.folder.pug + '/**/[^_]*.pug')
			.pipe($.plumber())
			.pipe($.pugLint('.puglintrc'))
			.pipe($.pug({ pretty: '\t' }))
			.pipe(gulp.dest(config.src));

	}

});

/**
 *	Reload pug task
 *	@extends wiredep
 *	@desc Compile pug, insert css and js, run sync reload
 */

gulp.task('watch:reloadpug', ['watch:wiredep'], function() {

	var sources = [
		config.src + config.tmp + '/**/*.css'
	];

	if(config.folder.scripts) {
		sources.push(config.src + config.folder.scripts + '/**/*.js');
	}

	return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(sources), transformPaths()))
		.pipe(gulp.dest(config.src))
		.pipe(sync.reload({
			stream: true
		}));

});

/**
 *	Bower task
 *	@extends pug
 *	@desc Inject bower dependencies in html
 *	@return
 */

gulp.task('watch:wiredep', ['watch:pug'], function() {

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

	gulp.src(config.src + config.folder.scripts + '/**/*.js')
		.pipe($.plumber())
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter())
		.pipe($.jsvalidate())
		.pipe(sync.reload({
			stream: true
		}));

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
 *	@extends wiredep, css, sass, less, stylus
 *	@desc Insert js and css files in html
 */

gulp.task('watch:inject', ['watch:wiredep', 'watch:css', 'watch:sass', 'watch:less', 'watch:stylus'], function() {

	var sources = [
		config.src + config.tmp + '/**/*.css'
	];

	if(config.folder.scripts) {
		sources.push(config.src + config.folder.scripts + '/**/*.js');
	}

	return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(sources), transformPaths()))
		.pipe(gulp.dest(config.src));

});

/**
 *	Watch
 *	@extends inject, sync
 *	@desc Run browser sync and watcher for src folder
 */

gulp.task('watch', ['watch:inject', 'watch:sync'], function() {

	if(config.folder.styles && config.csstype) {
		gulp.watch(config.src + config.folder.styles + '/**/*.{css,scss,less,styl}', ['watch:reloadstyles']);
	}

	if(config.folder.pug) {
		gulp.watch(config.src + config.folder.pug + '/**/*.pug', ['watch:reloadpug']);
	}

	if(config.folder.scripts) {
		gulp.watch(config.src + config.folder.scripts + '/**/*.js', ['watch:scripts']);
	}

	if(!config.folder.pug) {
		gulp.watch([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'], ['watch:html']);
	}

});