var express = require('express');
var app = require('express')();
var request = require('request');
var swigMinifier = require('../app');
var os = require('os');
var express = require('express');
var app = require('express')();
var request = require('request');
var assert = require('assert');
var assert = require('assert-plus');
var path = require('path');
var fs = require('fs');

app.engine('html', swigMinifier.engine);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
	res.render('test.html');
});

var htmlContent = makeid();

fs.readdirSync(path.join(os.tmpdir(),"swig-minifier")).forEach(function(file) {
	if(file=="test.html") fs.unlinkSync(path.join(os.tmpdir(),"swig-minifier",file));
});
fs.readdirSync(os.tmpdir()).forEach(function(file) {
	if(file=="test.html") fs.unlinkSync(path.join(os.tmpdir(),file));
});

var server = app.listen(3000);
 
describe('html-minifier', function() {
	it('Minifying', function() {
		assert.equal(swigMinifier.min("<!--- Html comment should be removed -->"), "");
	});
});

describe("Extras", function(){
	it('call clearCache without callback', function() {
		assert.doesNotThrow(function() {
			swigMinifier.clearCache();
		},SyntaxError);
	});
});

describe("Init", function(){
	it('Call init with no options', function() {
		assert.equal(swigMinifier.init(), true);
	});
	it('set redis options', function() {
		assert.equal(swigMinifier.init({
			redis:{
				host:"127.0.0.1",
				port:6370
			}
		}), true);
	});
	it('set hashGen to md5', function() {
		assert.equal(swigMinifier.init({hashGen:"md5"}), true);
	});
	it('set hashGen to sha256', function() {
		assert.equal(swigMinifier.init({hashGen:"sha256"}), true);
	});
	it('set hashGen to sha512', function() {
		assert.equal(swigMinifier.init({hashGen:"sha512"}), true);
	});
	it('set cacheType to file', function() {
		assert.equal(swigMinifier.init({cacheType:"file"}), true);
	});
	it('set cacheType to memory', function() {
		assert.equal(swigMinifier.init({cacheType:"memory"}), true);
	});
	it('set cacheType to redis', function() {
		assert.equal(swigMinifier.init({cacheType:"redis"}), true);
	});
	it('set cacheType to none', function() {
		assert.equal(swigMinifier.init({cacheType:"none"}), true);
	});
	it('set cacheFolder', function() {
		assert.equal(swigMinifier.init({cacheFolder:os.tmpdir()}), true);
	});
});

describe("Hash Generation", function(){
	it('md5', function() {
		swigMinifier.init({hashGen:"md5"});
		var key = swigMinifier.hashGen("test","test");
		assert.equal(key.length, 35);
	});
	it('sha256', function() {
		swigMinifier.init({hashGen:"sha256"});
		var key = swigMinifier.hashGen("test","test");
		assert.equal(key.length, 67);
	});
	it('sha512', function() {
		swigMinifier.init({hashGen:"sha512"});
		var key = swigMinifier.hashGen("test","test");
		assert.equal(key.length, 131);
	});
});

describe("Redis Cache", function(){
	it('Clear the cache', function(done) {
		swigMinifier.init({cacheType:"redis"});
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
	
	it('Insert cache key', function() {
		swigMinifier.init({cacheType:"redis"});
		swigMinifier.redisStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
		});
	});
	
	it('Retrieve cache key', function() {
		swigMinifier.init({cacheType:"redis"});
		swigMinifier.redisStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
		});
	});
});

describe("Memory Cache", function(){
	swigMinifier.init({cacheType:"none"});
	it('Clear the cache', function(done) {
		swigMinifier.init({cacheType:"memory"});
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
	
	it('Insert cache key', function() {
		swigMinifier.init({cacheType:"memory"});
		swigMinifier.memoryStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
		});
	});
	
	it('Retrieve cache key', function() {
		swigMinifier.init({cacheType:"memory"});
		swigMinifier.memoryStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
		});
	});
});

describe("No cache", function(){
	swigMinifier.init({cacheType:"none"});
	
	it('Clear the cache', function(done) {
		swigMinifier.init({cacheType:"none"});
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
});

describe("File Cache", function(){
	swigMinifier.init({cacheType:"file"});
	
	it('Clear the cache', function(done) {
		swigMinifier.init({cacheType:"file"});
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
	
	it('Setup express', function(done) {
		swigMinifier.init({cacheType:"file"});
		request('http://127.0.0.1:3000', function (error, response, body) {
			if(error) throw error;
			assert.equal(body, "");
			done();
		})
	});
	
	it('Insert cache key', function() {
		swigMinifier.init({cacheType:"file"});
		swigMinifier.fileStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
		});
	});
	
	it('Retrieve cache key', function() {
		swigMinifier.init({cacheType:"file"});
		swigMinifier.fileStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
		});
	});
	
	it('Setup custom cache folder', function(done) {
		swigMinifier.init({cacheType:"file",cacheFolder:os.tmpdir()});
		swigMinifier.fileStore("test", "<!--- html comment should be removed -->"+htmlContent, function(err,html){
			assert.equal(html, htmlContent);
			done();
		});
	});
	
	it('Verifying custom cache folder location and file', function() {
		swigMinifier.init({cacheType:"file",cacheFolder:os.tmpdir()});
		var foundFile = false;
		fs.readdirSync(path.join(os.tmpdir())).forEach(function(file) {
			if(file=="test.html") foundFile = true;
		});
		assert.equal(foundFile,true);
	});
});



describe("Error Handling", function(){
	it('Wrong cacheType specified', function(){
		assert.throws(function(){
			swigMinifier.init({cacheType:"wrong"})
		},Error);
	});
});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 1555; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}