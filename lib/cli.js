"use strict";

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var optimist = require('optimist');
var stdin = require('stdin');
var merge = require('mout/object/merge');
var options = require('./options');


// ---


optimist
  .usage('esformatter [OPTIONS] [FILES]')
  .alias('c', 'config').describe('c', 'Path to custom configuration file.')
  .alias('p', 'preset').describe('p', 'Set style guide preset ("jquery", "default").')
  .alias('h', 'help').describe('h', 'Display help and usage details.')
  .alias('v', 'version').describe('v', 'Display the current version.')
  .describe('plugins', 'Comma separated list of plugins.')
  .string(['config', 'preset', 'indent.value', 'lineBreak.value', 'whiteSpace.value', 'plugins'])
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

  if (argv.plugins) {
    argv.plugins = argv.plugins.split(',');
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


function getConfig(filePath, argv) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (argv.preset || argv.root) {
    return argv;
  }

  // we only load ".esformatter" or "package.json" file if user did not
  // provide a config file as argument, that way we allow user to override
  // the behavior
  var config = argv.config ?
    options.loadAndParseConfig(argv.config) :
    options.getRc(filePath);

  // we always merge the argv to allow user to override the default settings
  return merge(config, argv);
}


function formatToConsole(source, config) {
  var result = esformatter.format(source, config);
  // do not use console.log since it adds a line break at the end
  process.stdout.write(result);
}

