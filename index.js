var through2 = require("through2"),
	_        = require("lodash"),
	fs       = require("fs"),
	ncp      = require("ncp"),
	path     = require("path"),
	util     = require("util"),
	gutil    = require("gulp-util");

module.exports = function(dest, options) {
	var whilst;

	options = _.defaults(options || {}, {
		backup: true,
		format: "(%d)",
		generator: function(file) {
			var version = 0;
			return function(done) {
				done(null, ++version);
			}
		}
	});

	whilst = function(value, test, iterator, callback) {
		test(value, function(err, result) {
			if (err) {
				return callback(err);
			}

			if (result === true) {
				iterator(function(err, value) {
					if (err) {
                    	return callback(err);
                	}

                	whilst(value, test, iterator, callback);
				});
			} else {
				callback(null, value);
			}
		});
    };

	return through2.obj(function(file, enc, done) {
		var self = this,
			basepath, basename, name, extname, version,
			resolvedDest;

		basename  = path.basename(file.path);
		extname   = path.extname(basename);
		name      = basename.slice(0, basename.lastIndexOf(extname));
		basepath  = file.path.slice(0, file.path.lastIndexOf(basename));

		resolvedDest = path.join(dest, path.relative(dest, basepath));
		
		generator = options.generator(file);

		whilst(
			basename,
			function(version, done) {
				fs.exists(path.resolve(resolvedDest, version), function(result) {
					done(null, result);
				});
			},
			function(done) {
				generator(function(err, version) {
					if (err) {
						return done(err);
					}
					
					done(null, name + util.format(options.format, version) + extname);
				});
			},
			function(err, finalname) {
				if (err) {
					return self.emit('error', new gutil.PluginError('gulp-safe', err.toString()));
				}

				// if previous file not found - just pass through
				if (basename === finalname) {
					self.push(file);
					done();
					return;
				}

				if (options.backup) {
					// save old version with prefix
					ncp.ncp(path.resolve(resolvedDest, basename), path.resolve(resolvedDest, finalname), function (err) {
						if (err) {
							self.emit('error', new gutil.PluginError('gulp-safe', err.toString()));
							done();
						} else {
							self.push(file);
							done();
						}
					});
				} else {
					// save new version with postfix
					file.path = path.resolve(basepath, finalname);
					self.push(file);
					done();
				}
			}
		)		
	});
};