"use strict";

var _limit = require('../limit');

exports.format = function UpdateExpression(node) {
  // we only really care about spaces between the operator and the argument
  if (node.startToken.value === node.operator) {
    _limit.after(node.startToken, 'UpdateExpressionOperator');
  } else {
    _limit.before(node.endToken, 'UpdateExpressionOperator');
  }
};
