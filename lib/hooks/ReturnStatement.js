"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');

var addSpaceInsideExpressionParentheses = require('./addSpaceInsideExpressionParentheses');


module.exports = function ReturnStatement(node) {
  // need to make sure we only remove line breaks inside the node itself
  // because of ASI (see #29)
  var nonEmpty = _tk.findInBetween(node.startToken.next, node.endToken, _tk.isNotEmpty);
  // XXX: this removeEmptyInBetween call should be kept!
  if (nonEmpty) _tk.removeEmptyInBetween(node.startToken, nonEmpty);

  _ws.afterIfNeeded(node.startToken);
  if (_tk.isSemiColon(node.endToken)) {
    // XXX: this removeEmptyInBetween call should be kept!
    _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(node.endToken), node.endToken);
  }

  if (node.argument) {
    addSpaceInsideExpressionParentheses(node.argument);
  }
};
