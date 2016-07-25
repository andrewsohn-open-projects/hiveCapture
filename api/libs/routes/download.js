var express = require('express');
var router = express.Router();
var fs = require('fs'),
	path = require('path'),
    mime = require('mime'),
    rmdirAsync = require('../utill/rmdirAsync'), 
    async = require("async");

var config = (require('../config'))['stores']['file']['store'];

/* GET Download Single Image file API. */
router.get('/image', function (req, res) {
	if(!req.query.uuid){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	if(!req.query.img){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	var imgPath = config.phantom.destPath + req.query.uuid + '/' + req.query.img;

	fs.stat(imgPath, function(err, stat){
		if(err == null){
			var filename = path.basename(imgPath),
		        mimetype = mime.lookup(imgPath);
		  
		    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		    res.setHeader('Content-type', mimetype);
		  
		    var filestream = fs.createReadStream(imgPath);
		    filestream.pipe(res);
		}else if(err.code == 'ENOENT'){
			return res.json({ 
				error: 'image not existed' 
			});
		}else{
			return res.json({ 
				error: err.code
			});
		}
	});
});

/* GET Download Zipped file API. */
router.get('/zip', function (req, res) {
	if(!req.query.uuid){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	var zipPath = config.phantom.destPath + req.query.uuid + '.zip';

	fs.stat(zipPath, function(err, stat){
		if(err == null){
			var filename = path.basename(zipPath),
		        mimetype = mime.lookup(zipPath);
		  
		    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		    res.setHeader('Content-type', mimetype);
		  
		    var filestream = fs.createReadStream(zipPath);
		    filestream.pipe(res);
		}else if(err.code == 'ENOENT'){
			return res.json({ 
				error: 'file not existed' 
			});
		}else{
			return res.json({ 
				error: err.code
			});
		}
	});
});

/* GET delete Zipped file and images when its done downloading API. */
router.get('/delete', function (req, res) {
	if(!req.query.uuid){
		return res.json({ 
			error: 'imporper request' 
		});
	}

	var dirPath = config.phantom.destPath + req.query.uuid;
	var zipPath = dirPath + '.zip';
	
	if (fs.existsSync(dirPath)){
		async.waterfall([
			function(cb){
				rmdirAsync(dirPath, function(err) {
					cb(null, '');
				});
			},
			function(error_code, cb){
				fs.stat(zipPath, function(err1, stat){
					if(err1 == null){
						fs.unlink(zipPath, function(err2) {
							if (err2) {
								error_code = '501'
							}

							cb(null, error_code);
						});
					}else if(err1.code == 'ENOENT'){
						error_code = '404';
						cb(null, error_code);
					}else{
						error_code = '500';
						cb(null, error_code);
					}
				});
			}
		],
		function(err, result){
			if(result !== ''){
				return res.json({ 
					error: result
				});
			}else{
				return res.json({ 
					status: 'OK'
				});
			}
		});
	}
});

module.exports = router;
