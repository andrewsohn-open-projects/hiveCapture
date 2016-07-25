var express = require('express');
var router = express.Router();
var uuid = require('uuid');
// var libs = process.cwd() + '/libs/';
// var webshot = require(libs + 'webshot/webshot');

var config = require('../config');

/* GET uuid generated */
router.get('/', function (req, res) {
	res.json({
			'uuid': uuid.v1()
	});
});

module.exports = router;
