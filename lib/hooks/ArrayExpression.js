"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function ArrayExpression(node) {
  if (node.elements.length) {
    _limit.around(node.startToken, 'ArrayExpressionOpening');
    _limit.around(node.endToken, 'ArrayExpressionClosing');

    node.elements.forEach(function(el) {
      // sparse arrays have `null` elements
      if (!el) return;

      var prev = _tk.findPrevNonEmpty(el.startToken);
      if (prev.value === ',') {
        _limit.around(prev, 'ArrayExpressionComma');
      }
    });
  } else {
    // empty array should be single line
    _limit.after(node.startToken, 0);
  }
};


exports.getIndentEdges = function(node) {
  if (!node.elements.length) return;

  var closingIsOnSeparateLine = _tk.findInBetween(
    _tk.findPrevNonEmpty(node.endToken),
    node.endToken,
    _tk.isBr
  );

  return {
    startToken: node.startToken,
    endToken: closingIsOnSeparateLine ?
      node.endToken :
      _tk.findInBetweenFromEnd(node.startToken, node.endToken, _tk.isBr)
  };
};
