"use strict";

var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function MemberExpression(node) {
  var opening = _tk.findPrevNonEmpty(node.property.startToken),
    closing = _tk.findNextNonEmpty(node.property.endToken);
  if (opening && closing && opening.value === '[' && closing.value === ']') {
    _ws.limitAfter(opening, "MemberExpressionOpening");
    _ws.limitBefore(closing, "MemberExpressionClosing");
  }
};


exports.getIndentEdges = function(node) {
  var edge = {};
  edge.startToken = node.object.endToken;

  if (node.object.type !== 'CallExpression') {
    edge.startToken = edge.startToken.next;
  }

  edge.endToken = node.endToken;
  if (node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression') {
    edge.endToken = node.parent.endToken;
  }

  // only indent if on a different line
  if (!_tk.findInBetween(edge.startToken, node.property.startToken, _tk.isBr)) {
    return false;
  }

  return edge;
};

