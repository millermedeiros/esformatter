"use strict";

// file system helpers, mostly just a proxy for the node.js native
// implementation so later we can change the behavior for the browser and
// create better abstractions around it if needed.

var _fs = require('fs');

exports.readJSON = readJSON;
exports.readFileSync = readFileSync;


function readJSON(path){
    return JSON.parse( readFileSync(path) );
}


function readFileSync(path){
    return _fs.readFileSync(path).toString();
}


