"use strict";

var _br = require('../util/lineBreak');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function FunctionExpression(node) {
  _tk.removeEmptyInBetween(_tk.findPrev(node.body.startToken, ')'), node.body.startToken);

  if (_tk.findNextNonEmpty(node.body.startToken).value === '}') {
    // noop
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  } else {
    if (node.id) {
      _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
    }
    require('./Params')(node.params);

    _ws.aroundIfNeeded(node.body.startToken, 'FunctionExpressionOpeningBrace');
    if (node.parent.type !== 'CallExpression') {
      _ws.aroundIfNeeded(node.endToken, 'FunctionExpressionClosingBrace');
    } else {
      _ws.beforeIfNeeded(node.endToken, 'FunctionExpressionClosingBrace');
    }

    _br.aroundIfNeeded(node.body.startToken, 'FunctionExpressionOpeningBrace');
    _br.aroundIfNeeded(node.endToken, 'FunctionExpressionClosingBrace');
    _indent.ifNeeded(node.body.endToken, node.closingIndentLevel);
  }
};
