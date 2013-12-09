"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');



module.exports = function ArrayExpression(node) {
  if (node.elements.length) {
    _ws.aroundIfNeeded(node.startToken, 'ArrayExpressionOpening');
    _ws.aroundIfNeeded(node.endToken, 'ArrayExpressionClosing');
    node.elements.forEach(function(el) {
      var next = _tk.findNextNonEmpty(el.endToken);
      if (next.value === ',') {
        _ws.aroundIfNeeded(next, 'ArrayExpressionComma');
      }
    });
  } else {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }
};


