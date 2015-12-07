var express = require('express');
var app = require('express')();
var request = require('request');
var swigMinifier = require('./app');

console.log("SWIG-MINIFIER TEST");
testPassed = false;

var testCache = "file";
var hash = "sha512";

swigMinifier.init({cacheType:testCache,hashGen:hash});

app.engine('html', swigMinifier.engine);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
	res.render('test',{cacheType:testCache,hashGen:hash});
});

var request = require('request');
request('http://127.0.0.1:3000', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		if(body!="<!--- Minified --->") testPassed = true;
	}
})

setInterval(function(){
	if(testPassed == true){
		console.log("TEST PASSED.");
		process.exit();
	}
},1000);

var server = app.listen(3000);