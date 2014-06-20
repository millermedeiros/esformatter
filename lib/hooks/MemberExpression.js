"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace');


exports.format = function MemberExpression(node) {
  var opening = _tk.findPrevNonEmpty(node.property.startToken),
    closing = _tk.findNextNonEmpty(node.property.endToken);
  if (opening && closing && opening.value === '[' && closing.value === ']') {
    _ws.limitAfter(opening, "MemberExpressionOpening");
    _ws.limitBefore(closing, "MemberExpressionClosing");
  }
};


exports.getIndentEdges = function(node, opts) {
  if (opts.ChainedMemberExpression && isTopChainedMemberExpression(node)) {
    return {
      startToken: node.startToken.next,
      endToken: node.parent.endToken
    };
  }
};


function isTopChainedMemberExpression(node) {
  return node &&
    node.type === 'MemberExpression' &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression' &&
    node.parent.parent.type === 'ExpressionStatement' &&
    // only indent if line breaks in between tokens
    _tk.findInBetween(node.startToken, node.endToken, 'LineBreak');
}
