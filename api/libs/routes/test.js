var express = require('express');
// var passport = require('passport');
var router = express.Router();

try {
    var Spooky = require('spooky');
} catch (e) {
    var spookyPath = process.cwd() + '/node_modules/spooky/lib/spooky';
    var Spooky = require( spookyPath );
}

/* GET users listing. */
router.get('/', function (req, res) {
    res.json({
     msg: 'API is running'
    });
});

module.exports = router;

