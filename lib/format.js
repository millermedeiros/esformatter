'use strict';

var _options = require('./options');

var npmRun = require('npm-run');
var parser = require('esformatter-parser');
var plugins = require('./plugins');
var transform = require('./transform');

exports = module.exports = format;
function format(str, opts) {
  // we need to load and register the plugins as soon as possible otherwise
  // `stringBefore` won't be called and default settings won't be used
  _options.set(opts);

  // remove shebang before pipe because piped commands might not know how
  // to handle it
  var prefix = getShebang(str);
  if (prefix && !_options.get('esformatter.allowShebang')) {
    throw new Error(
      'shebang not allowed! Set esformatter.allowShebang to true if you ' +
      'want to support it.'
    );
  }
  str = str.replace(prefix, '');

  var pipeCommands = _options.get('pipe');

  if (pipeCommands) {
    str = pipe(pipeCommands.before, str).toString();
  }

  str = doFormat(str, opts);

  if (pipeCommands) {
    str = pipe(pipeCommands.after, str).toString();
  }

  // we only restore bang after pipe because piped commands might not know how
  // to handle it
  return prefix + str;
}


// allows users to override parser if needed
exports.parseFn = function(str, opts) {
  return parser.parse(str, opts);
};


exports.parseOptions = parser.defaultOptions;


function getShebang(str) {
  var result = (/^#!.+\n/).exec(str);
  return result ? result[0] : '';
}


function doFormat(str) {
  str = plugins.stringBefore(str);
  // allows user to override the parser
  var ast = exports.parseFn(str, exports.parseOptions);
  transform(ast, transform.BYPASS_OPTIONS);
  str = ast.toString();
  str = plugins.stringAfter(str);
  return str;
}


// run cli tools in series passing the stdout of previous tool as stdin of next
// one
function pipe(commands, input) {
  if (!commands) {
    return input;
  }
  return commands.reduce(function(input, cmd) {
    return npmRun.sync(cmd, {
      input: input
    });
  }, input);
}
