"use strict";

var _tk = require('rocambole-token');
var _br = require('../lineBreak');
var _ws = require('../whiteSpace');



exports.format = function ArrayExpression(node) {
  if (node.elements.length) {
    _ws.limit(node.startToken, 'ArrayExpressionOpening');
    _ws.limit(node.endToken, 'ArrayExpressionClosing');

    node.elements.forEach(function(el) {
      // sparse arrays have `null` elements
      if (!el) return;

      var prev = _tk.findPrevNonEmpty(el.startToken);
      if (prev.value === ',') {
        _ws.limit(prev, 'ArrayExpressionComma');
      }
    });
  } else {
    // empty array should be single line
    _ws.limitAfter(node.startToken, 0);
    _br.limitAfter(node.startToken, 0);
    _ws.limitBefore(node.endToken, 0);
    _br.limitBefore(node.endToken, 0);
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
