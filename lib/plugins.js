"use strict";

var partial = require('mout/function/partial');
var remove = require('mout/array/remove');

var _plugins = [];


exports.register = register;
function register(plugin) {
  if (_plugins.indexOf(plugin) === -1) {
    _plugins.push(plugin);
  }
}


exports.unregister = partial(remove, _plugins);


exports.unregisterAll = unregisterAll;
function unregisterAll() {
  _plugins = [];
}


exports.setOptions = function(opts) {
  loadAndRegister(opts && opts.plugins);
  exec('setOptions', opts);
};


exports.loadAndRegister = loadAndRegister;
function loadAndRegister(ids) {
  ids = ids || [];
  ids.forEach(function(id) {
    register(require(id));
  });
}


exportMethods([
  'tokenBefore',
  'tokenAfter',
  'nodeBefore',
  'nodeAfter',
  // "transform" is an alias to "transformAfter" but we do not recommend using
  // it going forward. it might be deprecated in the future.
  'transform',
  'transformAfter',
  'transformBefore'
], exec);

exportMethods([
  'stringBefore',
  'stringAfter'
], pipe);


function exportMethods(arr, fn) {
  arr.forEach(function(methodName) {
    exports[methodName] = partial(fn, methodName);
  });
}


function exec(methodName) {
  var args = Array.prototype.slice.call(arguments, 1);
  _plugins.forEach(function(plugin){
    if (methodName in plugin) {
      plugin[methodName].apply(plugin, args);
    }
  });
}


function pipe(methodName, input) {
  return _plugins.reduce(function(output, plugin) {
    return methodName in plugin ? plugin[methodName](output) : output;
  }, input);
}
