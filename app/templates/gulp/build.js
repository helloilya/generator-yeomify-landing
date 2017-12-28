'use strict';

var fs = require('fs'),
	gulp = require('gulp'),
	sync = require('browser-sync'),
	wiredep = require('wiredep').stream,
	config = require('./config');

var $ = require('gulp-load-plugins')();

/**
 *	Watch task
 *	@desc Runs watcher for dist folder
 */

gulp.task('build:watch', function() {

	sync({
		open: false,
		startPath: '/',
		server: {
			baseDir: config.dist,
			index: 'index.html'
		}
	});

});

/**
 *	Clean task
 *	@desc Removes temp and dist folders
 *	@return
 */

gulp.task('build:clean', function() {

	return gulp.src([config.dist, config.src + config.tmp])
		.pipe($.rimraf({ force: true }));

});

/**
 *	Copy task
 *	@extends clean
 *	@desc Copies files and folders from root folder
 *	@return
 */

gulp.task('build:copy', ['build:clean'], function() {

	if(config.copyfiles.length) {

		for(var i = 0, l = config.copyfiles.length; i < l; i++) {
			config.copyfiles[i] = config.src + config.copyfiles[i];
		}

		return gulp.src(config.copyfiles)
			.pipe($.copy(config.dist, { prefix: 1 }))
			.pipe($.size());

	}

});

/**
 *	Fonts task
 *	@extends clean
 *	@desc Copies fonts to dist folder
 *	@return
 */

gulp.task('build:fonts', ['build:clean'], function() {

	if(config.folder.fonts) {

		return gulp.src(config.src + config.folder.fonts + '/**/*.{eot,svg,ttf,woff}')
			.pipe(gulp.dest(config.dist + config.folder.fonts))
			.pipe($.size());

	}

});

/**
 *	Images task
 *	@extends clean
 *	@desc Optimizations images, copies media files to dist folder
 *	@return
 */

gulp.task('build:images', ['build:clean'], function() {

	var path = [];

	if(config.folder.icons) { path.push(config.folder.icons); }
	if(config.folder.images) { path.push(config.folder.images); }
	if(config.folder.pictures) { path.push(config.folder.pictures); }

	path.forEach(function(folder) {

		return gulp.src(config.src + folder + '/**/*.{jpg,png,gif,svg}')
			.pipe($.plumber())
			.pipe($.imagemin({
				optimizationLevel: 3,
				progressive: true,
				interlaced: true,
				svgoPlugins: [
					{ removeViewBox: true },
					{ removeEmptyAttrs: true }
				]
			}))
			.pipe(gulp.dest(config.dist + folder))
			.pipe($.size());

	});

});

/**
 *	Css task
 *	@extends clean
 *	@desc Concatenates css, copies files to temp folder
 *	@return
 */

gulp.task('build:css', ['build:clean'], function() {

	if(config.folder.styles && config.csstype === 'css') {

		return gulp.src(config.src + config.folder.styles + '/**/*.css')
			.pipe($.plumber())
			.pipe($.concat('style.css'))
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe($.size());

	}

});

/**
 *	Less task
 *	@extends clean
 *	@desc Concatenates/compresses less, copies files to temp folder
 *	@return
 */

gulp.task('build:less', ['build:clean'], function() {

	if(config.folder.styles && config.csstype === 'less') {

		return gulp.src(config.src + config.folder.styles + '/style.less')
			.pipe($.plumber())
			.pipe($.less())
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe($.size());

	}

});

/**
 *	Sass task
 *	@extends clean
 *	@desc Concatenates/compresses sass, copies files to temp folder
 *	@return
 */

gulp.task('build:sass', ['build:clean'], function() {

	if(config.folder.styles && config.csstype === 'sass') {

		return gulp.src(config.src + config.folder.styles + '/style.scss')
			.pipe($.plumber())
			.pipe($.sass({
				style: 'compressed'
			}))
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe($.size());

	}

});

/**
 *	Stylus task
 *	@extends clean
 *	@desc Concatenates/compresses stylus, copies files to temp folder
 *	@return
 */

gulp.task('build:stylus', ['build:clean'], function() {

	if(config.folder.styles && config.csstype === 'stylus') {

		return gulp.src(config.src + config.folder.styles + '/style.styl')
			.pipe($.plumber())
			.pipe($.stylus({
				compress: true
			}))
			.pipe(gulp.dest(config.src + config.tmp))
			.pipe($.size());

	}

});

/**
 *	Pug task
 *	@extends clean
 *	@desc Compiles pug templates
 *	@return
 */

gulp.task('build:pug', ['build:clean'], function() {

	if(config.folder.pug) {

		return gulp.src(config.src + config.folder.pug + '/**/[^_]*.pug')
			.pipe($.plumber())
			.pipe($.pug({ pretty: '\t' }))
			.pipe(gulp.dest(config.src))
			.pipe($.size());

	}

});

/**
 *	Bower task
 *	@extends clean, pug
 *	@desc Injects bower dependencies into html
 *	@return
 */

gulp.task('build:wiredep', ['build:clean', 'build:pug'], function() {

	if(config.folder.vendors && fs.existsSync(config.src + config.folder.vendors)) {

		return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
			.pipe(wiredep({
				directory: config.src + config.folder.vendors
			}))
			.pipe(gulp.dest(config.src));

	}

});

/**
 *	Babel task
 *	@extends clean
 *	@desc Compiles js files base on babeljs
 */

gulp.task('build:babeljs', ['build:clean'], function() {

	if(config.folder.scripts && config.es6syntax) {

		gulp.src(config.src + config.folder.scripts + '/**/*.js')
			.pipe($.plumber())
			.pipe($.babel({
				presets: ['env']
			}))
			.pipe(gulp.dest(config.src + config.tmp));

	}

});

/**
 *	Inject task
 *	@extends clean, css, less, sass, stylus, wiredep, pug, babeljs
 *	@desc Injects js and css files into html
 *	@return
 */

gulp.task('build:inject', ['build:clean', 'build:css', 'build:less', 'build:sass', 'build:stylus', 'build:babeljs', 'build:wiredep', 'build:pug'], function() {

	var scriptsFolderPath = config.folder.scripts;
	var sources = [
		config.src + config.tmp + '/**/*.css'
	];

	if(config.folder.scripts) {
		if(config.es6syntax) {
			scriptsFolderPath = config.tmp;
		}
		sources.push(config.src + scriptsFolderPath + '/**/*.js');
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
		.pipe(gulp.dest(config.src));

});

/**
 *	Assets task
 *	@extends clean, inject
 *	@desc Concatenates/compresses js and css files, copies files to the dist folder, adds hash to files name if rev flag set as true
 *	@return
 */

gulp.task('build:assets', ['build:clean', 'build:inject'], function() {

	var jsFilter = $.filter('**/*.js'),
		cssFilter = $.filter('**/*.css');

	return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.useref.assets())
		.pipe($.if(config.rev, $.rev()))
		.pipe(jsFilter)
		.pipe($.uglify())
		.pipe(jsFilter.restore())
		.pipe(cssFilter)
		.pipe($.csso())
		.pipe($.autoprefixer({
			browsers: config.browsers,
			cascade: false
		}))
		.pipe(cssFilter.restore())
		.pipe(gulp.dest(config.dist))
		.pipe($.size());

});

/**
 *	Build task
 *	@extends clean, copy, fonts, images, assets
 *	@desc Injects js and css files into html, compresses html and replace paths
 */

gulp.task('build', ['build:clean', 'build:copy', 'build:fonts', 'build:images', 'build:assets'], function() {

	gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(config.dist + 'css/**/*.css', { read: true }), { relative: true }))
		.pipe($.inject(gulp.src(config.dist + 'scripts/**/*.js', { read: true }), { relative: true }))
		.pipe($.removeCode({ build: true }))
		.pipe($.if($.util.env.abspaths, $.replace('.' + config.dist, '/'), $.replace('.' + config.dist, '')))
		.pipe($.htmlmin({
			removeComments: true,
			collapseWhitespace: true,
			removeStyleLinkTypeAttributes: true,
			removeScriptTypeAttributes: true
		}))
		.pipe($.notify({
			title: 'Gulp',
			message: 'Build is ready',
			sound: 'Pop',
			icon: false,
			onLast: true
		}))
		.pipe(gulp.dest(config.dist))
		.pipe($.size());

});