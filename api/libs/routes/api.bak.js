var express = require('express')
, router = express.Router()
, fs = require('fs')
, zipdir = require('zip-dir')
, libs = process.cwd() + '/libs/'
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
	if(!req.query.uuid){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	var options = {
		windowSize: {
			width: 1281,
			height: 768
		}, 
		shotSize: {
			width: 'window',
			height: 'window'
		},
		shotOffset: {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		useragent: {
			pc: 'Mozilla/5.0 (Windows; U; Windows NT 6.1; ko-KR) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7', //chrome PC Windows
			m: 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G925F Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/47.0.2526.100 Mobile Safari/537.36' //Samsung Galaxy S6 Edge + chrome
		},
		cookies: []
	};

	if(req.query.w){
		options.windowSize.width = req.query.w;
	}

	if(req.query.h){
		options.windowSize.height = req.query.h;
	}

	if(req.query.clipw){
		options.shotSize.width = req.query.clipw;
	}

	if(req.query.cliph){
		options.shotSize.height = req.query.cliph;
	}

	// IF api first called, create a directory first regarding to its UUID
	var dirPath = config.phantom.destPath + req.query.uuid;
	if (!fs.existsSync(dirPath)){
		fs.mkdirSync(dirPath);
	}

	// Set image name
	var url = decodeURIComponent(req.query.url);
	
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	var commentsTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	url = url.replace(commentsTags, '').replace(tags, function ($0, $1) {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
	});

	url = url.replace(';', '').replace('"', '').replace('\'', '/').replace('<?', '')
	.replace('<?', '').replace(/(\r\n|\n|\r)/gm,"");
	// .replace('\077', ' ');
	

	var url_wo_param = (url.indexOf("?") != -1)? url.split("?")[0]:url;
	var domain_name = url_wo_param;
	var disallowed = ['http://', 'https://'];

	for (var d in disallowed) {
		if(url_wo_param.indexOf(disallowed[d]) === 0) {
			 domain_name = url_wo_param.replace(disallowed[d], '');
		}
	}

	domain_name = domain_name.replace(/\//gi, '_').trim();
	
	var img_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '.' + config.phantom.ext;
	var filePath = dirPath + '/' + img_name;
	var img_url = req.headers.host + config.phantom.uploadPath + req.query.uuid + '/' + img_name;
	var isSs = (new RegExp('.samsung.com')).test(url);
	var isSsPreview = (new RegExp('preview4.samsung.com')).test(url);
	var documentHeight;

	if(req.query.isMobile && req.query.isMobile == "1"){
		var mobileWidth = (req.query.mobileWidth)? parseInt(req.query.mobileWidth):360;
		var img_m_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '_m.' + config.phantom.ext;
		var m_filePath = dirPath + '/' + img_m_name;

		var img_pc_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '_pc.' + config.phantom.ext;
		var pc_filePath = dirPath + '/' + img_pc_name;

		async.waterfall([
			function(cb){
				var error_code = null;
				var spooky = new Spooky({
					child: {
						"transport": "http",
						"ssl-protocol": "tlsv1",
						"ignore-ssl-errors": true
					},
					casper: {
						logLevel: 'debug',
						verbose: true,
						sslProtocol: "tlsv1",
						pageSettings: {
							loadImages:  true,         // The WebPage instance used by Casper 
							loadPlugins: false,         // use these settings
							userAgent: options.useragent.m
						},
						viewportSize:{
							width:mobileWidth, height:1024
						}
					}
				}, function (err) {
					if (err) {
						e = new Error('Failed to initialize SpookyJS');
						e.details = err;
						throw e;
					}

					spooky.start(url);

					spooky.waitFor(function check(){
						documentHeight = this.evaluate(function() {
							return __utils__.getDocumentHeight();
						});
		    
						var _this = this
						, h = 0;

						while(h<documentHeight){
							_this.scrollTo(100, h);
							_this.wait(600);
							h = h + 300;
						}

						return true;
					}, function then(){
			
					});

					spooky.then([{
						m_filePath:m_filePath
					}, function() {
						this.scrollToBottom();
						this.emit('console', m_filePath);
						this.capture(m_filePath);
					}]);

					spooky.run(function(){
						this.emit('complete', true);
					});
				});

				spooky.on('error', function (e, stack) {
					console.error(e);

					if (stack) {
						console.log(stack);
					}
					cb(null, e);
				});

				/*
				// Uncomment this block to see all of the things Casper has to say.
				// There are a lot.
				// He has opinions.
				*/
				spooky.on('console', function (line) {
				    console.log(line);
				});


				spooky.on('hello', function (greeting) {
				    console.log(greeting);
				});

				spooky.on('complete', function (isComplete) {
				    if(isComplete) cb(error_code, '');
				});

				spooky.on('log', function (log) {
				    if (log.space === 'remote') {
				        console.log(log.message.replace(/ \- .*/, ''));
				    }
				});
			},
			function(error_code, cb){
				var spooky = new Spooky({
					child: {
						"transport": "http",
						"ssl-protocol": "tlsv1",
						"ignore-ssl-errors": true
					},
					casper: {
						logLevel: 'debug',
						verbose: true,
						sslProtocol: "tlsv1",
						pageSettings: {
							loadImages:  true,         // The WebPage instance used by Casper 
							loadPlugins: false,         // use these settings
							userAgent: options.useragent.pc
						},
						viewportSize:{
							width:1280, height:1024
						}
					}
				}, function (err) {
					if (err) {
						e = new Error('Failed to initialize SpookyJS');
						e.details = err;
						throw e;
					}

					spooky.start(url);

					spooky.waitFor(function check(){
						documentHeight = this.evaluate(function() {
							return __utils__.getDocumentHeight();
						});
		    
						var _this = this
						, h = 0;

						while(h<documentHeight){
							_this.scrollTo(100, h);
							_this.wait(600);
							h = h + 300;
						}

						return true;
					}, function then(){
			
					});

					spooky.then([{
						pc_filePath:pc_filePath
					}, function() {
						this.scrollToBottom();
						this.emit('console', pc_filePath);
						this.capture(pc_filePath);
					}]);

					spooky.run(function(){
						this.emit('complete', true);
					});
				});

				spooky.on('error', function (e, stack) {
					console.error(e);

					if (stack) {
						console.log(stack);
					}
					cb(null, e);
				});

				/*
				// Uncomment this block to see all of the things Casper has to say.
				// There are a lot.
				// He has opinions.
				*/
				spooky.on('console', function (line) {
				    console.log(line);
				});


				spooky.on('hello', function (greeting) {
				    console.log(greeting);
				});

				spooky.on('complete', function (isComplete) {
				    if(isComplete) cb(error_code, '');
				});

				spooky.on('log', function (log) {
				    if (log.space === 'remote') {
				        console.log(log.message.replace(/ \- .*/, ''));
				    }
				});
			}
		],
		function(result){
			if(result !== null){
				return res.json({ 
					error: result
				});
			}else{
				return res.json({ 
					status: 'OK', 
					url:img_url
				});
			}
		});
	}else{
		async.waterfall([
			function(cb){
				var error_code = null;
				var spooky = new Spooky({
					child: {
						"transport": "http",
						"ssl-protocol": "tlsv1",
						"ignore-ssl-errors": true
					},
					casper: {
						logLevel: 'debug',
						verbose: true,
						sslProtocol: "tlsv1",
						pageSettings: {
							loadImages:  true,         // The WebPage instance used by Casper 
							loadPlugins: false,         // use these settings
							userAgent: options.useragent.pc
						},
						viewportSize:{
							width:1280, height:1024
						}
					}
				}, function (err) {
					if (err) {
						e = new Error('Failed to initialize SpookyJS');
						e.details = err;
						throw e;
					}

//					spooky.start(url);
spooky.start("https://chrome.google.com/webstore/category/apps?utm_source=chrome-ntp-icon");
					spooky.waitFor(function check(){
						documentHeight = this.evaluate(function() {
							return __utils__.getDocumentHeight();
						});
		    
						var _this = this
						, h = 0;

						while(h<documentHeight){
							_this.scrollTo(100, h);
							_this.wait(600);
							h = h + 300;
						}

						return true;
					}, function then(){
			
					});

					spooky.then([{
						filePath:filePath
					}, function() {
						this.scrollToBottom();
						this.emit('console', filePath);
						this.capture(filePath);
					}]);

					spooky.run(function(){
						this.emit('complete', true);
					});
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
				*/
				spooky.on('console', function (line) {
				    console.log(line);
				});


				spooky.on('hello', function (greeting) {
				    console.log(greeting);
				});

				spooky.on('complete', function (isComplete) {
				    if(isComplete) cb(error_code, '');
				});

				spooky.on('log', function (log) {
				    if (log.space === 'remote') {
				        console.log(log.message.replace(/ \- .*/, ''));
				    }
				});        
			}
		],
		function(result){
			if(result !== null){
				return res.json({ 
					error: result
				});
			}else{
				return res.json({ 
					status: 'OK', 
					url:img_url
				});
			}
		});
	}	
});

/* GET create Zipped file API. */
router.get('/proczip', function (req, res) {
	if(!req.query.uuid){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	var dirPath = config.phantom.destPath + req.query.uuid;
	var zipFilePath = dirPath + '.zip';
	var zipName = req.query.uuid + '.zip';

	var err = {
		isError: false,
		code: 200,
		errObj: null
	};

	try {
	  fs.accessSync(dirPath);
	} catch (e) {
	  	return res.json({ 
			error: e.error
		});
	}

	zipdir(dirPath, { saveTo: zipFilePath }, function (err2, buffer) {
		if (err2){
			res.statusCode = 500;
			log.error('Internal error(%d): %s',res.statusCode,err2);

			err.isError = true;
			err.code = 501;
			err.errObj = err2;
		}
	});

	if(err.isError){
		return res.json({ 
			error: err.errObj
		});
	}else{
		return res.json({ 
			zipName:zipName,
			status:'OK'
		});
	}
});

/* GET image file list API. */
router.get('/images', function (req, res) {
	if(!req.query.uuid){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	var dirPath = config.phantom.destPath + req.query.uuid;
	
	fs.readdir(dirPath, function(err, files) {
		return res.json({ 
			imgList:files
		});
	});	
});

module.exports = router;
