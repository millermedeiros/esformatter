"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function UnaryExpression(node) {
  if (node.operator === 'delete') {
    _ws.limitAfter(node.startToken, 1);
    _br.limitBefore(node.startToken, 'DeleteOperator');

    var endToken = node.endToken;
    if (_tk.isWs(endToken.next)) {
      _ws.limitAfter(endToken, 0);
    }
    if (_tk.isSemiColon(endToken.next)) {
      endToken = endToken.next;
    }
    _br.limitAfter(endToken, 'DeleteOperator');
  } else if (node.operator === 'typeof' || node.operator === 'void') {
    _ws.limitAfter(node.startToken, 1);
  } else {
    // multiple consecutive operators like `!!foo` should not have spaces in
    // between then (we consider whole block as a single operator)
    var operator = node.startToken;
    var prev = _tk.findPrev(operator, _tk.isNotEmpty);
    if (prev && prev.value === operator.value) {
      _ws.limitBefore(operator, 0);
    } else {
      _ws.limitBefore(operator, 'UnaryExpressionOperator');
    }
    var next = _tk.findNext(operator, _tk.isNotEmpty);
    if (next && next.value === operator.value) {
      _ws.limitAfter(operator, 0);
    } else {
      _ws.limitAfter(operator, 'UnaryExpressionOperator');
    }
  }
};
