"use strict";

var _br = require('../util/lineBreak');
var _brws = require('../util/insert');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


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
    _brws.aroundIfNeeded(bodyStart, 'ForStatementOpeningBrace');
    _brws.aroundIfNeeded(bodyEnd, 'ForStatementClosingBrace');
    _indent.before(bodyEnd, node.indentLevel);
    _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
  } else if (expressionEnd.next && expressionEnd.next.value !== ';') {
    _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
  }
};
