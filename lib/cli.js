'use strict';

var esformatter = require('../lib/esformatter');
var fs = require('fs');
var glob = require('glob');
var yargs = require('yargs');
var stdin = require('stdin');
var merge = require('mout/object/merge');
var options = require('./options');


yargs
  .usage('Usage: $0 [command] [options] [files]')
  .command('check', 'Check if files are formatted properly.')
  .command('format', 'Formats files. (default command)')
  .alias('c', 'config').describe('c', 'Path to custom configuration file.')
  .alias('p', 'preset').describe('p', 'Set style guide preset ("jquery", "default").')
  .alias('v', 'version').describe('v', 'Display the current version.')
  .describe('plugins', 'Comma separated list of plugins.')
  .describe('i', 'Edit input files in place; use with care!')
  .alias('h', 'help').describe('h', 'Display help and usage details.')
  .describe('unified', 'Output unified diff.')
  .describe('unified-no-color', 'Output unified diff without colors.')
  .describe('chars', 'Output char diff. (default diff format)')
  .string(['config', 'preset', 'indent.value', 'lineBreak.value', 'whiteSpace.value', 'plugins'])
  .boolean(['help', 'i', 'unified', 'unified-no-color', 'chars'])
  .version(function() {
    return 'esformatter v' + require('../package.json').version;
  })
  .wrap(80);


// set the error flag to true to use an exit code !== 0
exports.hasError = false;


// allow mocking/replacing the stdout/stderr
exports.stdout = process.stdout;
exports.stderr = process.stderr;


exports.parse = function(arr) {
  var argv = yargs.parse(arr);

  if (argv.plugins) {
    argv.plugins = argv.plugins.split(',');
  }

  var command = argv._[0];
  if (command === 'check' || command === 'format') {
    argv.command = command;
    argv._ = argv._.slice(1);
  } else {
    argv.command = 'format';
  }

  return argv;
};


exports.run = function(argv) {
  // reset error flag at each run
  exports.hasError = false;

  var cmd = argv.command;

  if (argv.help) {
    yargs.showHelp();
    return;
  }

  if (cmd === 'format' && hasDiffFlags(argv)) {
    logError(
      'Error: "--unified", "--unified-no-color" and "--chars" flags ' +
      'can only be used with the "check" command.'
    );
    return;
  }

  if (cmd !== 'format' && argv.i) {
    logError('Error: "-i" flag can only be used with the "format" command.');
    return;
  }

  run(argv);
};


function hasDiffFlags(argv) {
  return argv.unified || argv.unifiedNoColor || argv.chars;
}


function run(argv) {
  var files = argv._;

  if (!files.length) {
    stdin(function(source) {
      toConsole(source, null, argv);
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
    toConsole(getSource(file), file, argv);
  });
}


function logError(e) {
  var msg = typeof e === 'string' ? e : e.message;

  // esprima.parse errors are in the format 'Line 123: Unexpected token &'
  if ((/Line \d+:/).test(msg)) {
    // convert into "<filepath>:<line> <error_message>"
    msg = 'Error: ' + msg.replace(/[^\d]+(\d+): (.+)/, e.file + ':$1 $2');
  }

  // set the error flag to true to use an exit code !== 0
  exports.hasError = true;

  // we call console.error directly to make it possible to mock during unit
  // tests
  exports.stderr.write(msg + '\n');
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
    logError('Error: Can\'t read source file. Exception: ' + e.message);
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
    logError('Error: ' + e.message);
  }
}


function toConsole(source, file, argv) {
  var config = getConfig(file, argv);
  if (!source || !config) return;
  try {
    var result;

    if (argv.command === 'format') {
      result = esformatter.format(source, config);
      // do not use console.log since it adds a line break at the end
      exports.stdout.write(result);
      return;
    }

    if (argv.command === 'check') {
      var method = 'chars';
      if (argv.unified) {
        method = 'unified';
      } else if (argv.unifiedNoColor) {
        method = 'unifiedNoColor';
      }
      result = esformatter.check[method](source, config, file);
      if (result) {
        var end = method === 'chars' ? '\n' : '';
        exports.hasError = true;
        // we are using stdout even tho it's considered an "error" because user
        // might want to pipe multiple tools and diff(1) also outputs to stdout
        exports.stdout.write(result + end);
      }
    }
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
