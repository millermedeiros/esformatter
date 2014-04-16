"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');

var addSpaceInsideExpressionParentheses = require('./addSpaceInsideExpressionParentheses');


module.exports = function ReturnStatement(node) {
  // need to make sure we only remove line breaks inside the node itself
  // because of ASI (see #29)
  var nonEmpty = _tk.findInBetween(node.startToken.next, node.endToken, _tk.isNotEmpty);
  // XXX: we want to remove line breaks and white spaces inside the node, not
  // using _br.limitAfter to avoid changing the program behavior (ASI)
  if (nonEmpty) _tk.removeEmptyInBetween(node.startToken, nonEmpty);

  _ws.limitAfter(node.startToken, 1);
  if (_tk.isSemiColon(node.endToken)) {
    // XXX: we want semicolon to be on same line and no whitespaces for now.
    _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(node.endToken), node.endToken);
  }

  if (node.argument) {
    addSpaceInsideExpressionParentheses(node.argument);
  }
};
