var express = require('express');
var app = require('express')();
var swigMinifier = require('./app');

swigMinifier.init({cacheType:"redis"});

app.engine('html', swigMinifier.engine);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
	res.render('test');
});

var server = app.listen(3000);