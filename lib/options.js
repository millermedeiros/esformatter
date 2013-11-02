"use strict";

var merge = require('mout/object/merge');

var _ws = require('./util/whiteSpace');
var _br = require('./util/lineBreak');
var _indent = require('./util/indent');


// ---

var _curOpts;

// ---

// TODO this should read all files in lib/preset
exports.presets = {
    'default' : require('./preset/default.json'),
    'jquery' : require('./preset/jquery.json')
};


exports.set = function(opts){
    var preset = opts && opts.preset? opts.preset : 'default';

    if (! (preset in exports.presets)) {
        throw new Error('Invalid preset file "'+ preset +'".');
    }

    var baseOpts = exports.presets[preset];
    // Non-default presets shouldn't have to list all options
    // Therefore, merge them into defaults
    if (preset !== 'default') {
        baseOpts = merge(exports.presets['default'], baseOpts);
    }
    _curOpts = merge(baseOpts, opts);

    _ws.setOptions(_curOpts.whiteSpace);
    _br.setOptions(_curOpts.lineBreak);
    _indent.setOptions(_curOpts.indent);
};


exports.get = function(){
    return _curOpts;
};

