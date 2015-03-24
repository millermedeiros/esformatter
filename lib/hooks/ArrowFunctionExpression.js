'use strict';

var tk = require('rocambole-token');
var limit = require('../limit');
var _params = require('./Params');

exports.format = function ArrowFunctionExpression(node) {
  var body = node.body;
  if (body.type === 'BlockStatement') {
    limit.around(body.startToken, 'ArrowFunctionExpressionOpeningBrace');
    limit.around(body.endToken, 'ArrowFunctionExpressionClosingBrace');
  }

  var arrow = tk.findPrev(body.startToken, '=>');
  limit.around(arrow, 'ArrowFunctionExpressionArrow');

  // make sure we handle `(x) => x` and `x => x`
  if (shouldHandleParams(node)) {
    _params.format(node);
  }
};

exports.getIndentEdges = function(node, opts) {
  var edges = [
    node.body
  ];
  if (shouldHandleParams(node)) {
    edges.push(_params.getIndentEdges(node, opts));
  }
  return edges;
};

function shouldHandleParams(node) {
  var p = node.params[node.params.length - 1];
  return tk.findNextNonEmpty(p.endToken).value === ')';
}
