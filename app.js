var htmlminify = require('html-minifier').minify;
var swig = require('swig');
var md5 = require('md5');
var fs = require('fs');
var os = require('os');
var NodeCache = require( "node-cache" );
var myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

var options = {};

exports.init = function(sets){
	options = sets;
}

exports.engine = function(pathName, locals, cb) {
    function cb_(err, result) {
		if(err) throw err;
		if(!options.cacheType){
			options.cacheType = "file";
		}
        var html;
		var cacheExists = false;
		var key = md5(result);
		
		if(options.cacheType=="memory"){
			myCache.get(key, function(err, value){
				if(!err){
					if(value == undefined){
						val = false;
					}else{
						val = value;
					}
					if(val){
						var cacheExists = true;
						return cb(err, val);
					}else{
						if (!err) {
							html = htmlminify(result, {
								minifyJS: true,
								minifyCSS: true,
								removeComments: true,
								collapseWhitespace: true,
							});
						}
						myCache.set(key, html, 0);
						return cb(err, html);
					}
				}
			});
		}
		if(options.cacheType=="file"){
			var tmp = os.tmpdir();
			var path = tmp + "/"+key+".html";
			
			fs.stat(path, function(err, stat) {
				if(err == null) {
					var cacheExists = true;
					fs.readFile(path, function(err,data){
						if(err) throw err;
						return cb(err, data.toString('utf8'));
					});
				} else if(err.code == 'ENOENT') {
					html = htmlminify(result, {
						minifyJS: true,
						minifyCSS: true,
						removeComments: true,
						collapseWhitespace: true,
					});
					fs.writeFile(path, html, function(err) {
						if(err) throw err;
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