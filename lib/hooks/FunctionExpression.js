"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace');
var _params = require('./Params');
var _limit = require('../limit');


exports.format = function FunctionExpression(node) {
  _limit.around(node.body.startToken, 'FunctionExpressionOpeningBrace');
  _limit.around(node.endToken, 'FunctionExpressionClosingBrace');

  if (node.id) {
    _ws.limitAfter(node.id.startToken, 'FunctionName');
  } else {
    _ws.limit(node.startToken, 'FunctionReservedWord');
  }

  if (_tk.isWs(node.endToken.next) &&
      _tk.isSemiColon(node.endToken.next.next)) {
    _tk.remove(node.endToken.next);
  }

  if (node.parent.type === 'CallExpression') {
    _ws.limitAfter(node.endToken, 0);
  }

  var bodyFirstNonEmpty = _tk.findNextNonEmpty(node.body.startToken);
  if (bodyFirstNonEmpty.value === '}') {
    // noop
    _limit.after(node.body.startToken, 0);
  }

  _params.format(node);
};


exports.getIndentEdges = function(node, opts) {
  if (!opts.TopLevelFunctionBlock && isTopLevelFunctionBlock(node)) {
    return false;
  }
  return {
    startToken: node.body.startToken,
    endToken: _tk.findPrevNonEmpty(node.body.endToken).next
  };
};


function isTopLevelFunctionBlock(node) {
  return isOfType(node.parent, 'CallExpression') &&
    !isOfType(node.parent.callee, 'MemberExpression') &&
    isOfType(node.parent.parent, 'ExpressionStatement') &&
    isOfType(node.parent.parent.parent, 'Program');
}


// TODO: extract into rocambole-node
function isOfType(node, type) {
  return node && node.type === type;
}
