var express = require('express');
var app = require('express')();
var request = require('request');
var swigMinifier = require('../app');
var os = require('os');
var express = require('express');
var app = require('express')();
var request = require('request');
var assert = require('assert');

app.engine('html', swigMinifier.engine);
app.set('view engine', 'html');
app.set('views', __dirname);

app.get('/', function (req, res) {
	res.render('test.html');
});

var server = app.listen(3000);
 
describe('html-minifier', function() {
	it('Minifying', function() {
		assert.equal(swigMinifier.min("<!--- Html comment should be removed -->"), "");
	});
});

describe("Init", function(){
	it('Call init with no options', function() {
		assert.equal(swigMinifier.init(), true);
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

describe("File Cache", function(){
	swigMinifier.init({cacheType:"file"});
	
	it('Clear the cache', function(done) {
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
	
	it('Setup custom cache folder', function(done) {
		swigMinifier.init({cacheType:"file",cacheFolder:os.tmpdir()});
		swigMinifier.fileStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
			done();
		});
	});
	
	it('Setup express', function(done) {
		request('http://127.0.0.1:3000', function (error, response, body) {
			if(error) throw error;
			assert.equal(body, "");
			done();
		})
	});
	
	it('Insert cache key', function() {
		swigMinifier.fileStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
		});
	});
	
	it('Retrieve cache key', function() {
		swigMinifier.fileStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
		});
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
		swigMinifier.redisStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
		});
	});
	
	it('Retrieve cache key', function() {
		swigMinifier.redisStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
		});
	});
});

describe("Memory Cache", function(){
	it('Clear the cache', function(done) {
		swigMinifier.init({cacheType:"memory"});
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
	
	it('Insert cache key', function() {
		swigMinifier.memoryStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
		});
	});
	
	it('Retrieve cache key', function() {
		swigMinifier.memoryStore("test", "<!--- html comment should be removed -->", function(err,html){
			assert.equal(html, "");
		});
	});
});

describe("No cache", function(){
	swigMinifier.init({cacheType:"none"});
	
	it('Clear the cache', function(done) {
		swigMinifier.clearCache(function(result){
			assert.equal(result, true);
			done();
		});
	});
});
