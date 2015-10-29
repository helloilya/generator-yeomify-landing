'use strict';

var fs = require('fs'),
	gulp = require('gulp'),
	sync = require('browser-sync'),
	wiredep = require('wiredep').stream,
	config = require('./config');

var $ = require('gulp-load-plugins')();

/**
 *	Watch task
 *	@desc Run watcher for dist folder
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
 *	@desc Remove temp and dist folders
 */

gulp.task('build:clean', function() {

	gulp.src([config.dist, config.tmp])
		.pipe($.rimraf({ force: true }));

});

/**
 *	Copy task
 *	@desc Copy files from root folder
 *	@return
 */

gulp.task('build:copy', function() {

	if(config.copyfiles.length) {

		for(var i = 0, l = config.copyfiles.length; i < l; i++) {
			config.copyfiles[i] = config.src + config.copyfiles[i];
		}

		return gulp.src(config.copyfiles)
			.pipe(gulp.dest(config.dist))
			.pipe($.size());

	}

});

/**
 *	Fonts task
 *	@desc Copy fonts to dist folder
 *	@return
 */

gulp.task('build:fonts', function() {

	if(config.folder.fonts) {

		return gulp.src(config.src + config.folder.fonts + '/**/*.{eot,svg,ttf,woff}')
			.pipe(gulp.dest(config.dist + config.folder.fonts))
			.pipe($.size());

	}

});

/**
 *	Images task
 *	@desc Optimization images and copy files to dist folder
 *	@return
 */

gulp.task('build:images', function() {

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
 *	Styles task
 *	@desc Concatenate css and copy file to temp folder
 *	@return
 */

gulp.task('build:styles', function() {

	if(config.folder.styles && config.css === 'styles') {

		return gulp.src(config.src + config.folder.styles + '/**/*.css')
			.pipe($.plumber())
			.pipe($.concat('style.css'))
			.pipe(gulp.dest(config.tmp))
			.pipe($.size());

	}

});

/**
 *	Less task
 *	@desc Concatenate/compress less and copy file to temp folder
 *	@return
 */

gulp.task('build:less', function() {

	if(config.folder.styles && config.css === 'less') {

		return gulp.src(config.src + config.folder.styles + '/style.less')
			.pipe($.plumber())
			.pipe($.less())
			.pipe(gulp.dest(config.tmp))
			.pipe($.size());

	}

});

/**
 *	Sass task
 *	@desc Concatenate/compress sass and copy file to temp folder
 *	@return
 */

gulp.task('build:sass', function() {

	if(config.folder.styles && config.css === 'sass') {

		return gulp.src(config.src + config.folder.styles + '/**/*.scss')
			.pipe($.plumber())
			.pipe($.rubySass({
				style: 'compressed',
				sourcemap: false,
				check: true
			}))
			.pipe(gulp.dest(config.tmp))
			.pipe($.size());

	}

});

/**
 *	Stylus task
 *	@desc Concatenate/compress stylus, copy file to temp folder
 *	@return
 */

gulp.task('build:stylus', function() {

	if(config.folder.styles && config.css === 'stylus') {

		return gulp.src(config.src + config.folder.styles + '/style.styl')
			.pipe($.plumber())
			.pipe($.stylus({
				compress: true
			}))
			.pipe(gulp.dest(config.tmp))
			.pipe($.size());

	}

});

/**
 *	Jade task
 *	@desc Compile jade templates
 *	@return
 */

gulp.task('build:jade', function() {

	if(config.folder.jade) {

		return gulp.src(config.src + config.folder.jade + '/**/[^_]*.jade')
			.pipe($.plumber())
			.pipe($.jade({ pretty: '\t' }))
			.pipe(gulp.dest(config.src))
			.pipe($.size());

	}

});

/**
 *	Bower task
 *	@extends jade
 *	@desc Inject bower dependencies to html
 *	@return
 */

gulp.task('build:wiredep', ['build:jade'], function() {

	if(config.folder.vendors && fs.existsSync(config.src + config.folder.vendors)) {

		return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
			.pipe(wiredep({
				directory: config.src + config.folder.vendors
			}))
			.pipe(gulp.dest(config.src));

	}

});

/**
 *	Inject task
 *	@extends styles, less, sass, wiredep
 *	@desc Inject js and css files to html
 *	@return
 */

gulp.task('build:inject', ['build:styles', 'build:less', 'build:sass', 'build:stylus', 'build:wiredep', 'build:jade'], function() {

	return gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(config.src + config.folder.scripts + '/**/*.js'), {
			starttag: '<!-- inject:js -->',
			addRootSlash: false,
			addPrefix: '..'
		}))
		.pipe($.inject(gulp.src(config.tmp + '/**/*.css'), {
			starttag: '<!-- inject:css -->',
			addRootSlash: false,
			addPrefix: '..'
		}))
		.pipe(gulp.dest(config.src));

});

/**
 *	Assets task
 *	@extends inject
 *	@desc Concatenate/compress js and css files, copy files to dist folder, add hash to files name if rev flag set as true
 *	@return
 */

gulp.task('build:assets', ['build:inject'], function() {

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
 *	@extends copy, fonts, images, assets
 *	@desc Inject js and css files to html, compress html and replace paths
 */

gulp.task('build', ['build:copy', 'build:fonts', 'build:images', 'build:assets'], function() {

	gulp.src([config.src + '**/*.html', '!' + config.src + config.folder.vendors + '/**'])
		.pipe($.inject(gulp.src(config.dist + 'css/**/*.css', { read: true }), { relative: true }))
		.pipe($.inject(gulp.src(config.dist + 'scripts/**/*.js', { read: true }), { relative: true }))
		.pipe($.removeCode({ build: true }))
		.pipe($.if($.util.env.abspaths, $.replace('.' + config.dist, '/'), $.replace('.' + config.dist, '')))
		.pipe($.minifyHtml({
			comments: false,
			empty: false,
			conditionals: true,
			cdata: true,
			quotes: true,
			spare: true
		}))
		.pipe($.notify({
			title: 'Gulp',
			message: 'Build is ready',
			sound: "Pop",
			icon: false
		}))
		.pipe(gulp.dest(config.dist))
		.pipe($.size());

});