# [gulp](http://gulpjs.com)-safe

> Simple way to backup your files

Simple pass through gulp plugin, that creates backup copy of your file(s) in two ways - by appending postfix to new, or, to existing file.

## Getting started

If you haven't used [gulp](http://gulpjs.com) before, be sure to check out the [Getting Started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) guide.

Install with [npm](https://npmjs.org/package/gulp-safe)

```
npm install --save-dev gulp-safe
```

## Overview

Here quick example of simple way usage:

```javascript
var gulp = require('gulp'),
	safe = require('gulp-safe');

gulp.task('make-my-awesome-files', function() {
	var dest;

	dest = "./my/dest/for/files";

	return gulp.src("./src/my/files/*.json")
		.pipe(someCoolPlugin())
		.pipe(anotherCoolPlugin())
		.pipe(safe(dest)) // here we go! just backup already existing files before they overwritten
		.pipe(gulp.dest(dest));
});
```

## API

### safe(destination, [options])

#### destination

Type: `String`

The destination directory. Same as you put into `gulp.dest()`.

This is needed to be able to compare the current existing files with the destination files.

#### options

Type: `Object`

Then options object.

Property     | Necessary | Type       | Plugin default value
-------------|-----------|------------|---------------------
[backup]     | no        | `Boolean`  | `true`
[format]     | no        | `String`   | `"(%s)"`
[generator]  | no        | `Function` | `null`

#### options.backup
Type: `Boolean`
Default value: `true`

Determines for which file append postfix - if true, existing file will get the postfix, like it will be backuped. If false - the new one file will get the postfix.

#### options.format
Type: `Boolean`
Default value: `"(%s)"`

The sprintf format of postfix. Be careful with it, cause if you will do not use `%s` pattern inside it, your plugin can fall in infinite loop.

#### options.generator
Type: `Function`
Default value: `null`
Return type: `Function`

Currying generator of file version. Function takes one argument - the file. Then it must return initialized generator, that will be called in each time, when file is already exists. Initialized generator takes one argument, that is callback, that resolved in standard node way - `callback(err, version)`, where version is a `String`:
```js

	safe("path", {
		generator: function(file) {
			return function(done) {
				getSomeAsyncStuffWith(file)
					.then(function(result) {
						done(null, result);
					})
					.catch(done);
			}
		}
	});

```
