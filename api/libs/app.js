var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var libs = process.cwd() + '/libs/';

var config = require('./config');
var log = require('./log')(module);

var test = require('./routes/test');
var api = require('./routes/api');
var uuid = require('./routes/uuid');
var download = require('./routes/download');
// var users = require('./routes/users');
// var articles = require('./routes/articles');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());

app.use('/', test);
app.use('/api', api);
app.use('/uuid', uuid);
app.use('/download', download);
app.use(express.static('public'));
// app.use('/api/users', users);
// app.use('/api/articles', articles);
// app.use('/api/oauth/token', oauth2.token);

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ 
    	error: 'Not found' 
    });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({ 
    	error: err.message 
    });
    return;
});

module.exports = app;
