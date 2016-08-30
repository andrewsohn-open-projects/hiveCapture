var express = require('express')
, router = express.Router()
, fs = require('fs')
, zipdir = require('zip-dir')
, libs = process.cwd() + '/libs/'
, webshot = require(libs + 'webshot/webshot')
, config = (require('../config'))['stores']['file']['store']
, async = require("async");

try {
    var Spooky = require('spooky');
} catch (e) {
    var spookyPath = process.cwd() + '/node_modules/spooky/lib/spooky';
    var Spooky = require( spookyPath );
}

/* GET Sample API. */
router.get('/', function (req, res) {
	return res.json(config);
});

/* GET Image Capture API. */
router.get('/capture', function (req, res) {
	/**
	 * variables 
	 * url, prefix, order, uuid, w, h, clipw, cliph, isSsPreview
	 */
	
	/* GET users listing. */
router.get('/', function (req, res) {
        var spooky = new Spooky({
        child: {
            transport: 'http'
        },
        casper: {
            logLevel: 'debug',
            verbose: true
        }
    }, function (err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }

        spooky.start(
            'http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
        spooky.then(function () {
            this.emit('hello', 'Hello, from ' + this.evaluate(function () {
                return document.title;
            }));
        });
        spooky.run();
    });

spooky.on('error', function (e, stack) {
    console.error(e);

    if (stack) {
        console.log(stack);
    }
});

/*
// Uncomment this block to see all of the things Casper has to say.
// There are a lot.
// He has opinions.
spooky.on('console', function (line) {
    console.log(line);
});
*/

spooky.on('hello', function (greeting) {
    console.log(greeting);
});

spooky.on('log', function (log) {
    if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
    }
});

        return res.json({
                                        status: 'OK'
                                });
});


module.exports = router;

