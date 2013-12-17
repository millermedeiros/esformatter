"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function ForInStatement(node) {
  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');

  _tk.removeInBetween(node.startToken, expressionEnd, 'LineBreak');
  _ws.aroundIfNeeded(expressionStart, 'ForInStatementExpressionOpening');
  _ws.aroundIfNeeded(expressionEnd, 'ForInStatementExpressionClosing');

  if (node.body.type === 'BlockStatement' && node.body.body.length) {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
    _tk.removeAdjacentAfter(bodyStart, 'WhiteSpace');
    _br.aroundIfNeeded(bodyStart, 'ForInStatementOpeningBrace');
    _ws.aroundIfNeeded(bodyStart, 'ForInStatementOpeningBrace');
    _br.aroundIfNeeded(bodyEnd, 'ForInStatementClosingBrace');
    _ws.aroundIfNeeded(bodyEnd, 'ForInStatementClosingBrace');
    _ws.afterIfNeeded(expressionEnd, 'ForInStatementExpression');
  } else if (expressionEnd.next && expressionEnd.next.value !== ';') {
    _ws.afterIfNeeded(expressionEnd, 'ForInStatementExpression');
  }

  _tk.removeEmptyInBetween(node.left.endToken, node.right.startToken);
  _ws.afterIfNeeded(node.left.endToken);
  _ws.beforeIfNeeded(node.right.startToken);
};
