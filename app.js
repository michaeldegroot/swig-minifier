// Requires
var htmlminify = require('html-minifier').minify
var swig = require('swig')
var fs = require('fs')
var os = require('os')
var path = require('path')
var redis = require("redis")
var NodeCache = require( "node-cache" )
var sha256 = require('sha256')
var sha512 = require('sha512')
var md5 = require('md5')

// Variable settings
var myCache = new NodeCache({ stdTTL: 0, checkperiod: 120 })
var definedRedis = false
swig.setDefaults({ cache: false });
var options
var client
var hashGen

// On require create a swig-minifier tmp dir
var folder = path.join(os.tmpdir(),"swig-minifier")
fs.existsSync(folder) || fs.mkdirSync(folder)

// API - this can be called from the outside scope of this module
exports.defineRedis = function(){
	client = redis.createClient()
	if(options.redis) client = redis.createClient(options.redis)
}

exports.init = function(sets){
	options = sets
	if(!sets) sets = {}
	if(!sets.cacheType) sets.cacheType = "file"
	if(!sets.hashGen) sets.hashGen = "sha256"
	if(sets.cacheType!="memory" && sets.cacheType!="file" && sets.cacheType!="redis" && sets.cacheType!="none") throw new Error('Unknown cacheType: '+options.cacheType)
	if(sets.hashGen){
		if(sets.hashGen=="sha512") hashGen = sha512
		if(sets.hashGen=="md5") hashGen = md5
		if(sets.hashGen=="sha256") hashGen = sha256
	}
	if(sets.cacheFolder){
		folder = path.normalize(sets.cacheFolder)
		fs.existsSync(folder) || fs.mkdirSync(folder)
	}
	if(sets.redis) exports.defineRedis()
	return true
}

exports.clearCache = function(cb){
	if(options.cacheType=="file"){
		fs.readdirSync(path.join(os.tmpdir(),"swig-minifier")).forEach(function(file) {
			fs.unlinkSync(path.join(os.tmpdir(),"swig-minifier",file))
		})
		if(cb) cb(true,null)
	}
	if(options.cacheType=="memory"){
		myCache.flushAll()
		if(cb) cb(true,null)
	}
	if(options.cacheType=="redis"){
		exports.defineRedis()
		client.flushall( function (err,val) {
			if(cb) cb(true,err)
		})
	}
	if(options.cacheType=="none" && cb) cb(true,null)
}

// Works with app.engine this triggers the cache request, file create
exports.engine = function(pathName, locals, cb) {
    return swig.renderFile(pathName, locals, function(err,result){
		if(err) cb(err,false)
		
		// If we don't want cache
		if(options.cacheType=="none") return cb(err, minify(result))
		
		// Hash generation
		var key = exports.hashGen(pathName,locals)
		
		// File, redis and memory cacheStores
		if(options.cacheType=="file") exports.fileStore(key, result, cb)
		if(options.cacheType=="redis") exports.redisStore(key, result, cb)
		if(options.cacheType=="memory") exports.memoryStore(key, result, cb)
		
		return true
	})
}

// Hash generation for cache key
exports.hashGen = function(pathName,locals){
	var localsStripped = locals
	localsStripped.settings = ""
	var hash = pathName + "___" + JSON.stringify(localsStripped)
	var key = hashGen(hash)
	if(options.hashGen=="sha512") key = key.toString('hex')
	key = "sm_" + key
	return key
}

exports.min = function(result){
	return minify(result)
}

// File cache storage
exports.fileStore = function(key, result, cb){
	var cacheFolder = path.join(os.tmpdir(),"swig-minifier")
	if(options.cacheFolder) cacheFolder = options.cacheFolder
	var file = path.join(cacheFolder,key+".html")
	fs.readFile(file, function(err,data){
		if(!err) return cb(err, data.toString('utf8'))
		if(err.code != 'ENOENT') throw new Error(err)
		html = minify(result)
		fs.writeFile(file, html, function(err) {
			if(!err) return cb(err, html)
			throw new Error(err)
		}) 
	})
}

// Memory cache storage
exports.memoryStore = function(key, result, cb){
	myCache.get(key, function(err, value){
		if(err) throw new Error(err)
		if(value) return cb(err, value)
		html = minify(result)
		myCache.set(key, html, 0)
		return cb(err, html)
	})
}

// Redis cache storage
exports.redisStore = function(key, result, cb){
	exports.defineRedis()
	client.get(key, function(err, value) {
		if(err) throw new Error(err)
		if(value) return cb(err, value)
		html = minify(result)
		client.set(key,html)
		return cb(err, html)
	})
}


// Html-minify wrapper
minify = function(result){
	return htmlminify(result, {minifyJS: true, minifyCSS: true, removeComments: true, collapseWhitespace: true})
}

exports.module = exports