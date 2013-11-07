"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function AssignmentExpression(node) {
  // can't use node.right.startToken since it might be surrounded by
  // a parenthesis (see #5)
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _tk.removeEmptyInBetween(node.left.endToken, _tk.findNextNonEmpty(operator));
  _ws.aroundIfNeeded(operator, 'AssignmentOperator');
};
