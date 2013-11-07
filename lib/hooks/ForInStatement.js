"use strict";

var _brws = require('../util/insert');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function ForInStatement(node) {
  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');

  _tk.removeInBetween(node.startToken, expressionEnd, 'LineBreak');
  _tk.removeInBetween(node.startToken, expressionEnd, 'Indent');
  _ws.aroundIfNeeded(expressionStart, 'ForInStatementExpressionOpening');
  _ws.aroundIfNeeded(expressionEnd, 'ForInStatementExpressionClosing');

  if (node.body.type === 'BlockStatement' && node.body.body.length) {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
    _tk.removeAdjacentAfter(bodyStart, 'WhiteSpace');
    _brws.aroundIfNeeded(bodyStart, 'ForInStatementOpeningBrace');
    _brws.aroundIfNeeded(bodyEnd, 'ForInStatementClosingBrace');
    _indent.before(bodyEnd, node.indentLevel);
    _ws.afterIfNeeded(expressionEnd, 'ForInStatementExpression');
  } else if (expressionEnd.next && expressionEnd.next.value !== ';') {
    _ws.afterIfNeeded(expressionEnd, 'ForInStatementExpression');
  }

  _tk.removeEmptyInBetween(node.left.endToken, node.right.startToken);
  _ws.afterIfNeeded(node.left.endToken);
  _ws.beforeIfNeeded(node.right.startToken);
};
