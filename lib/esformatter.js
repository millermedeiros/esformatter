'use strict';


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.



var rocambole = require('rocambole');
var indent = require('./indent/indent');
var _options = require('./options');
var _plugins = require('./plugins');

// ---


var _ast = require('rocambole-node');
var _ws = require('./whiteSpace/whiteSpace');
var _br = require('./lineBreak/lineBreak');
var _tk = require('rocambole-token');
var addSpaceInsideExpressionParentheses = require('./hooks/addSpaceInsideExpressionParentheses');


// ---


exports.hooks = require('./hooks');
exports.format = format;
exports.transform = transform;

_plugins.utils = {
  whitespace: _ws,
  linebreaks: _br,
  tokens: _tk
};

// ---


function format(str, opts) {
  _options.set(opts);

  // we remove trailing whitespace before since it's simpler
  str = _ws.removeTrailing(str);
  str = _br.removeEmptyLines(str);

  str = _plugins.preformat(str);

  var ast = rocambole.parse(str);
  transform(ast, opts);

  var result = ast.toString();

  result = _plugins.postformat(result);

  return result;
}


function transform(ast, opts) {
  _options.set(opts);

  _tk.eachInBetween(ast.startToken, ast.endToken, preprocessToken);
  _tk.eachInBetween(ast.startToken, ast.endToken, _plugins.preprocess)

  rocambole.moonwalk(ast, transformNode);

  // since this is a heavier operation, check to see if any loaded plugins
  // have implemented the walk method first.
  if (_plugins.hasWalk()) {
    rocambole.moonwalk(ast, _plugins.walk);
  }

  _tk.eachInBetween(ast.startToken, ast.endToken, postprocessToken);
  _tk.eachInBetween(ast.startToken, ast.endToken, _plugins.postprocess)

  // indent should come after all other transformations since it depends on
  // line breaks caused by "parent" nodes, otherwise it will cause conflicts.
  // it should also happen after the postprocessToken since it adds line breaks
  // before/after comments and that changes the indent logic
  indent.transform(ast);

  if (process.env.LOG_TOKENS) {
    _ast.logTokens(ast);
  }

  return ast;
}


function transformNode(node) {
  _plugins.beforeTransform(node);

  _br.aroundNodeIfNeeded(node);

  // we apply hooks after default line breaks so we are able to revert it if
  // needed
  if (node.type in exports.hooks) {
    exports.hooks[node.type](node);
  }

  // handle parenthesis automatically since it is needed by multiple node types
  // and it avoids code duplication and reduces complexity of each hook
  addSpaceInsideExpressionParentheses(node);

  // automatic white space comes afterwards since line breaks introduced by the
  // hooks affects it
  _ws.beforeIfNeeded(node.startToken, node.type);
  _ws.afterIfNeeded(node.endToken, node.type);

  _plugins.transform(node);
}


function preprocessToken(token) {
  if (_tk.isWs(token)) {
    _ws.sanitize(token);
  } else if (_tk.isComment(token)) {
    _br.aroundIfNeeded(token, token.type);
  }
}


function postprocessToken(token) {
  if (_tk.isComment(token)) {
    processComment(token);
  }
}


function processComment(token) {
  _ws.beforeIfNeeded(token, token.type);
  // only block comment needs space afterwards
  if (token.type === 'BlockComment') {
    _ws.afterIfNeeded(token, token.type);
  }
}
