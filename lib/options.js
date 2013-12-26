"use strict";

var _ws = require('./whiteSpace/whiteSpace');
var _br = require('./lineBreak/lineBreak');
var merge = require('mout/object/merge');
var get = require('mout/object/get');
var indent = require('./indent/indent');


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
  indent.setOptions(_curOpts.indent);
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


exports.get = function(prop) {
  return get(_curOpts, prop);
};

