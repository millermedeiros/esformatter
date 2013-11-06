"use strict";

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var path = require('path');
var confortable = require('confortable');
var optimist = require('optimist');
var stdin = require('stdin');
var findParentDir = require('find-parent-dir');
var merge = require('mout/object/merge');


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
    getConfig(null, argv, function(config) {
      stdin(function(source) {
        formatToConsole(source, config);
      });
    });
  } else {
    files.forEach(function(file) {
      getConfig(file, argv, function(config) {
        formatToConsole(getSource(file), config);
      });
    });
  }
}


function getSource(file) {
  try {
    return fs.readFileSync(file).toString();
  } catch (ex) {
    console.error("Can't read source file: " + file + "\nException: " + ex.message);
    process.exit(2);
  }
}


function getConfig(file, argv, cb) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (argv.preset) {
    cb(argv);
    return;
  }

  if (argv.config) {
    // we always merge the argv to allow user to override the default settings
    var config = loadAndParseConfig(argv.config);
    cb(merge(config, argv));
  } else {
    // we only load ".esformatter" or "package.json" file if user did not
    // provide a config file as argument, that way we allow user to override
    // the behavior
    var basedir = file? path.dirname(file) : process.cwd();
    getRc(basedir, function(config){
      cb(merge(config, argv));
    });
  }
}


function getRc(basedir, cb) {
  var cwd = process.cwd();
  findParentDir(basedir, 'package.json', function(err, dir) {
    var config;
    if (err) {
      console.log('Error locating "package.json" file');
      throw err;
    }
    // package.json takes precedence since file might be on a separate
    // project and "rc" file might be global
    if (dir) {
      var pkg = loadAndParseConfig(path.join(dir, 'package.json'));
      config = pkg.esformatter;
    }
    if (!config) {
      // we start search on file directory and use cwd as fallback
      var rc = confortable('.esformatter', basedir, (basedir !== cwd? cwd : null));
      if (rc) {
        config = loadAndParseConfig(rc);
      }
    }
    cb(config || {});
  });
}


function loadAndParseConfig(file) {
  if (!fs.existsSync(file)) {
    console.error("Can't find configuration file: " + file + "\nFile doesn't exist");
    process.exit(1);
  } else {
    try {
      return JSON.parse(fs.readFileSync(file).toString());
    } catch (ex) {
      console.error("Can't parse configuration file: " + file + "\nException: " + ex.message);
      process.exit(1);
    }
  }
}


function formatToConsole(source, config) {
  var result = esformatter.format(source, config);
  // do not use console.log since it adds a line break at the end
  process.stdout.write(result);
}


