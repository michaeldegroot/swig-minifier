var htmlminify = require('html-minifier').minify;
var swig = require('swig');
var fs = require('fs');
var os = require('os');
var path = require('path');
var redis = require("redis");
var NodeCache = require( "node-cache" );
var hashGen = require('sha256');

var myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });
var definedRedis = false;
var options;
var client;

var folder = path.join(os.tmpdir(),"swig-minifier");
fs.existsSync(folder) || fs.mkdirSync(folder);

exports.init = function(sets){
	options = sets;
	if(sets.cacheType!="memory" && sets.cacheType!="file" && sets.cacheType!="redis" && sets.cacheType!="none") throw "Unknown cacheType: '"+options.cacheType+"'";
	if(sets.hashGen){
		if(sets.hashGen=="sha512") hashGen = require('sha512');
		if(sets.hashGen=="md5") hashGen = require('md5');
	}
}

exports.defineRedis = function(){
	if(!definedRedis){
		client = redis.createClient();
		client.on("error", function (err) { throw err;});
		definedRedis = true;
	}
}

exports.defineCache = function(){
	if(!options) exports.init({cacheType:"file",hashGen:"sha256"})
}

exports.minify = function(result){
	return htmlminify(result, {minifyJS: true, minifyCSS: true, removeComments: true, collapseWhitespace: true});
}

exports.clearCache = function(){
	exports.defineCache();
	if(options.cacheType=="file"){
		fs.readdirSync(path.join(os.tmpdir(),"swig-minifier")).forEach(function(file) {
			fs.unlinkSync(path.join(os.tmpdir(),"swig-minifier",file));
		});
	}
	if(options.cacheType=="memory"){
		myCache.flushAll();
	}
	if(options.cacheType=="redis"){
		exports.defineRedis();
		client.flushall( function (err,val) {
			if(err) throw err;
		});
	}
}

exports.engine = function(pathName, locals, cb) {
    return swig.renderFile(pathName, locals, function(err,result){
		if(err) throw err;
		exports.defineCache();
		
		var html;
		var localsStripped = locals;
		localsStripped.settings = "";
		
		if(options.cacheType=="none"){
			html = exports.minify(result);
			return cb(err, html);
		}
		
		var hash = pathName + "___" + JSON.stringify(localsStripped);
		var key = hashGen(hash);
		if(options.hashGen=="sha512") key = key.toString('hex');
		
		if(options.cacheType=="file"){
			var file = path.join(os.tmpdir(),"swig-minifier",key+".html");
			fs.readFile(file, function(err,data){
				if(!err) return cb(err, data.toString('utf8'));
				if(err.code != 'ENOENT') throw err;
				html = exports.minify(result);
				fs.writeFile(file, html, function(err) {
					if(!err) return cb(err, html);
					throw err;
				}); 
			});
		}
		if(options.cacheType=="redis"){
			exports.defineRedis();
			client.get(key, function(err, value) {
				if(err) throw err;
				if(value) return cb(err, value);
				html = exports.minify(result);
				client.set(key,html);
				return cb(err, html);
			});
		}
		if(options.cacheType=="memory"){
			myCache.get(key, function(err, value){
				if(err) throw err;
				if(value) return cb(err, value);
				html = exports.minify(result);
				myCache.set(key, html, 0);
				return cb(err, html);
			});
		}
	});
};

exports.module = exports;