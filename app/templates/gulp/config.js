'use strict';

/**
 *	Config
 */

module.exports = {

	// Path to build and app folders

	dist: './dist/',
	src: './app/',

	// Path to temporary folder for css

	tmp: '.tmp',

	// Flag to add hash for assets files

	rev: false,

	// Style type [styles, less, sass]. Selected when generating project

	css: '<%= yeomify_styles %>',

	// Path to project folders [folder name or false or '']

	folder: {
		fonts: '',
		icons: '',
		images: '',
		jade: <%= yeomify_jade %>,
		styles: '<%= yeomify_styles %>',
		scripts: 'scripts',
		vendors: 'bower_components'
	},

	// Browser prefixs for autoprefixer

	browsers: [
		'Firefox < 20',
		'Chrome < 20',
		'Opera < 12'
	],

	// Files list just for copy

	copyfiles: [
		'favicon.ico'
	]

};