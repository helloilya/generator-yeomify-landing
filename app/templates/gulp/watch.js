'use strict';

var fs = require('fs'),
	gulp = require('gulp'),
	sync = require('browser-sync'),
	wiredep = require('wiredep').stream,
	config = require('./config');

var $ = require('gulp-load-plugins')();

/**
 *	Transform paths function
 *	@desc Updates paths before insert css and js into html file
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
 *	Return path to scripts folder
 *	@desc Returns correct path to scripts folder base on es6syntax flag
 */

function getScriptsFolderPath() {

	var path = config.es6syntax ? config.tmp : config.folder.scripts;
	return config.src + path + '/**/*.js';

}

/**
 *	BrowserSync task
 *	@desc Initializes BrowserSync
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
 *	@desc Concatenates css, copies files to temp folder, validates css
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
 *	@desc Concatenates/compresses less, copies files to temp folder, validates less
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
 *	@desc Concatenates/compresses sass, copies files to temp folder, validates sass
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
 *	@desc Concatenates/compresses stylus, copies files to temp folder, validates stylus
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
 *	@desc Compiles styles, runs sync reload
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
 *	@desc Compiles pug templates
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
 *	@desc Compiles pug, inserts css and js, runs sync reload
 *	@return
 */

gulp.task('watch:reloadpug', ['watch:wiredep'], function() {

	var sources = [
		config.src + config.tmp + '/**/*.css'
	];

	if(config.folder.scripts) {
		sources.push(getScriptsFolderPath());
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
 *	@desc Injects bower dependencies into html
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
 *	Clean js task
 *	@desc Removes js files from temp folder
 *	@return
 */

gulp.task('watch:cleanjs', function() {

	return gulp.src([config.src + config.tmp + '/**/*.js'])
		.pipe($.rimraf({ force: true }));

});

/**
 *	Reload js task
 *	@extends babeljs
 *	@desc Compiles/validates js files, runs sync reload
 */

gulp.task('watch:reloadjs', ['watch:babeljs'], function() {

	gulp.src(config.src + config.folder.scripts + '/**/*.js')
		.pipe($.plumber())
		.pipe($.jshint(config.es6syntax ? '.es6hintrc' : '.jshintrc'))
		.pipe($.jshint.reporter())
		.pipe(sync.reload({
			stream: true
		}));

});

/**
 *	Babeljs task
 *	@extends cleanjs
 *	@desc Compiles js files base on babeljs
 *	@return
 */

gulp.task('watch:babeljs', ['watch:cleanjs'], function() {

	if(config.folder.scripts && config.es6syntax) {

		return gulp.src(config.src + config.folder.scripts + '/**/*.js')
			.pipe($.plumber())
			.pipe($.babel({
				presets: ['env']
			}))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Html task
 *	@desc Validates html files
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
 *	@extends wiredep, babeljs, css, sass, less, stylus
 *	@desc Inserts js and css files into html
 *	@return
 */

gulp.task('watch:inject', ['watch:wiredep', 'watch:babeljs', 'watch:css', 'watch:sass', 'watch:less', 'watch:stylus'], function() {

	var sources = [
		config.src + config.tmp + '/**/*.css'
	];

	if(config.folder.scripts) {
		sources.push(getScriptsFolderPath());
	}

	return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(sources), transformPaths()))
		.pipe(gulp.dest(config.src));

});

/**
 *	Watch
 *	@extends inject, sync
 *	@desc Runs browser sync and watches for src folder
 */

gulp.task('watch', ['watch:inject', 'watch:sync'], function() {

	if(config.folder.styles && config.csstype) {
		gulp.watch(config.src + config.folder.styles + '/**/*.{css,scss,less,styl}', ['watch:reloadstyles']);
	}

	if(config.folder.pug) {
		gulp.watch(config.src + config.folder.pug + '/**/*.pug', ['watch:reloadpug']);
	}

	if(config.folder.scripts) {
		gulp.watch(config.src + config.folder.scripts + '/**/*.js', ['watch:reloadjs']);
	}

	if(!config.folder.pug) {
		gulp.watch([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'], ['watch:html']);
	}

});