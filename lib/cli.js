"use strict";

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var path = require('path');
var optimist = require('optimist');
var stdin = require('stdin');
var merge = require('mout/object/merge');
var stripJsonComments = require('strip-json-comments');


// ---


optimist
  .usage('esformatter [OPTIONS] [FILES]')
  .alias('c', 'config').describe('c', 'Path to custom configuration file.')
  .alias('p', 'preset').describe('p', 'Set style guide preset ("jquery", "default").')
  .alias('h', 'help').describe('h', 'Display help and usage details.')
  .alias('v', 'version').describe('v', 'Display the current version.')
  .string(['config', 'preset', 'indent.value', 'lineBreak.value', 'whiteSpace.value'])
  .boolean(['help', 'version'])
  .wrap(80);


exports.parse = function(str) {
  var argv = optimist.parse(str);

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  if (argv.version) {
    console.log('esformatter v' + require('../package.json').version);
    process.exit(0);
  }

  run(argv);
};


// ---


function run(argv) {
  var files = argv._;
  if (!files.length) {
    stdin(function(source) {
      formatToConsole(source, getConfig(null, argv));
    });
  } else {
    files.forEach(function(file) {
      formatToConsole(getSource(file), getConfig(file, argv));
    });
  }
}


function getSource(file) {
  try {
    return fs.readFileSync(file).toString();
  } catch (ex) {
    console.error('Can\'t read source file: "' + file + '"\nException: ' + ex.message);
    process.exit(2);
  }
}


function getConfig(file, argv) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (argv.preset) {
    return argv;
  }

  if (argv.config) {
    // we always merge the argv to allow user to override the default settings
    var config = loadAndParseConfig(argv.config);
    return merge(config, argv);
  } else {
    // we only load ".esformatter" or "package.json" file if user did not
    // provide a config file as argument, that way we allow user to override
    // the behavior
    var basedir = file ? path.dirname(file) : process.cwd();
    return merge(getRc(basedir), argv);
  }
}


function getRc(basedir) {
  var cwd = process.cwd();
  var rc = searchForConfig(basedir);
  if (!rc && basedir !== cwd) {
    rc = searchForConfig(cwd);
  }
  return rc || getGlobalConfig();
}


function searchForConfig(basedir) {
  if (basedir.length <= 1) return;

  var configFiles = ['.esformatter', 'package.json'];
  var config;

  configFiles.some(function(name) {
    var filePath = path.join(basedir, name);
    // we don't merge configs if top-level
    if (!isTopLevel(config) && fs.existsSync(filePath)) {
      var cur = loadAndParseConfig(filePath);
      if (name === 'package.json') {
        cur = cur.esformatter;
      }
      // we merge configs on same folder as well just in case
      config = config ? merge(cur, config) : cur;
    }
  });

  if (isTopLevel(config)) {
    return config;
  }

  // we merge configs from parent folders so it's easier to add different rules
  // for each folder on a project and/or override just specific settings
  return merge(searchForConfig(path.resolve(basedir, '..')) || {}, config);
}


function isTopLevel(config) {
  // if config contains 'root:true' or inherit from another "preset" we
  // consider it as top-level and don't merge the settings with config files on
  // parent folders.
  return config && (config.root || config.preset);
}


function getGlobalConfig() {
  var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
  var file = path.join(home, '.esformatter');
  return fs.existsSync(file) ? loadAndParseConfig(file) : {};
}


function loadAndParseConfig(file) {
  try {
    return JSON.parse(stripJsonComments(fs.readFileSync(file).toString()));
  } catch (ex) {
    console.error('Can\'t parse configuration file: "' + file + '"\nException: ' + ex.message);
    process.exit(1);
  }
}


function formatToConsole(source, config) {
  var result = esformatter.format(source, config);
  // do not use console.log since it adds a line break at the end
  process.stdout.write(result);
}


