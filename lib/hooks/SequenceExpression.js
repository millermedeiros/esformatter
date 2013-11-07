"use strict";

var _ws = require('../util/whiteSpace');


var addSpaceInsideExpressionParentheses = require('./addSpaceInsideExpressionParentheses');

module.exports = function SequenceExpression(node) {
  node.expressions.forEach(function(expr, i) {
    if (i) {
      var operator = expr.startToken.prev;
      while (operator.value !== ',') {
        operator = operator.prev;
      }
      _ws.aroundIfNeeded(operator, 'CommaOperator');
    }
  });
  addSpaceInsideExpressionParentheses(node);
};
