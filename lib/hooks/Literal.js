"use strict";

var addSpaceInsideExpressionParentheses = require('./addSpaceInsideExpressionParentheses');

module.exports = function Literal(node) {
  addSpaceInsideExpressionParentheses(node);
};
