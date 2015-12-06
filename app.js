// Requires
var htmlminify = require('html-minifier').minify;
var swig = require('swig');
var fs = require('fs');
var os = require('os');
var path = require('path');
var redis = require("redis");
var NodeCache = require( "node-cache" );
var hashGen = require('sha256');

// Variable settings
var myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });
var definedRedis = false;
var options;
var client;

// On require create a swig-minifier tmp dir
var folder = path.join(os.tmpdir(),"swig-minifier");
fs.existsSync(folder) || fs.mkdirSync(folder);

// API - this can be called from the outside scope of this module
exports.init = function(sets){
	options = sets;
	if(sets.cacheType!="memory" && sets.cacheType!="file" && sets.cacheType!="redis" && sets.cacheType!="none") throw "Unknown cacheType: '"+options.cacheType+"'";
	if(sets.hashGen){
		if(sets.hashGen=="sha512") hashGen = require('sha512');
		if(sets.hashGen=="md5") hashGen = require('md5');
	}
}

exports.clearCache = function(){
	defineCache();
	if(options.cacheType=="file"){
		fs.readdirSync(path.join(os.tmpdir(),"swig-minifier")).forEach(function(file) {
			fs.unlinkSync(path.join(os.tmpdir(),"swig-minifier",file));
		});
	}
	if(options.cacheType=="memory"){
		myCache.flushAll();
	}
	if(options.cacheType=="redis"){
		defineRedis();
		client.flushall( function (err,val) {
			if(err) throw err;
		});
	}
}

exports.engine = function(pathName, locals, cb) {
    return swig.renderFile(pathName, locals, function(err,result){
		if(err) throw err;
		defineCache();
		
		// If we don't want cache
		if(options.cacheType=="none") return cb(err, minify(result));
		
		// Hash generation
		var localsStripped = locals;
		localsStripped.settings = "";
		var hash = pathName + "___" + JSON.stringify(localsStripped);
		var key = hashGen(hash);
		if(options.hashGen=="sha512") key = key.toString('hex');
		
		// File, redis and memory cacheStores
		if(options.cacheType=="file") fileStore(key, result, cb);
		if(options.cacheType=="redis") redisStore(key, result, cb);
		if(options.cacheType=="memory") memoryStore(key, result, cb);
	});
};

// Internal functions

// File cache storage
fileStore = function(key, result, cb){
	var file = path.join(os.tmpdir(),"swig-minifier",key+".html");
	fs.readFile(file, function(err,data){
		if(!err) return cb(err, data.toString('utf8'));
		if(err.code != 'ENOENT') throw err;
		html = minify(result);
		fs.writeFile(file, html, function(err) {
			if(!err) return cb(err, html);
			throw err;
		}); 
	});
}

// Memory cache storage
memoryStore = function(key, result, cb){
	myCache.get(key, function(err, value){
		if(err) throw err;
		if(value) return cb(err, value);
		html = minify(result);
		myCache.set(key, html, 0);
		return cb(err, html);
	});
}

// Redis cache storage
redisStore = function(key, result, cb){
	defineRedis();
	client.get(key, function(err, value) {
		if(err) throw err;
		if(value) return cb(err, value);
		html = minify(result);
		client.set(key,html);
		return cb(err, html);
	});
}

// Make sure redis is defined
defineRedis = function(){
	if(!definedRedis){
		client = redis.createClient();
		client.on("error", function (err) { throw err;});
		definedRedis = true;
	}
}

// Make sure init was called
defineCache = function(){
	if(!options) exports.init({cacheType:"file",hashGen:"sha256"})
}

// html-minify module :)
minify = function(result){
	return htmlminify(result, {minifyJS: true, minifyCSS: true, removeComments: true, collapseWhitespace: true});
}

exports.module = exports;