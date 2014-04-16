"use strict";

var _ws = require('../whiteSpace/whiteSpace');


module.exports = function SequenceExpression(node) {
  node.expressions.forEach(function(expr, i) {
    if (i) {
      var operator = expr.startToken.prev;
      while (operator.value !== ',') {
        operator = operator.prev;
      }
      _ws.limit(operator, 'CommaOperator');
    }
  });
};
