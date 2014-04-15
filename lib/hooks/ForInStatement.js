"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function ForInStatement(node) {
  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');

  _br.limit(expressionStart, 'ForInStatementExpressionOpening');
  _ws.limit(expressionStart, 'ForInStatementExpressionOpening');

  _br.limit(expressionEnd, 'ForInStatementExpressionClosing');
  _ws.limit(expressionEnd, 'ForInStatementExpressionClosing');

  if (node.body.type === 'BlockStatement' && node.body.body.length) {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;

    _br.limit(bodyStart, 'ForInStatementOpeningBrace');
    _ws.limit(bodyStart, 'ForInStatementOpeningBrace');

    _br.limit(bodyEnd, 'ForInStatementClosingBrace');
    _ws.limit(bodyEnd, 'ForInStatementClosingBrace');

    _ws.limitAfter(expressionEnd, 'ForInStatementExpression');
  }

  _ws.limitAfter(node.left.endToken, 1);
  _ws.limitBefore(node.right.startToken, 1);
};
