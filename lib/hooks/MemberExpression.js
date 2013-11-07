"use strict";

var _ast = require('../util/ast');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function MemberExpression(node) {
  // indent chained calls that are on separate lines
  if (node.parent.type === 'CallExpression') {
    var comma = _tk.findPrevNonEmpty(node.property.startToken);
    // check comma value to ignore key[obj] also ignore same line
    if (comma.value === '.') {
      _tk.removeAdjacentBefore(comma, 'Indent');
      if (_tk.isBr(comma.prev)) {
        // indent level should be based on ExpressionStatement since
        // CallExpression and MemberExpression ignore the indent
        var baseIndentNode = _ast.getClosest(node, 'ExpressionStatement');
        var indentLevel = _indent.getLevel(baseIndentNode);
        // they should at least line up with ExpressionStatement if indent
        // is disabled
        if (_indent.shouldIndentType('ChainedMemberExpression')) {
          indentLevel += 1;
        }
        _indent.before(comma, indentLevel);
      }
    }
  }
  var opening = _tk.findPrev(node.property.startToken, "["),
    closing = _tk.findNext(node.property.endToken, "]");
  if (opening && closing) {
    _ws.afterIfNeeded(opening, "MemberExpressionOpening");
    _ws.beforeIfNeeded(closing, "MemberExpressionClosing");
  }
};
