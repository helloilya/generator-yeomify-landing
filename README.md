# Yeomify landing generator

> Yeoman generator for landing project powered by Gulp.

### Usage

Make sure you have `yeoman`, `bower` and `gulp` installed:

```
$ npm install -g yo bower gulp
```

Install the generator:

```
$ npm install -g generator-yeomify-landing
```

Then, create a folder for the generator and unfold it:

```
$ yo yeomify-landing
```

During installation you can install [pug](https://pugjs.org) as template engine and [less](http://lesscss.org), [sass](http://sass-lang.com) or [stylus](https://learnboost.github.io/stylus/) as css preprocessor.

![Yeomify landing generator](http://fedotov.work/yeomify/yeomify-bash.png)

Then, run `npm install` and `bower install` to install the required dependencies.

### Directory Layout

After installation you'll have the following directory structure:

```
├── app
│   ├── css
│   ├── pug
│   ├── scripts
│   └── index.html
├── gulp
│   ├── build.js
│   ├── config.js
│   └── watch.js
├── bower.json
├── gulpfile.js
├── package.json
└── readme.md
```

### Development

Use the following commands for development:

* `gulp watch` run a watcher for the `app` folder;
* `gulp build` build the project to `dist` folder;
* `gulp build --abspaths` build the project to `dist` folder with the absolute paths (css and js files);
* `gulp build:watch` run a watcher for the `dist` folder;
* `gulp build:clean` remove `dist` and `.tmp` folders.

Also, you can change the gulp options in `config.js` file.

### Linters

Each template engine and preprocessor uses a linter. The documentation for linters rules: [pug](https://github.com/pugjs/pug-lint/blob/master/docs/rules.md), [css](https://github.com/CSSLint/csslint/wiki/Rules-by-ID), [less](https://github.com/lesshint/lesshint/blob/master/lib/linters/README.md), [sass](https://github.com/sasstools/sass-lint/tree/master/docs/rules) and [stylus](https://github.com/rossPatton/stylint#options). Javascript uses [jshint](http://jshint.com/docs/options/) and supports ECMAScript 6 syntax. By default, this functionality is disabled, but you can enable it by changing the `es6syntax` flag into your `config.js` file.

### Release History

* 1.6.0 — Added `babeljs` support, updated javascript linter.
* 1.5.0 — Added ability to copy folders and contents of them (expanded `copyfiles` parameter in `config.js`).
* 1.4.2 — Updated gulp dependencies, replaced `gulp-minify-html` to `gulp-htmlmin`, fixed reset files.
* 1.4.1 — Added `onLast` parameter for `gulp-notify` config, updated `jslinter` config.
* 1.4.0 — Replaced `jade` plugin to `pug`, added `pug` linter, updated `body` styles.
* 1.3.2 — Fixed issue #4, updated modernizr version.
* 1.3.1 — Fixed bug where the page was reloaded without insert styles in `jade` file, optimized `watch` task.
* 1.3.0 — Added `less`, `sass` and `stylus` linters, updated styles files structure, updated bower dependencies.
* 1.2.2 — Renamed config option from `css` to `csstype`, renamed folder from `styles` to `css`, updated names of tasks.
* 1.2.1 — Fixed bug with incorrect paths in `app` folder after run the `build` task, added default font file for css.
* 1.2.0 — Replaced `gulp-ruby-sass` to `gulp-sass`.
* 1.1.2 — Added `.idea` folder to `.gitignore`.
* 1.1.1 — Updated csslint validator options.
* 1.1.0 — Added `stylus` preprocessor, added `--abspaths` parameter to `build` task, updated less structure folder.
* 1.0.6 — Validator options as external files, updated documentation.
* 1.0.5 — Bug fixed in `inject` task, update `gulp-minify-html` config.
* 1.0.4 — Added html5doctor reset stylesheet, bug fixed in `watch` tasks, added `pictures` folder to config.
* 1.0.3 — Added sourcemaps, bug fixed with `.gitignore`.
* 1.0.2 — Added yeoman generator support.
* 1.0.1 — Bugs fixed.
* 1.0.0 — Added npm support.
* 0.1.0 — Initial release.

## License

MIT © [Ilya Fedotov](http://fedotov.me)