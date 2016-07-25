var express = require('express');
var router = express.Router();
var fs = require('fs');
var zipdir = require('zip-dir');
var libs = process.cwd() + '/libs/';
var webshot = require(libs + 'webshot/webshot');

var config = (require('../config'))['stores']['file']['store'];

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
			width: 1024,
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
	
	domain_name = domain_name.replace('/', '_');

	var img_name = req.query.prefix + '_' + req.query.order + '_' + domain_name + '.' + config.phantom.ext;
	var filePath = dirPath + '/' + img_name;
	var img_url = req.headers.host + config.phantom.uploadPath + req.query.uuid + '/' + img_name;

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
		// return res.json({
		// 	"capture":"yes!",
		// 	"param": req.query,
		// 	"dir":dirPath,
		// 	"file":filePath,
		// 	"img_url":img_url
		// });
	});
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
			zipName:zipName
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
