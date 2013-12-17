"use strict";

var _br = require('../lineBreak/lineBreak');
var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function ForStatement(node) {
  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');

  _tk.removeEmptyInBetween(node.startToken, expressionStart);
  _tk.removeInBetween(expressionStart, expressionEnd, 'LineBreak');

  _ws.beforeIfNeeded(expressionStart, 'ForStatementExpression');

  var semi_1,
    semi_2;
  if (node.test) {
    semi_1 = _tk.findPrev(node.test.startToken, ';');
    semi_2 = _tk.findNext(node.test.endToken, ';');
  } else {
    if (node.init) semi_1 = _tk.findNext(node.init.endToken, ';');
    if (node.update) semi_2 = _tk.findPrev(node.update.startToken, ';');
  }

  if (semi_1) _ws.aroundIfNeeded(semi_1, 'ForStatementSemicolon');
  if (semi_2) _ws.aroundIfNeeded(semi_2, 'ForStatementSemicolon');

  if (node.body.type === 'BlockStatement') {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    if (!_br.needsBefore('ForStatementOpeningBrace')) {
      _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
    }
    _tk.removeAdjacentAfter(bodyStart, 'WhiteSpace');
    _br.aroundIfNeeded(bodyStart, 'ForStatementOpeningBrace');
    _ws.aroundIfNeeded(bodyStart, 'ForStatementOpeningBrace');
    _br.aroundIfNeeded(bodyEnd, 'ForStatementClosingBrace');
    _ws.aroundIfNeeded(bodyEnd, 'ForStatementClosingBrace');
    _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
  } else if (expressionEnd.next && expressionEnd.next.value !== ';') {
    _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
  }
};
