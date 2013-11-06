"use strict";

var addSpaceInsideExpressionParentheses = require('./addSpaceInsideExpressionParentheses');

module.exports = function ExpressionStatement(node) {
  // bypass IIFE
  if (node.expression.type !== 'CallExpression' || node.expression.callee.type !== 'FunctionExpression') {
    addSpaceInsideExpressionParentheses(node);
  }
};
