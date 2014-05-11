"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function UnaryExpression(node) {
  if (node.operator === 'delete') {
    _ws.limitAfter(node.startToken, 1);
    _br.limitBefore(node.startToken, 'DeleteOperator');
    var endToken = node.endToken;
    if (_tk.isSemiColon(endToken.next)) {
      endToken = endToken.next;
    }
    _br.limitAfter(endToken, 'DeleteOperator');
  } else if (node.operator === 'typeof') {
    _ws.limitAfter(node.startToken, 1);
  } else {
    _ws.limit(node.startToken, 'UnaryExpressionOperator');
  }
};
