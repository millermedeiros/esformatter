"use strict";

var partial = require('mout/function/partial');
var remove = require('mout/array/remove');

var _plugins = [];


exports.register = register;
function register(plugin) {
  _plugins.push(plugin);
}


exports.unregister = partial(remove, _plugins);

exports.setOptions = function(opts) {
  if ('plugins' in opts) {
    opts.plugins.forEach(function(pluginName) {
      register(require(pluginName));
    });
  }
  exec('setOptions', opts);
};

exportMethods([
  'tokenBefore',
  'tokenAfter',
  'nodeBefore',
  'nodeAfter',
  'transform'
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

