"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var _limit = require('../limit');
var _params = require('./Params');


exports.format = function FunctionDeclaration(node) {
  if (node.id) {
    _limit.around(node.id.startToken, 'FunctionName');
  }
  // babel-eslint reports async functions as generators.
  //
  // Make sure the generator function is not an async function before removing
  // the whitespace.
  //
  // This will prevent a function such as `async function fun() {}` being
  // converted to `asyncfunction fun() {}`.
  if (node.generator && !node.async) {
    var genToken = _tk.findNextNonEmpty(node.startToken);
    _ws.limitBefore(genToken, 'FunctionGeneratorAsterisk');
  }
  _params.format(node);
  _limit.around(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _limit.around(node.body.endToken, 'FunctionDeclarationClosingBrace');
};


exports.getIndentEdges = function(node, opts) {
  return [
    _params.getIndentEdges(node, opts),
    node.body
  ];
};
