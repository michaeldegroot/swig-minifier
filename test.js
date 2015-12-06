var express = require('express');
var app = require('express')();
var swigMinifier = require('./app');

console.log("Starting swig-minifier test");

var testCache = "none";
var hash = "sha512";

swigMinifier.init({cacheType:testCache,hashGen:hash});

app.engine('html', swigMinifier.engine);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
	res.render('test',{cacheType:testCache,hashGen:hash});
});

console.log("Webserver running at 127.0.0.1:3000");

var server = app.listen(3000);