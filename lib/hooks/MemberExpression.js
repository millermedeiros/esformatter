"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function MemberExpression(node) {
  var opening = _tk.findPrev(node.property.startToken, "["),
    closing = _tk.findNext(node.property.endToken, "]");
  if (opening && closing) {
    _ws.afterIfNeeded(opening, "MemberExpressionOpening");
    _ws.beforeIfNeeded(closing, "MemberExpressionClosing");
  }
};
