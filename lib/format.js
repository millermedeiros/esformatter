'use strict';

var _options = require('./options');

// we use babylon because it supports more ES6+ features than esprima at the
// moment and it also supports JSX
var acornToEsprima = require('acorn-to-esprima');
var babelTraverse = require('babel-traverse').default;
var babylon = require('babylon');
var npmRun = require('npm-run');
var plugins = require('./plugins');
var rocambole = require('rocambole');
var transform = require('./transform');

// need to skip extra properties from babylon otherwise we would format more
// nodes than we need and it also confuses rocambole about {start|end}Token
rocambole.BYPASS_RECURSION.loc = true;
rocambole.BYPASS_RECURSION.leadingComments = true;
rocambole.BYPASS_RECURSION.trailingComments = true;

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
  var ast = babylon.parse(str, opts);

  // remove EOF token, eslint doesn't use this for anything and it interferes with some rules
  // see https://github.com/babel/babel-eslint/issues/2 for more info
  // todo: find a more elegant way to do this
  ast.tokens.pop();

  // convert tokens
  ast.tokens = acornToEsprima.toTokens(ast.tokens, babylon.tokTypes, str);

  // add comments
  acornToEsprima.convertComments(ast.comments);

  // transform esprima and acorn divergent nodes
  acornToEsprima.toAST(ast, babelTraverse, str);

  // remove File
  ast.type = 'Program';
  ast.sourceType = ast.program.sourceType;
  ast.directives = ast.program.directives;
  ast.body = ast.program.body;
  delete ast.program;
  delete ast._paths;

  acornToEsprima.attachComments(ast, ast.comments, ast.tokens);

  return ast;
};

exports.parseContext = null;

exports.parseOptions = {
  allowImportExportEverywhere: false, // consistent with espree
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  locations: true,
  onComment: [],
  onToken: [],
  plugins: [
    'asyncFunctions',
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exponentiationOperator',
    'exportExtensions',
    'flow',
    'functionBind',
    'functionSent',
    'jsx',
    'objectRestSpread',
    'trailingFunctionCommas'
  ],
  ranges: true,
  sourceType: 'module',
  strictMode: true
};


function getShebang(str) {
  var result = (/^#!.+\n/).exec(str);
  return result ? result[0] : '';
}


function doFormat(str) {
  str = plugins.stringBefore(str);
  // allows user to override the parser
  rocambole.parseFn = exports.parseFn;
  rocambole.parseContext = exports.parseContext;
  var ast = rocambole.parse(str, exports.parseOptions);
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
