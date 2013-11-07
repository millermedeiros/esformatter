"use strict";

var _br = require('../util/lineBreak');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function LogicalExpression(node) {
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _ws.aroundIfNeeded(operator, 'LogicalExpressionOperator');
  // revert line breaks since parenthesis might not be part of
  // node.startToken and node.endToken
  if (node.parent.type === 'ExpressionStatement') {
    var shouldRevert;
    var prev = _tk.findPrevNonEmpty(node.left.startToken);
    if (prev && prev.value === '(') {
      _tk.removeEmptyInBetween(prev, node.startToken);
      node.startToken = prev;
      shouldRevert = true;
    }
    var next = _tk.findNextNonEmpty(node.right.endToken);
    if (next && next.value === ')') {
      _tk.removeEmptyInBetween(node.endToken, next);
      node.endToken = next;
      shouldRevert = true;
    }
    if (shouldRevert) {
      _br.aroundNodeIfNeeded(node);
    }
  }
};
