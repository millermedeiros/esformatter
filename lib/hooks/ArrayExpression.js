"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');



module.exports = function ArrayExpression(node) {
  if (node.elements.length) {
    _ws.limit(node.startToken, 'ArrayExpressionOpening');
    _ws.limit(node.endToken, 'ArrayExpressionClosing');
    node.elements.forEach(function(el) {
      var next = _tk.findNextNonEmpty(el.endToken);
      if (next.value === ',') {
        _ws.limit(next, 'ArrayExpressionComma');
      }
    });
  } else {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }
};


