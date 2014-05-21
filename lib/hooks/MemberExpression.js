"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function MemberExpression(node) {
  var opening = _tk.findPrevNonEmpty(node.property.startToken),
    closing = _tk.findNextNonEmpty(node.property.endToken);
  if (opening && closing && opening.value === '[' && closing.value === ']') {
    _ws.limitAfter(opening, "MemberExpressionOpening");
    _ws.limitBefore(closing, "MemberExpressionClosing");
  }
};


module.exports.getIndentEdges = function(node, opts) {
  if (opts.ChainedMemberExpression && isTopChainedMemberExpression(node)) {
    var edges = [{
      startToken: node.startToken.next,
      endToken: node.endToken
    }];
    var args = node.parent.arguments;
    if (args.length) {
      // FIXME: this is causing conflicts with arguments that also have
      // indentation (adding an extra indentation)
      var arg = args[0];
      edges.push({
        startToken: arg.startToken.prev,
        endToken: node.parent.endToken
      });
    }
    return edges;
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
