[![](https://nodei.co/npm/swig-minifier.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/swig-minifier)   
[![](https://david-dm.org/michaeldegroot/swig-minifier.svg "deps") ](https://david-dm.org/michaeldegroot/swig-minifier "david-dm")
[![](https://travis-ci.org/michaeldegroot/swig-minifier.svg?branch=master "testing") ](https://travis-ci.org/michaeldegroot/swig-minifier "travis-ci")
[![](https://coveralls.io/repos/michaeldegroot/swig-minifier/badge.svg?branch=master&service=github)](https://coveralls.io/github/michaeldegroot/swig-minifier?branch=master)
![](https://img.shields.io/badge/Node-%3E%3D0.10-green.svg)
![](https://img.shields.io/npm/dt/swig-minifier.svg)
![](https://img.shields.io/npm/l/swig-minifier.svg)
___
# Changelog

[https://github.com/michaeldegroot/swig-minifier/commits/master](https://github.com/michaeldegroot/swig-minifier/commits/master)
 ___
# What it does
Minifies and caches html output generated by swig (coded to work with express framework, but could be used without)   
You have the option to choose file cache, memory cache or redis.   
File cache will be located in os.tmpdir() in a folder named 'swig-minifier'   
___
# Getting Started

##### 1. Start by installing the package:
    npm install swig-minifier

##### 2. Do awesome stuff
```javascript
var swigMinifier = require('swig-minifier');

// Change your app.engine to set to render with swig-minifier
app.engine('html', swigMinifier.engine);
```
_Your html code will now be automatically minified and cached via file, If you want more options over the module checkout the __API__ below!_
___
## API

###  .init(Object)
    {
	    cacheFolder: "" // Full path to a folder where to store cache (optional)
        cacheType: ""   // file, redis, memory, none
        hashGen: ""     // md5, sha512, sha256
    }
Call this before using the .engine function and you can setup some options for swig-minifier. If you do not call init, default settings will be used:

    cacheFolder:    os.tmpdir() + "/swig-minfier/"
    cacheType:      "file"
    hashGen:        "sha256"

__Example__
for setting to cache to redis and generate the hash for the cache key via sha512

```javascript
var swigMinifier = require('swig-minifier');

swigMinifier.init({
    cacheType:"redis",
    hashGen:"sha512"
});
```

__Example__
for setting to cache to file system, and generate the hash for the cache key via md5

```javascript
var swigMinifier = require('swig-minifier');

swigMinifier.init({
    cacheType:"file",
    hashGen:"md5"
});
```
___
###  .engine
Use this to replace your app.engine setting

__Example__
```javascript
var express = require('express');
var app = require('express')();
var swigMinifier = require('swig-minifier');

app.engine('html', swigMinifier.engine);
```
___
###  .clearCache()
Will clear all cache

__WARNING REDIS USERS:__ this issues a flushAll command! 

__Example__
```javascript
var swigMinifier = require('swig-minifier');

swigMinifier.clearCache();
```
___
## Contact
You can contact me at specamps@gmail.com