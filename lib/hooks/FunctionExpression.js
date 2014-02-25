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

  _params(node);

  _ws.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  if (node.parent.type !== 'CallExpression') {
    _ws.limit(node.endToken, 'FunctionExpressionClosingBrace');
  } else {
    _ws.limitBefore(node.endToken, 'FunctionExpressionClosingBrace');
  }

  _br.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _br.limit(node.endToken, 'FunctionExpressionClosingBrace');
};
