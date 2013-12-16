"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function MemberExpression(node) {
  var opening = _tk.findPrevNonEmpty(node.property.startToken),
    closing = _tk.findNextNonEmpty(node.property.endToken);
  if (opening && closing && opening.value === '[' && closing.value === ']') {
    _ws.afterIfNeeded(opening, "MemberExpressionOpening");
    _ws.beforeIfNeeded(closing, "MemberExpressionClosing");
  }
};
