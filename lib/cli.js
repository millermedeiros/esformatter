'use strict';

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var glob = require('glob');
var optimist = require('optimist');
var stdin = require('stdin');
var merge = require('mout/object/merge');
var options = require('./options');
var EventEmitter = require('events').EventEmitter;

// ---

exports = module.exports = new EventEmitter();

// ---


optimist
  .usage('esformatter [OPTIONS] [FILES]')
  .alias('c', 'config').describe('c', 'Path to custom configuration file.')
  .alias('p', 'preset').describe('p', 'Set style guide preset ("jquery", "default").')
  .alias('h', 'help').describe('h', 'Display help and usage details.')
  .alias('v', 'version').describe('v', 'Display the current version.')
  .describe('plugins', 'Comma separated list of plugins.')
  .boolean('i').describe('i', 'Edit input files in place; overwrite source file, use with care!')
  .string(['config', 'preset', 'indent.value', 'lineBreak.value', 'whiteSpace.value', 'plugins'])
  .boolean(['help', 'version'])
  .wrap(80);


  // ---


exports.parse = function(str) {
  var argv = optimist.parse(str);

  if (argv.plugins) {
    argv.plugins = argv.plugins.split(',');
  }

  return argv;
};


exports.run = function(argv) {
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
      formatToConsole(source, null, argv);
    });
    return;
  }

  files = expandGlobs(files);

  if (argv.i) {
    files.forEach(function(file) {
      formatToSelf(file, argv);
    });
    return;
  }

  files.forEach(function(file) {
    formatToConsole(getSource(file), file, argv);
  });
}


function logError(e) {
  var msg = e.message;
  // esprima.parse errors are in the format 'Line 123: Unexpected token &'
  if ((/Line \d+:/).test(msg)) {
    // convert into "<filepath>:<line> <error_message>"
    msg = msg.replace(/[^\d]+(\d+): (.+)/, e.file + ':$1 $2');
  }

  // we emit an error event instead of calling console.error directly to avoid
  // mocking during unit tests and also to simplify the exit code handling
  exports.emit('error', { message: 'Error: ' + msg });
}


function expandGlobs(filePaths) {
  return filePaths.reduce(function(arr, file) {
    // if file path contains "magical chars" (glob) we expand it, otherwise we
    // simply use the file path
    if (glob.hasMagic(file)) {
      return arr.concat(glob.sync(file, {
        // we want to return the glob itself to report that it didn't find any
        // files, better to giver clear error messages than to fail silently
        nonull: true
      }));
    }
    arr.push(file);
    return arr;
  }, []);
}


function getSource(file) {
  try {
    return fs.readFileSync(file).toString();
  } catch (e) {
    // we are handling errors this way instead of prematurely terminating the
    // program because user might be editing multiple files at once and error
    // might only be present on a single file
    logError({
      message: 'Can\'t read source file. Exception: ' + e.message
    });
  }
}


function getConfig(filePath, argv) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (argv.preset || argv.root) {
    return argv;
  }

  try {
    // we only load ".esformatter" or "package.json" file if user did not
    // provide a config file as argument, that way we allow user to override
    // the behavior
    var config = argv.config ?
      options.loadAndParseConfig(argv.config) :
      options.getRc(filePath);

    // we always merge the argv to allow user to override the default settings
    return merge(config, argv);
  } catch (e) {
    logError(e);
  }
}


function formatToConsole(source, file, argv) {
  var config = getConfig(file, argv);
  if (!source || !config) return;
  try {
    var result = esformatter.format(source, config);
    // do not use console.log since it adds a line break at the end
    process.stdout.write(result);
  } catch (e) {
    logError({
      message: e.message,
      file: (file || 'stdin')
    });
  }
}


function formatToSelf(file, argv) {
  var source = getSource(file);
  var config = getConfig(file, argv);
  if (!source || !config) return;
  try {
    fs.writeFileSync(file, esformatter.format(source, config));
  } catch (e) {
    logError({
      message: e.message,
      file: file
    });
  }
}
