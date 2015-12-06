var express = require('express');
var app = require('express')();
var swigMinifier = require('./app');

console.log("\n\nStarting swig-minifier test\n\n");

var testCache = "file";

swigMinifier.init({cacheType:testCache,hashGen:"md5"});

app.engine('html', swigMinifier.engine);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
	res.render('test',{cacheType:testCache});
});

var html = "<!DOCTYPE html> <html>  <body>  <h1>Test swig-minifier</h1>   <p>This should be minified</p><style>p{ color: red; }</style>  </body>  </html>";
console.log("--------------------------Unminified Html------------------------");
console.log(html);
console.log("--------------------------Minified Html------------------------");
console.log(swigMinifier.minify(html));

console.log("\n\n\n Webserver running at 127.0.0.1:3000");

var server = app.listen(3000);