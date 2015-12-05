var htmlminify = require('html-minifier').minify;
var swig = require('swig');
var md5 = require('md5');
var fs = require('fs');
var os = require('os');
var path = require('path');
var redis = require("redis"), client = redis.createClient();
client.on("error", function (err) { throw err;});
var NodeCache = require( "node-cache" );
var myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });
var options;

exports.init = function(sets){
	var folder = path.join(os.tmpdir(),"swig-minifier");
	fs.existsSync(folder) || fs.mkdirSync(folder);
	options = sets;
	if(!sets.dontPurge) exports.clearCache();
}

exports.minify = function(result){
	return htmlminify(result, {minifyJS: true, minifyCSS: true, removeComments: true, collapseWhitespace: true});
}

exports.clearCache = function(){
	if(!options.cacheType) options.cacheType = "file";
    fs.readdirSync(path.join(os.tmpdir(),"swig-minifier")).forEach(function(file) {
        fs.unlinkSync(path.join(os.tmpdir(),"swig-minifier",file));
	});
}

exports.engine = function(pathName, locals, cb) {
    return swig.renderFile(pathName, locals, function(err,result){
		if(err) throw err;
		if(!options.cacheType) options.cacheType = "file";
        var html;
		var key = md5(result);
		if(options.cacheType=="file"){
			var file = path.join(os.tmpdir(),"swig-minifier",key+".html");
			fs.readFile(file, function(err,data){
				if(!err) return cb(err, data.toString('utf8'));
				if(err.code != 'ENOENT') throw err;
				html = exports.minify(result);
				fs.writeFile(file, html, function(err) {
					if(!err) return cb(err, html);
					if(err.code == "ENOENT"){
						throw "ERROR: swig-minifier - Call the .init function before calling the .engine function. Check the documentation at NPM on how to use swig-minifier";
					}
					throw err;
				}); 
			});
			return;
		}
		if(options.cacheType=="redis"){
			client.get(key, function(err, value) {
				if(err) throw err;
				if(value) return cb(err, value);
				html = exports.minify(result);
				client.set(key,html);
				return cb(err, html);
			});
			return;
		}
		if(options.cacheType=="memory"){
			myCache.get(key, function(err, value){
				if(err) throw err;
				if(value) return cb(err, value);
				html = exports.minify(result);
				myCache.set(key, html, 0);
				return cb(err, html);
			});
			return;
		}
		
		throw "ERROR: swig-minifier - Unknown cacheType: '"+options.cacheType+"'";
	});
};

exports.module = exports;