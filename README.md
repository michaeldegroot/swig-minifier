**Table of Contents**

- [Changelog](#changelog)
- [What it does](#what-it-does)
- [How does it look?](#how-does-it-look)
- [How do I use it?](#how-do-i-use-it)
- [API](#api)
- [Contact](#contact)

## Changelog

 - 0.0.1 Release
 - 0.0.2 - 0.0.9 Readme edits
 - 0.1.0 Added the optional use of the file system as a cache
 - 0.1.1 Bugfix for default options if the init function was never called
 - 0.1.2 Readme edits
 - 0.1.3 Fixed a encoding bug in serving cached file system content
 - 0.1.4 Added a git repository to package.json :)
 - 0.1.5 File system cache will now create a folder in the os.tmpdir() location via the path module, The init function is now required to be executed, Forgot to throw a error in the memory cache code, Removed some unused variables
 - 0.1.6 Added the optional use of using redis as a cache and cleaned up the code a bit
 - 0.1.7 You dont have to have redis run to use file or memory cache
 - 0.1.8 Added a clearCache function
 - 0.1.9 Using sha256 for cache key generation instead of md5 (less collision chance)
 - 0.2.1 Instead of generating a hash from the html contents of the requested page (amount of bytes = yikes) the code now generates a hash from the requested filename and appends any locals that are passed on to swig
 - 0.2.2 init does not have to be called anymore this is only required if you want to override the default settings, the clearCache function is now working for memory and redis cache storage and can be called via swigMinifier.clearCache();
 - 0.2.3 You can now tell swig-minifier to not use a cache system at all and just minify.
 - 0.2.4 Hash generation changed a bit: instead of using the basename it now uses full path. This is to avoid serving cached content when 2 html files have the same name but have unique content and are stored in different directories. 
 - 0.2.5 Added API to docs :). Added a hashGen option to the init function. You can now specify what algorithm to use to generate the hash cache key. Options are: md5, sha256, sha512
 - 0.2.6 Cleaned up readme
 
## What it does

Minifies and caches html output generated by swig in use with the express framework.
You have the option to choose file cache, memory cache or redis.
File cache will be located in os.tmpdir() in a folder named 'swig-minifier'


## How does it look?

```javascript
var swigMinifier = require('swig-minifier');
swigMinifier.init({cacheType:"file"});
app.engine('html', swigMinifier.engine);
```


##  How do I use it?

### 1. Start by installing the package:
    npm install swig-minifier

### 2. Put this in your nodejs server file:
```javascript
// Require the module.
var swigMinifier = require('swig-minifier');

// Change your app.engine to set to render with swig-minifier
app.engine('html', swigMinifier.engine);
```
### 3. Your html code will now be automatically minified and cached via file, if you want more options over the module checkout the API below!

## API

###  - init(options)

##### Options:
    cacheType: file, redis, memory, none
    hashGen: md5, sha512, sha256
Call this before using the .engine function and you can setup some options for swig-minifier. If you do not call init, default settings will be used:

__Default settings if init is never called:__

    cacheType: file
    hashGen: sha256

__Example__
for setting to cache to redis and generate the hash for the cache key via sha512

```javascript
var swigMinifier = require('swig-minifier');

swigMinifier.init({cacheType:"redis",hashGen:"sha512"});
```

__Example__
for setting to cache to file system, and generate the hash for the cache key via md5

```javascript
var swigMinifier = require('swig-minifier');

swigMinifier.init({cacheType:"file",hashGen:"md5"});
```

###  - engine
Use this to replace your app.engine setting

__Example__
```javascript
var express = require('express');
var app = require('express')();

app.engine('html', swigMinifier.engine);
```

###  - clearCache
Will clear all cache

__WARNING REDIS USERS:__ this issues a flushAll command! 

__Example__
```javascript
var swigMinifier = require('swig-minifier');

swigMinifier.clearCache();
```




## Contact
You can contact me at specamps@gmail.com