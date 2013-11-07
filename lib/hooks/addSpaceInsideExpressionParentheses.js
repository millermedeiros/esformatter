"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function addSpaceInsideExpressionParentheses(node) {
  var opening = node.startToken;
  var closing = node.endToken;

  if (node.type === 'BinaryExpression' || opening.value !== '(') {
    var prev = _tk.findPrevNonEmpty(opening);
    opening = prev && _tk.isExpressionOpening(prev) ? prev : null;
  }

  if (opening && (node.type === 'BinaryExpression' || closing.value !== ')')) {
    var possible = closing.value === ';' || closing.type === 'LineBreak' ?
      _tk.findPrevNonEmpty(closing) : _tk.findNextNonEmpty(closing);
    closing = possible && possible.value === ')' ? possible : null;
  }

  if (!opening || !closing) {
    return;
  }

  _ws.afterIfNeeded(opening, 'ExpressionOpeningParentheses');
  _ws.beforeIfNeeded(closing, 'ExpressionClosingParentheses');
};
