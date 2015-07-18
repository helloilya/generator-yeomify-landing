'use strict';

var chalk = require('chalk'),
	yosay = require('yosay'),
	yeoman = require('yeoman-generator');

var YeomifyLandingGenerator = yeoman.generators.Base.extend({

	init: function(args, options) {

		this.pkg = require('../package.json');

		this.on('end', function() {

			// Install dependencies unless --skip-install is passed

			if(!this.options['skip-install']) {
				this.installDependencies();
			}

		});

	},

	ask: function() {

		var done = this.async();

		console.log(yosay(chalk.yellow('Yeoman generator for landing project powered by Gulp!')));

		var prompts = [
			{
				name: 'name',
				message: 'What is your app\'s name?',
				default: 'Yeomify'
			},
			{
				name: 'desc',
				message: 'What is your app\'s description?',
				default: 'Yeoman generator'
			},
			{
				type: 'confirm',
				name: 'jade',
				message: 'Would you install jade as template engine?',
				default: false
			},
			{
				type: 'list',
				name: 'styles',
				message: 'What css preprocessor would you use?',
				choices: ['sass', 'less', 'any'],
				default: 'any'
			},
			{
				type: 'confirm',
				name: 'libs',
				message: 'Would you install modernizr and normalize libraries?',
				default: true
			}
		];

		this.prompt(prompts, function(props) {

			this.questions = {
				name: props.name,
				desc: props.desc,
				jade: props.jade,
				styles: props.styles,
				libs: props.libs
			};

			done();

		}.bind(this));

	},

	dotfiles: function() {

		this.copy('.bowerrc', '.bowerrc');
		this.copy('.gitattributes', '.gitattributes');
		this.copy('.gitignore', '.gitignore');

	},

	gulp: function() {

		if(this.questions.jade) { this.questions.jade = "'jade'"; }
		if(this.questions.styles == 'any') { this.questions.styles = 'styles'; }
		if(this.questions.libs) { this.questions.libs = "'bower_components'"; }

		var context = {
			yeomify_jade: this.questions.jade,
			yeomify_styles: this.questions.styles,
			yeomify_libs: this.questions.libs
		};

		this.copy('gulpfile.js', 'gulpfile.js');
		this.copy('gulp/watch.js', 'gulp/watch.js');
		this.copy('gulp/build.js', 'gulp/build.js');
		this.template('gulp/config.js', 'gulp/config.js', context);

	},

	context: function() {

		var context = {
			yeomify_name: this.questions.name,
			yeomify_desc: this.questions.desc,
			yeomify_jade: this.questions.jade,
			yeomify_styles: this.questions.styles,
			yeomify_libs: this.questions.libs
		};

		this.template('bower.json', 'bower.json', context);
		this.template('package.json', 'package.json', context);
		this.template('readme.md', 'readme.md', context);

	},

	folder: function() {

		this.directory('landing/scripts', 'app/scripts');
		this.copy('landing/favicon.ico', 'app/favicon.ico');
		this.copy('landing/index.html', 'app/index.html');

		if(this.questions.jade) {
			this.directory('landing/jade', 'app/jade');
		}

		this.directory('landing/' + this.questions.styles, 'app/' + this.questions.styles);

	}

});

module.exports = YeomifyLandingGenerator;