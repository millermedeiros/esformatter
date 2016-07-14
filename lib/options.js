"use strict";

var stripJsonComments = require('strip-json-comments');
var fs = require('fs');
var path = require('path');

var _ws = require('rocambole-whitespace');
var _br = require('rocambole-linebreak');
var indent = require('./indent');
var plugins = require('./plugins');

var deepMixIn = require('mout/object/deepMixIn');
var merge = require('mout/object/merge');
var get = require('mout/object/get');
var isObject = require('mout/lang/isObject');
var userHome = require('user-home');
var isEmpty = require('mout/lang/isEmpty');
var toArray = require('mout/lang/toArray');

// ---

var _curOpts;

// ---

exports.presets = {
  'default': null,
  'jquery': null
};


exports.set = function(opts) {
  var preset = opts && opts.preset ? opts.preset : 'default';
  // we need to pass all the user settings and default settings to the plugins
  // so they are able to toggle the behavior and make changes based on the
  // options
  _curOpts = mergePreset(preset, opts);

  // FIXME: deprecate AlignComments on v1.0
  // on v0.6.0 we named the property starting with uppercase "A" by mistake, so
  // now we need to support both styles to keep consistency :(
  if (_curOpts.indent && 'AlignComments' in _curOpts.indent) {
    _curOpts.indent.alignComments = _curOpts.indent.AlignComments;
  }

  _ws.setOptions(_curOpts.whiteSpace);
  _br.setOptions(_curOpts.lineBreak);
  indent.setOptions(_curOpts.indent);
  plugins.setOptions(_curOpts);

  // user provided options should override default settings and also any
  // changes made by plugins
  if (opts) {
    _curOpts = deepMixIn(_curOpts, opts);
  }
};


function mergePreset(preset, opts) {
  if (!(preset in exports.presets)) {
    throw new Error('Invalid preset file "' + preset + '".');
  }
  var baseOpts = exports.presets[preset];
  if (!baseOpts) {
    baseOpts = exports.presets[preset] = loadAndParseConfig(
      path.join(__dirname, 'preset', preset + '.json')
    );
  }
  return mergeOptions(baseOpts, opts);
}


function mergeOptions(base, override) {
  var result = merge(base, override);
  // plugins is cumulative, so if we are extending a config that sets plugins we
  // should merge them (that way it will load/execute all the plugins)
  result.plugins = [].concat(base && base.plugins, override && override.plugins)
    .filter(function(p) {
      return p != null;
    });
  return result;
}


exports.get = function(prop) {
  return prop ? get(_curOpts, prop) : _curOpts;
};


exports.getRc = getRc;
function getRc(filePath, customOptions) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (isTopLevel(customOptions)) {
    return customOptions;
  }

  if (isObject(filePath)) {
    customOptions = filePath;
    filePath = null;
  }
  // we search for config file starting from source directory or from cwd if
  // path is not provided
  var basedir = filePath ? path.dirname(filePath) : process.cwd();
  var cwd = process.cwd();
  var rc = findAndMergeConfigs(basedir);
  if (isEmpty(rc) && basedir !== cwd) {
    rc = findAndMergeConfigs(cwd);
  }
  var tmpConfig = !isEmpty(rc) ? rc : getGlobalConfig();
  return mergeOptions(tmpConfig, customOptions);
}


function findAndMergeConfigs(basedir) {
  if (!basedir || !basedir.length) return;

  var configFiles = ['.esformatter', 'package.json'];
  var config;

  configFiles.some(function(name) {
    var filePath = path.join(basedir, name);
    if (!fs.existsSync(filePath)) return;

    var cur = loadAndParseConfig(filePath);
    if (name === 'package.json') {
      cur = cur.esformatter;
    }

    if (!cur) return;

    // we merge configs on same folder as well just in case user have
    // ".esformatter" and "package.json" on same folder
    // notice that ".esformatter" file takes precedence and will override the
    // "package.json" settings.
    config = config ? mergeOptions(cur, config) : cur;

    // stop the loop
    if (isTopLevel(config)) return true;
  });

  if (isTopLevel(config)) {
    return config;
  }

  // we merge configs from parent folders so it's easier to add different rules
  // for each folder on a project and/or override just specific settings
  var parentDir = path.resolve(basedir, '..');
  // we need to check if parentDir is different from basedir to avoid conflicts
  // on windows (see #174)
  var parentConfig = parentDir && parentDir !== basedir ?
    findAndMergeConfigs(parentDir) :
    {};
  // notice that current folder config overrides the parent folder config
  return mergeOptions(parentConfig, config);
}


function isTopLevel(config) {
  // if config contains 'root:true' or inherit from another "preset" we
  // consider it as top-level and don't merge the settings with config files on
  // parent folders.
  return config && (config.root || config.preset);
}


function getGlobalConfig() {
  if (!userHome) {
    return {};
  }
  var file = path.join(userHome, '.esformatter');
  return fs.existsSync(file) ? loadAndParseConfig(file) : {};
}


exports.loadAndParseConfig = loadAndParseConfig;
function loadAndParseConfig(file) {
  try {
    var config = JSON.parse(
      stripJsonComments(fs.readFileSync(file).toString())
    );

    if (config.extends) {
      // the last item in the array will override other settings
      var extended = toArray(config.extends).reduceRight(function(temp, filePath) {
        return mergeOptions(
          temp,
          loadAndParseConfig(path.join(path.dirname(file), filePath))
        );
      }, {});
      config = mergeOptions(extended, config);
    }

    return config;
  } catch (e) {
    // include file name and let user know error was caused by config file
    // parsing. this is redundant for ENOENT errors but very helpful for
    // JSON.parse
    throw new Error(
      "Can't parse configuration file '" + file + "'. Exception: " + e.message
    );
  }
}
