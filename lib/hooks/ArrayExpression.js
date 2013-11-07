"use strict";

var _indent = require('../util/indent');
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

  // add indentation inside arrays containing break lines
  indentArrayContent(node);
};


function indentArrayContent(node) {
  var indentLevel = node.indentLevel;

  var token = node.startToken;
  while (token && token !== node.endToken) {
    if (_tk.isIndent(token.next)) {
      _tk.remove(token.next);
    }
    if (token.type === 'Punctuator' && token.value === ']') {
      indentLevel -= 1;
    }
    if (_tk.isBr(token.prev) &&
      token.type !== 'LineComment') {
      _indent.before(token, indentLevel);
    }
    if (token.type === 'Punctuator' && token.value === '[') {
      indentLevel += 1;
    }
    token = token.next;
  }
}
