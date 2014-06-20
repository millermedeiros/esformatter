"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace');


exports.format = function BinaryExpression(node) {
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _ws.limit(operator, 'BinaryExpressionOperator');
};
