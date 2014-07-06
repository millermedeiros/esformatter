'use strict';


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.


var _br = require('./lineBreak');
var _options = require('./options');
var _tk = require('rocambole-token');
var _ws = require('./whiteSpace');
var addBrAroundNode = require('./lineBreakAroundNode');
var expressionParentheses = require('./hooks/expressionParentheses');
var hooks = require('./hooks');
var indent = require('./indent');
var plugins = require('./plugins');
var rocambole = require('rocambole');


// ---


var _shouldRemoveTrailingWs;


// ---


exports.hooks = hooks;
exports.format = format;
exports.transform = transform;
exports.rc = _options.getRc;
exports.register = plugins.register;
exports.unregister = plugins.unregister;


// ---


function format(str, opts) {
  str = plugins.stringBefore(str);
  var ast = rocambole.parse(str);
  transform(ast, opts);
  str = ast.toString();
  return plugins.stringAfter(str);
}


function transform(ast, opts) {
  _options.set(opts);
  _shouldRemoveTrailingWs = Boolean(_options.get('whiteSpace.removeTrailing'));

  plugins.transformBefore(ast);

  _tk.eachInBetween(ast.startToken, ast.endToken, preprocessToken);
  rocambole.moonwalk(ast, transformNode);
  _tk.eachInBetween(ast.startToken, ast.endToken, postprocessToken);
  _br.limitBeforeEndOfFile(ast);

  // indent should come after all other transformations since it depends on
  // line breaks caused by "parent" nodes, otherwise it will cause conflicts.
  // it should also happen after the postprocessToken since it adds line breaks
  // before/after comments and that changes the indent logic
  indent.transform(ast);

  // plugin transformation comes after the indentation since we assume user
  // knows what he is doing (will increase flexibility and allow plugin to
  // override the indentation logic)
  // we have an alias "transform" to match v0.3 API, but favor `transformAfter`
  // moving forward. (we might deprecate "transform" in the future)
  plugins.transform(ast);
  plugins.transformAfter(ast);

  return ast;
}


function transformNode(node) {
  plugins.nodeBefore(node);
  addBrAroundNode(node);

  var hook = hooks[node.type];
  if (hook && 'format' in hook) {
    hook.format(node);
  }

  // empty program doesn't have startToken or endToken
  if (node.startToken) {
    // automatic white space comes afterwards since line breaks introduced by
    // the hooks affects it
    _ws.limitBefore(node.startToken, node.type);
    _ws.limitAfter(node.endToken, node.type);
  }

  // handle parenthesis automatically since it is needed by multiple node types
  // and it avoids code duplication and reduces complexity of each hook
  expressionParentheses.addSpaceInside(node);
  plugins.nodeAfter(node);
}


function preprocessToken(token) {
  if (_tk.isComment(token)) {
    _br.limit(token, token.type);
  }
  plugins.tokenBefore(token);
}


function postprocessToken(token) {
  if (_tk.isComment(token)) {
    processComment(token);
  } else if (_shouldRemoveTrailingWs && _tk.isWs(token)) {
    removeTrailingWs(token);
  }
  plugins.tokenAfter(token);
}


function processComment(token) {
  _ws.limitBefore(token, token.type);
  // only block comment needs space afterwards
  if (token.type === 'BlockComment') {
    _ws.limitAfter(token, token.type);
  }
}


function removeTrailingWs(token) {
  if (_tk.isBr(token.next) || !token.next) {
    _tk.remove(token);
  }
}
