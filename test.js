var safe   = require("./index"),
	assert = require("chai").assert,
	fs     = require("fs"),
	rimraf = require("rimraf"),
	File   = require('vinyl');


it("should create file with postfix on new version", function(done) {
	var stream = safe("./", { backup: false }),
		errors = [],
		path;

	path = "./test/fixtures/test.json";

	stream.write(new File({
		path:     path,
		contents: new Buffer('{"null": "null"}')
	}));

	stream.on('data', function(file) {
		try {
			assert.notEqual(file.path, path,            "Passed through file must be renamed");
			assert.match(file.path, /^.*test\(1\).json$/, "Postfix is not correct");
		} catch (err) {
			errors.push(err);
		}
	});

	stream.on('finish', function() {
        done(errors[0]);
    });

    stream.end();
});

it("should create file without postfix, but save old version with postfix", function(done) {
	var stream = safe("./", { backup: true }),
		errors = [],
		path, contents;

	path     = "./test/fixtures/test.json";
	backup   = "./test/fixtures/test(1).json";
	contents = fs.readFileSync(path);

	stream.write(new File({
		path:     path,
		contents: new Buffer('')
	}));

	stream.on('data', function(file) {
		try {
			assert.equal(file.path, path,                                "Passed through file must not be renamed");
			assert.isTrue(fs.existsSync("./test/fixtures/test(1).json"), "Backup copy was not created");
			assert.equal(fs.readFileSync("./test/fixtures/test(1).json").toString(), contents.toString(), "Backup copy was not copied properly");
		} catch (err) {
			errors.push(err);
		}
	});

	stream.on('finish', function() {
        rimraf(backup, function() {
        	done(errors[0])
        });
    });

    stream.end();
});