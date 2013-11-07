"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


var addSpaceInsideExpressionParentheses = require('./addSpaceInsideExpressionParentheses');

module.exports = function BinaryExpression(node) {
  _tk.removeInBetween(node.startToken, node.endToken, ['LineBreak', 'Indent']);
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _ws.aroundIfNeeded(operator, 'BinaryExpressionOperator');
  addSpaceInsideExpressionParentheses(node);
};
