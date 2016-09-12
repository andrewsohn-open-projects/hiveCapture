var express = require('express')
, router = express.Router()
, fs = require('fs')
, phantom = require('phantom')
, zipdir = require('zip-dir')
, libs = process.cwd() + '/libs/'
, webshot = require(libs + 'webshot/webshot')
, config = (require('../config'))['stores']['file']['store']
, async = require("async");

var log = require('../log')(module);
var Spooky = require('spooky');

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
		defaultWhiteBackground: false,
		customCSS: '', 
		takeShotOnCallback: false, 
		// onCallback: function(w, h){
		// 	// document.body.style.width = w + "px";
  // 	// 		document.body.style.height = h + "px";
		// },
		streamType: 'png',
		useragent: {
			pc: 'Mozilla/5.0 (Windows; U; Windows NT 6.1; ko-KR) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7', //chrome PC Windows
			m: 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G925F Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/47.0.2526.100 Mobile Safari/537.36' //Samsung Galaxy S6 Edge + chrome
		}, 
		siteType: 'url', 
		renderDelay: 0, 
		quality: 75, 
		errorIfStatusIsNot200: false, 
		errorIfJSException: false, 
		cookies: [], 
		captureSelector: false, 
		zoomFactor: 1
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
	var url = req.query.url;
	
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	var commentsTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	url = url.replace(commentsTags, '').replace(tags, function ($0, $1) {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
	});

	url = url.replace(';', '').replace('"', '').replace('\'', '/').replace('<?', '')
	.replace('<?', '').replace('\077', ' ');
	
// 		$img_name = random_string('alnum', 16);
	var domain_name = url;
	var disallowed = ['http://', 'https://'];

	for (var d in disallowed) {
		if(url.indexOf(disallowed[d]) === 0) {
			 domain_name = url.replace(disallowed[d], '');
		}
	}
	
	domain_name = domain_name.replace(/\//gi, '_');

	var img_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '.' + config.phantom.ext;
	var filePath = dirPath + '/' + img_name;
	var img_url = req.headers.host + config.phantom.uploadPath + req.query.uuid + '/' + img_name;
	var isSsPreview = (new RegExp('preview4.samsung.com')).test(url);
	var isHttps = (new RegExp('https://')).test(url);
	var documentHeight;

	if(req.query.isMobile && req.query.isMobile == "1"){
		
		var mobileWidth = (req.query.mobileWidth)? parseInt(req.query.mobileWidth):360;

		// if(isHttps){
		// 	/** Case 
		// 	 * @params : HTTPS, isMobile=1
		// 	 */
		// 	var img_m_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '_m.' + config.phantom.ext;
		// 	var m_filePath = dirPath + '/' + img_m_name;

		// 	var img_pc_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '_pc.' + config.phantom.ext;
		// 	var pc_filePath = dirPath + '/' + img_pc_name;

		// 	async.waterfall([
		// 		function(cb){
		// 			var error_code = null;
		// 			var spooky = new Spooky({
		// 				child: {
		// 					"transport": "http",
		// 					"ssl-protocol": "tlsv1",
		// 					"ignore-ssl-errors": true
		// 				},
		// 				casper: {
		// 					logLevel: 'debug',
		// 					verbose: true,
		// 					sslProtocol: "tlsv1",
		// 					pageSettings: {
		// 						loadImages:  true,         // The WebPage instance used by Casper 
		// 						loadPlugins: false,         // use these settings
		// 						userAgent: options.useragent.m
		// 					},
		// 					viewportSize:{
		// 						width:mobileWidth, height:1024
		// 					}
		// 				}
		// 			}, function (err) {
		// 				if (err) {
		// 					e = new Error('Failed to initialize SpookyJS');
		// 					e.details = err;
		// 					throw e;
		// 				}

		// 				spooky.start(url);

		// 				spooky.waitFor(function check(){
		// 					documentHeight = this.evaluate(function() {
		// 						return __utils__.getDocumentHeight();
		// 					});
			    
		// 					var _this = this
		// 					, h = 0;

		// 					while(h<documentHeight){
		// 						_this.scrollTo(100, h);
		// 						_this.wait(600);
		// 						h = h + 300;
		// 					}

		// 					return true;
		// 				}, function then(){
				
		// 				});

		// 				spooky.then([{
		// 					m_filePath:m_filePath
		// 				}, function() {
		// 					this.scrollToBottom();
		// 					this.emit('console', m_filePath);
		// 					this.capture(m_filePath);
		// 				}]);

		// 				spooky.run(function(){
		// 					this.emit('complete', true);
		// 				});
		// 			});

		// 			spooky.on('error', function (e, stack) {
		// 				console.error(e);

		// 				if (stack) {
		// 					console.log(stack);
		// 				}
		// 				cb(null, e);
		// 			});

		// 			/*
		// 			// Uncomment this block to see all of the things Casper has to say.
		// 			// There are a lot.
		// 			// He has opinions.
		// 			*/
		// 			spooky.on('console', function (line) {
		// 			    console.log(line);
		// 			});


		// 			spooky.on('hello', function (greeting) {
		// 			    console.log(greeting);
		// 			});

		// 			spooky.on('complete', function (isComplete) {
		// 			    if(isComplete) cb(error_code, '');
		// 			});

		// 			spooky.on('log', function (log) {
		// 			    if (log.space === 'remote') {
		// 			        console.log(log.message.replace(/ \- .*/, ''));
		// 			    }
		// 			});
		// 		},
		// 		function(error_code, cb){
		// 			var spooky = new Spooky({
		// 				child: {
		// 					"transport": "http",
		// 					"ssl-protocol": "tlsv1",
		// 					"ignore-ssl-errors": true
		// 				},
		// 				casper: {
		// 					logLevel: 'debug',
		// 					verbose: true,
		// 					sslProtocol: "tlsv1",
		// 					pageSettings: {
		// 						loadImages:  true,         // The WebPage instance used by Casper 
		// 						loadPlugins: false,         // use these settings
		// 						userAgent: options.useragent.pc
		// 					},
		// 					viewportSize:{
		// 						width:1280, height:1024
		// 					}
		// 				}
		// 			}, function (err) {
		// 				if (err) {
		// 					e = new Error('Failed to initialize SpookyJS');
		// 					e.details = err;
		// 					throw e;
		// 				}

		// 				spooky.start(url);

		// 				spooky.waitFor(function check(){
		// 					documentHeight = this.evaluate(function() {
		// 						return __utils__.getDocumentHeight();
		// 					});
			    
		// 					var _this = this
		// 					, h = 0;

		// 					while(h<documentHeight){
		// 						_this.scrollTo(100, h);
		// 						_this.wait(600);
		// 						h = h + 300;
		// 					}

		// 					return true;
		// 				}, function then(){
				
		// 				});

		// 				spooky.then([{
		// 					pc_filePath:pc_filePath
		// 				}, function() {
		// 					this.scrollToBottom();
		// 					this.emit('console', pc_filePath);
		// 					this.capture(pc_filePath);
		// 				}]);

		// 				spooky.run(function(){
		// 					this.emit('complete', true);
		// 				});
		// 			});

		// 			spooky.on('error', function (e, stack) {
		// 				console.error(e);

		// 				if (stack) {
		// 					console.log(stack);
		// 				}
		// 				cb(null, e);
		// 			});

		// 			/*
		// 			// Uncomment this block to see all of the things Casper has to say.
		// 			// There are a lot.
		// 			// He has opinions.
		// 			*/
		// 			spooky.on('console', function (line) {
		// 			    console.log(line);
		// 			});


		// 			spooky.on('hello', function (greeting) {
		// 			    console.log(greeting);
		// 			});

		// 			spooky.on('complete', function (isComplete) {
		// 			    if(isComplete) cb(error_code, '');
		// 			});

		// 			spooky.on('log', function (log) {
		// 			    if (log.space === 'remote') {
		// 			        console.log(log.message.replace(/ \- .*/, ''));
		// 			    }
		// 			});
		// 		}
		// 	],
		// 	function(result){
		// 		if(result !== null){
		// 			return res.json({ 
		// 				error: result
		// 			});
		// 		}else{
		// 			return res.json({ 
		// 				status: 'OK', 
		// 				url:img_url
		// 			});
		// 		}
		// 	});
		// }else{
			/** Case 
			 * @params : HTTP, isMobile=1
			 */
			async.waterfall([
				function(cb){
					//MOBILE IMAGE
					var sitepage = null;
					var phInstance = null;
					var error_code = null;

					phantom.create()
						.then(instance => {
					        phInstance = instance;
					        return instance.createPage();
					    })
					    .then(page => {
					    	sitepage = page;

					    	if(isSsPreview){
					    		page.property('viewportSize', { width: mobileWidth, height: options.windowSize.height });
					    		page.property('clipRect', { top: 0, left: 0, width: mobileWidth, height: options.windowSize.height });
					    	
					    		page.addCookie(config.phantom.ssCookieInfo);
					    	}
					    	
					    	page.open(url);
					        return page;
					    })
					    .then(page => {
					    	return page.evaluate(function(){
					    		return document.height;
					    	});
					    })
					    .then(height => {
					    	var m_options = options;
					        var img_m_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '_m.' + config.phantom.ext;
							var m_filePath = dirPath + '/' + img_m_name;

					    	// if(isSsPreview){
					    		sitepage.property('viewportSize', { width: mobileWidth, height: height });
					    		sitepage.property('clipRect', { top: 0, left: 0, width: mobileWidth, height: height });
					    		sitepage.reload();
					    		sitepage.render(m_filePath, m_options);
					    		sitepage.close();
						        phInstance.exit();

						        cb(error_code, '');
					   //  	}else{
					   //  		sitepage.close();
						  //       phInstance.exit();

						  //       m_options.windowSize.width = mobileWidth;
						  //       m_options.windowSize.height = height;

						  //       webshot(url, m_filePath, m_options, function(err) {
								// 	if (err){
								// 		error_code = '100';
								// 		cb(null, error_code);
								// 	}
									
								// 	cb(error_code, '');
								// });
					   //  	}						
					    })
					    .catch(error => {
					    	phInstance.exit();
					    	error_code = '400';
							cb(null, error_code);
					    });
				},
				function(error_code, cb){
					//PC IMAGE
					sitepage = null;
					phInstance = null;

					phantom.create()
						.then(instance => {
					        phInstance = instance;
					        return instance.createPage();
					    })
					    .then(page => {
					    	sitepage = page;

					    	if(isSsPreview){
					    		var pc_w = (req.query.w)? req.query.w:1281;
					    		
					    		page.property('viewportSize', { width: pc_w, height: options.windowSize.height });
					    		page.property('clipRect', { top: 0, left: 0, width: pc_w, height: options.windowSize.height });
					    	
					    		page.addCookie(config.phantom.ssCookieInfo);
					    	}

					        page.open(url);
					        return page;
					    })
					    .then(page => {
					    	return page.evaluate(function(){
					    		return document.height;
					    	});
					    })
					    .then(height => {
					    	var img_pc_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '_pc.' + config.phantom.ext;
							var pc_filePath = dirPath + '/' + img_pc_name;
							var pcWidth = (req.query.w)? parseInt(req.query.w):1281;

					    	// if(isSsPreview){
					    		sitepage.property('viewportSize', { width: pcWidth, height: height });
					    		sitepage.property('clipRect', { top: 0, left: 0, width: pcWidth, height: height });
					    		sitepage.reload();
					    		sitepage.render(pc_filePath, options);
					    		sitepage.close();
						        phInstance.exit();

						        cb(error_code, '');
					   //  	}else{
					   //  		sitepage.close();
						  //       phInstance.exit();

						  //       options.windowSize.width = pcWidth;
								// options.windowSize.height = height;

						  //       webshot(url, pc_filePath, options, function(err) {
								// 	if (err){
								// 		error_code = '200';
								// 		cb(null, error_code);
								// 	}
									
								// 	cb(error_code, '');
								// });
					   //  	}

					    	
					    })
					    .catch(error => {
					    	phInstance.exit();
					    	error_code = '400';
							cb(null, error_code);
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
						status: 'OK'
					});
				}
			});
		// }
		
	}else{
	// 	if(isHttps){
	// 		async.waterfall([
	// 			function(cb){
	// 				var error_code = null;
	// 				var spooky = new Spooky({
	// 					child: {
	// 						"transport": "http",
	// 						"ssl-protocol": "tlsv1",
	// 						"ignore-ssl-errors": true
	// 					},
	// 					casper: {
	// 						logLevel: 'debug',
	// 						verbose: true,
	// 						sslProtocol: "tlsv1",
	// 						pageSettings: {
	// 							loadImages:  true,         // The WebPage instance used by Casper 
	// 							loadPlugins: false,         // use these settings
	// 							userAgent: options.useragent.pc
	// 						},
	// 						viewportSize:{
	// 							width:1280, height:1024
	// 						}
	// 					}
	// 				}, function (err) {
	// 					if (err) {
	// 						e = new Error('Failed to initialize SpookyJS');
	// 						e.details = err;
	// 						throw e;
	// 					}

	// 					spooky.start(url);
	// // spooky.start("https://chrome.google.com/webstore/category/apps?utm_source=chrome-ntp-icon");
	// 					spooky.waitFor(function check(){
	// 						documentHeight = this.evaluate(function() {
	// 							return __utils__.getDocumentHeight();
	// 						});
			    
	// 						var _this = this
	// 						, h = 0;

	// 						while(h<documentHeight){
	// 							_this.scrollTo(100, h);
	// 							_this.wait(600);
	// 							h = h + 300;
	// 						}

	// 						return true;
	// 					}, function then(){
				
	// 					});

	// 					spooky.then([{
	// 						filePath:filePath
	// 					}, function() {
	// 						this.scrollToBottom();
	// 						this.emit('console', filePath);
	// 						this.capture(filePath);
	// 					}]);

	// 					spooky.run(function(){
	// 						this.emit('complete', true);
	// 					});
	// 				});

	// 				spooky.on('error', function (e, stack) {
	// 					console.error(e);

	// 					if (stack) {
	// 						console.log(stack);
	// 					}
	// 				});

	// 				/*
	// 				// Uncomment this block to see all of the things Casper has to say.
	// 				// There are a lot.
	// 				// He has opinions.
	// 				*/
	// 				spooky.on('console', function (line) {
	// 				    console.log(line);
	// 				});


	// 				spooky.on('hello', function (greeting) {
	// 				    console.log(greeting);
	// 				});

	// 				spooky.on('complete', function (isComplete) {
	// 				    if(isComplete) cb(error_code, '');
	// 				});

	// 				spooky.on('log', function (log) {
	// 				    if (log.space === 'remote') {
	// 				        console.log(log.message.replace(/ \- .*/, ''));
	// 				    }
	// 				});        
	// 			}
	// 		],
	// 		function(result){
	// 			if(result !== null){
	// 				return res.json({ 
	// 					error: result
	// 				});
	// 			}else{
	// 				return res.json({ 
	// 					status: 'OK', 
	// 					url:img_url
	// 				});
	// 			}
	// 		});
	// 	}else{
			var sitepage = null;
			var phInstance = null;

			phantom.create(['--ignore-ssl-errors=yes', '--ssl-protocol=any', '--load-images=yes'])
			.then(instance => {
		        phInstance = instance;
		        return instance.createPage();
		    })
		    .then(page => {
		    	sitepage = page;

		    	page.property('viewportSize', { width: 1281, height: options.windowSize.height });
		    	page.property('clipRect', { top: 0, left: 0, width: 1281, height: options.windowSize.height });

		    	if(isSsPreview){
		    		page.addCookie(config.phantom.ssCookieInfo);
		    	}
		    	
		        page.open(url);
		        return page;
		    })
		    .then(page => {
		    	return page.evaluate(function(){
		    		return document.height;
		    	});
		    })
		    .then(height => {
		    	// if(isSsPreview){
		   //  		sitepage.property('viewportSize', { width: 1281, height: height });
		   //  		sitepage.property('clipRect', { top: 0, left: 0, width: 1281, height: height });
		   //  		sitepage.reload();
		   //  		sitepage.render(filePath, options);
		   //  		sitepage.close();
			  //       phInstance.exit();

			  //       return res.json({ 
					// 	status: 'OK', 
					// 	url:img_url 
					// });
		    	// }else{
		    		sitepage.property('viewportSize', { width: 1281, height: height });
		    		sitepage.property('clipRect', { top: 0, left: 0, width: 1281, height: height });
		    		sitepage.reload();
		    		sitepage.render(filePath, options);
		    		sitepage.close();
			        phInstance.exit();

			        return res.json({ 
						status: 'OK', 
						url:img_url,
						temp:url
					});

		   //  		sitepage.close();
			  //       phInstance.exit();
			  //       options.windowSize.height = height;

			  //       webshot(url, filePath, options, function(err) {
					// 	if (err){
					// 		res.statusCode = 500;
					// 		log.error('Internal error(%d): %s',res.statusCode,err);

					// 		return res.json({ 
					// 			error: err
					// 		});
					// 	}
						
					// 	return res.json({ 
					// 		status: 'OK', 
					// 		url:img_url 
					// 	});
					// });
		    	// }
		        
		    })
		    .catch(error => {
		    	res.statusCode = 500;
				log.error('Internal error(%d): %s',res.statusCode,error);

				return res.json({ 
					error: error
				});
		        phInstance.exit();
		    });
		// }
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
