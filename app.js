var htmlminify = require('html-minifier').minify;
var swig = require('swig');
var md5 = require('md5');
var fs = require('fs');
var os = require('os');
var path = require('path');
var NodeCache = require( "node-cache" );
var myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

var options;

exports.init = function(sets){
	var folder = path.join(os.tmpdir(),"swig-minifier");
	fs.existsSync(folder) || fs.mkdirSync(folder);
	
	options = sets;
}

exports.minify = function(result){
	return htmlminify(result, {minifyJS: true, minifyCSS: true, removeComments: true, collapseWhitespace: true});
}

exports.engine = function(pathName, locals, cb) {
    function cb_(err, result) {
		if(err) throw err;
		if(!options.cacheType){
			options.cacheType = "file";
		}
        var html;
		var key = md5(result);
		
		if(options.cacheType=="memory"){
			myCache.get(key, function(err, value){
				if(!err){
					if(val){
						return cb(err, val);
					}else{
						html = exports.minify(result);
						myCache.set(key, html, 0);
						return cb(err, html);
					}
				}else{
					throw err;
				}
			});
		}
		if(options.cacheType=="file"){
			var file = path.join(os.tmpdir(),"swig-minifier",key+".html");
			
			fs.stat(file, function(err, stat) {
				if(err == null) {
					fs.readFile(file, function(err,data){
						if(err) throw err;
						return cb(err, data.toString('utf8'));
					});
				} else if(err.code == 'ENOENT') {
					html = exports.minify(result);
					fs.writeFile(file, html, function(err) {
						if(err){
							if(err.code == "ENOENT"){
								throw "ERROR: swig-minifier - Call the .init function before calling the .engine function. Check the documentation at NPM on how to use swig-minifier";
							}
							throw err;
						}
						return cb(err, html);
					}); 
				} else {
					throw err;
				}
			});
		}
    }
    return swig.renderFile(pathName, locals, cb_);
};

exports.module = exports;