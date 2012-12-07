
//
// helpers used on the specs
//


var _fs = require('fs');
var _path = require('path');


// ---


exports.COMPARE_FOLDER = _path.join(__dirname, 'compare');


// ---


exports.readIn = function(id){
    return exports.readFile( _path.join(exports.COMPARE_FOLDER, id +'-in.js') );
};


exports.readOut = function(id){
    return exports.readFile( _path.join(exports.COMPARE_FOLDER, id +'-out.js') );
};


exports.readConfig = function(id){
    var filePath = _path.join(exports.COMPARE_FOLDER, id +'-config.json');
    return JSON.parse( exports.readFile(filePath) +'\n' );
};


exports.readFile = function(path){
    return _fs.readFileSync(path).toString();
};


exports.purge = function(dir){
    if (! exports.SHOULD_PURGE) return;
    _fs.readdirSync(dir).forEach(function(relPath){
        var path = _path.join(dir, relPath);
        if ( _fs.statSync(path).isDirectory() ){
            exports.purge(path);
        } else {
            _fs.unlinkSync(path);
        }
    });
    _fs.rmdirSync( dir );
};


exports.mkdir = function(dir){
    if (! _fs.existsSync(dir) ) {
        _fs.mkdirSync(dir);
    }
};

