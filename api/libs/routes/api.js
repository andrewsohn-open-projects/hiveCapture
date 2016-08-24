var express = require('express')
, router = express.Router()
, fs = require('fs')
, phantom = require('phantom')
, zipdir = require('zip-dir')
, libs = process.cwd() + '/libs/'
, webshot = require(libs + 'webshot/webshot')
, config = (require('../config'))['stores']['file']['store']
, async = require("async");

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

	if(req.query.isMobile && req.query.isMobile == "1"){
		var isSsPreview = (new RegExp('preview4.samsung.com')).test(url);
		var mobileWidth = (req.query.mobileWidth)? parseInt(req.query.mobileWidth):360;

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
				    	
				    		page.addCookie({
							  'name'     : 'IW_AUTHENTICATION.P4',
							  'value'    : '52616e646f6d495648920b3fc0e85135ce07694dbe3f38bf673795911a6c81e6aeded00adbe0ca98c4e2a346260089ef15e856b27eec64d965dae31a8e018935050c7bf08f3c4d7e403ea48c477e0eb6902d16941173f0ddb1e8ded04b14f54a1b97b0bd704128ab380384bba0ae591c',
							  'domain'   : 'samsung.com'
							});
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

				    	if(isSsPreview){
				    		sitepage.property('viewportSize', { width: mobileWidth, height: height });
				    		sitepage.property('clipRect', { top: 0, left: 0, width: mobileWidth, height: height });
				    		sitepage.reload();
				    		sitepage.render(m_filePath, m_options);
				    		sitepage.close();
					        phInstance.exit();

					        cb(error_code, '');
				    	}else{
				    		sitepage.close();
					        phInstance.exit();

					        m_options.windowSize.width = mobileWidth;
					        m_options.windowSize.height = height;

					        webshot(url, m_filePath, m_options, function(err) {
								if (err){
									error_code = '100';
									cb(null, error_code);
								}
								
								cb(error_code, '');
							});
				    	}

				    	
						
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
				    	
				    		page.addCookie({
							  'name'     : 'IW_AUTHENTICATION.P4',
							  'value'    : '52616e646f6d495648920b3fc0e85135ce07694dbe3f38bf673795911a6c81e6aeded00adbe0ca98c4e2a346260089ef15e856b27eec64d965dae31a8e018935050c7bf08f3c4d7e403ea48c477e0eb6902d16941173f0ddb1e8ded04b14f54a1b97b0bd704128ab380384bba0ae591c',
							  'domain'   : 'samsung.com'
							});
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

				    	if(isSsPreview){
				    		sitepage.property('viewportSize', { width: pcWidth, height: height });
				    		sitepage.property('clipRect', { top: 0, left: 0, width: pcWidth, height: height });
				    		sitepage.reload();
				    		sitepage.render(pc_filePath, options);
				    		sitepage.close();
					        phInstance.exit();

					        cb(error_code, '');
				    	}else{
				    		sitepage.close();
					        phInstance.exit();

					        options.windowSize.width = pcWidth;
							options.windowSize.height = height;

					        webshot(url, pc_filePath, options, function(err) {
								if (err){
									error_code = '200';
									cb(null, error_code);
								}
								
								cb(error_code, '');
							});
				    	}

				    	
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
	}else{
		var sitepage = null;
		var phInstance = null;
		var isSsPreview = (new RegExp('preview4.samsung.com')).test(url);

		phantom.create()
			.then(instance => {
		        phInstance = instance;
		        return instance.createPage();
		    })
		    .then(page => {
		    	sitepage = page;

		    	if(isSsPreview){
		    		page.property('viewportSize', { width: 1281, height: options.windowSize.height });
		    		page.property('clipRect', { top: 0, left: 0, width: 1281, height: options.windowSize.height });
		    	
		    		page.addCookie({
					  'name'     : 'IW_AUTHENTICATION.P4',
					  'value'    : '52616e646f6d495648920b3fc0e85135ce07694dbe3f38bf673795911a6c81e6aeded00adbe0ca98c4e2a346260089ef15e856b27eec64d965dae31a8e018935050c7bf08f3c4d7e403ea48c477e0eb6902d16941173f0ddb1e8ded04b14f54a1b97b0bd704128ab380384bba0ae591c',
					  'domain'   : 'samsung.com'
					});
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
		    	if(isSsPreview){
		    		sitepage.property('viewportSize', { width: 1281, height: height });
		    		sitepage.property('clipRect', { top: 0, left: 0, width: 1281, height: height });
		    		sitepage.reload();
		    		sitepage.render(filePath, options);
		    		sitepage.close();
			        phInstance.exit();

			        return res.json({ 
						status: 'OK', 
						url:img_url 
					});
		    	}else{
		    		sitepage.close();
			        phInstance.exit();
			        options.windowSize.height = height;

			        webshot(url, filePath, options, function(err) {
						if (err){
							res.statusCode = 500;
							log.error('Internal error(%d): %s',res.statusCode,err);

							return res.json({ 
								error: err
							});
						}
						
						return res.json({ 
							status: 'OK', 
							url:img_url 
						});
					});
		    	}
		        
		    })
		    .catch(error => {
		    	res.statusCode = 500;
				log.error('Internal error(%d): %s',res.statusCode,error);

				return res.json({ 
					error: error
				});
		        phInstance.exit();
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
