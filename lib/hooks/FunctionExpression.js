"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function FunctionExpression(node) {
  _tk.removeEmptyInBetween(_tk.findPrev(node.body.startToken, ')'), node.body.startToken);
  var emptyExpression = _tk.findNextNonEmpty(node.body.startToken).value === '}';

  if (node.id) {
    _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
  } else {
    _ws.aroundIfNeeded(node.startToken, 'FunctionReservedWord');
  }
  if (node.id) {
    _ws.limitAfter(node.id.startToken, 'FunctionName');
  }
  require('./Params')(node.params);

  _ws.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  if (node.parent.type !== 'CallExpression') {
    _ws.limit(node.endToken, 'FunctionExpressionClosingBrace');
  } else {
    _ws.beforeIfNeeded(node.endToken, 'FunctionExpressionClosingBrace');
  }

  _br.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _br.limit(node.endToken, 'FunctionExpressionClosingBrace');
};
