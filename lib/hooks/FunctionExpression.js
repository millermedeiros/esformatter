"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function FunctionExpression(node) {
  _br.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _br.limit(node.endToken, 'FunctionExpressionClosingBrace');

  if (_tk.findNextNonEmpty(node.body.startToken).value === '}') {
    // noop
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  } else {
    if (node.id) {
      _ws.limitAfter(node.id.startToken, 'FunctionName');
    }
    require('./Params')(node.params);

    _ws.limit(node.body.startToken, 'FunctionExpressionOpeningBrace');
    if (node.parent.type !== 'CallExpression') {
      _ws.limit(node.endToken, 'FunctionExpressionClosingBrace');
    } else {
      _ws.limitBefore(node.endToken, 'FunctionExpressionClosingBrace');
    }
  }
};
