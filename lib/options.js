"use strict";

var _ws = require('./util/whiteSpace');
var _br = require('./util/lineBreak');
var _indent = require('./util/indent');
var merge = require('mout/object/merge');


// ---

var _curOpts;

// ---

exports.presets = {
  'default': require('./preset/default.json'),
  'jquery' : require('./preset/jquery.json')
};


exports.set = function(opts) {
  var preset = opts && opts.preset ? opts.preset : 'default';
  _curOpts = mergeOptions(preset, opts);

  _ws.setOptions(_curOpts.whiteSpace);
  _br.setOptions(_curOpts.lineBreak);
  _indent.setOptions(_curOpts.indent);
};


function mergeOptions(preset, opts){
  if (!(preset in exports.presets)) {
    throw new Error('Invalid preset file "' + preset + '".');
  }
  var baseOpts = exports.presets[preset];
  // recursively merge options to allow a "prototype chain"
  if (baseOpts.preset) {
    baseOpts = mergeOptions(baseOpts.preset, baseOpts);
  }
  return merge({}, baseOpts, opts);
}


exports.get = function() {
  return _curOpts;
};

