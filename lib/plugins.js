"use strict";

var _plugins = [],
  _options;

/*
 * Export the list of loaded plugins in the event it's needed by esformatter core.
 */
exports.list = _plugins;
exports.length = _plugins.length;

/*
 * Provide utilities to loaded plugins.
 */
exports.utils = {};

function exec (method) {
  if (_plugins.length === 0) {
    return;
  }

  var args = Array.prototype.slice.call(arguments, 1),
    result;

  _plugins.forEach(function (plugin) {
    if (plugin[method]) {
      if (result) {
        args = args.slice(1);
        args.unshift(result);
      }
      result = plugin[method].apply({ utils: exports.utils }, args);
    }
  });

  return result;
}

/*
 * Called after the core runs initial formatting tasks, before transformation.
 */
exports.preformat = function (str) {
  return exec('preformat', str, _options);
};

/*
 * Called after the core runs preprocessing tasks, before transformation.
 */
exports.preprocess = function (token) {
  exec('preprocess', token, _options);
};

/*
 * Called immediately before core transformation tasks.
 */
exports.beforeTransform = function (node) {
  exec('beforeTransform', node, _options);
};

/*
 * Called for each node in the AST tree after the core runs transformat tasks,
 * after preprocessing, before postprocessing.
 */
exports.transform = function (node) {
  exec('transform', node, _options);
};

/*
 * Called after the core runs postprocessing tasks, after transformation.
 */
exports.postprocess = function (token) {
  exec('postprocess', token, _options);
};

/*
 * Walks the ast node structure.
 *
 * This is necessary when custom transofmration/formatting conflicts with core
 * transformations or formatting.
 */
exports.walk = function (node) {
  exec('walk', node, _options);
};

/*
 * Called after the core runs transformation.
 */
exports.postformat = function (str) {
  return exec('postformat', str, _options);
};

/*
 * Loads plugins specified in options.
 */
exports.load = function () {
  _plugins = [];

  if (!_options.plugins || !_options.plugins.length) {
    return;
  }

  // just in case someone decided to pass a string with one plugin name. (already happened here)
  if (typeof _options.plugins === 'string') {
    _options.plugins = [ _options.plugins ];
  }

  var plugin,
    util;

  _options.plugins.forEach(function (name) {
    plugin = require(name);

    if(plugin) {
      for (util in exports.utils) {
        plugin[util] = exports.utils[util];
      }
      _plugins.push(plugin);
    }
  });

  exports.length = _plugins.length;

};

exports.setOptions = function (options) {
  _options = options;

  exports.load();
}

/*
 * Since walking is a heavier operation, check to see if any loaded plugins
 * have implemented the walk method first.
 */
exports.hasWalk = function () {
  var hasWalk = false;

  if (_plugins.length === 0) {
    return false;
  }

  _plugins.forEach(function (plugin) {
    hasWalk = hasWalk || typeof plugin.walk !== 'undefined';
  });

  return hasWalk;
};
