"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _params = require('./Params');


module.exports = function FunctionExpression(node) {
  _br.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _br.limit(node.endToken, 'FunctionExpressionClosingBrace');

  if (node.id) {
    _ws.limitAfter(node.id.startToken, 'FunctionName');
  } else {
    _ws.limit(node.startToken, 'FunctionReservedWord');
  }

  _ws.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  if (node.parent.type !== 'CallExpression') {
    _ws.limit(node.endToken, 'FunctionExpressionClosingBrace');
    if (_tk.isWs(node.endToken.next) &&
        _tk.isSemiColon(node.endToken.next.next)) {
      _tk.remove(node.endToken.next);
    }
  } else {
    _ws.limitBefore(node.endToken, 'FunctionExpressionClosingBrace');
  }
  _br.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _br.limit(node.endToken, 'FunctionExpressionClosingBrace');

  var bodyFirstNonEmpty = _tk.findNextNonEmpty(node.body.startToken);
  if (bodyFirstNonEmpty.value === '}') {
    // noop
    _tk.removeEmptyInBetween(node.body.startToken, bodyFirstNonEmpty);
  }

  _params(node);
};
