"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function BinaryExpression(node) {
  _tk.removeInBetween(node.startToken, node.endToken, ['LineBreak', 'Indent']);
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _ws.aroundIfNeeded(operator, 'BinaryExpressionOperator');
};
