"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _limit = require('../limit');


module.exports = function ForStatement(node) {
  var expressionStart = _tk.findNext(node.startToken, '(');
  var expressionEnd = _tk.findPrev(node.body.startToken, ')');

  _limit.around(expressionStart, 'ForStatementExpressionOpening');
  _limit.around(expressionEnd, 'ForStatementExpressionClosing');

  var semi_1,
    semi_2;
  if (node.test) {
    semi_1 = _tk.findPrev(node.test.startToken, ';');
    semi_2 = _tk.findNext(node.test.endToken, ';');
  } else {
    if (node.init) semi_1 = _tk.findNext(node.init.endToken, ';');
    if (node.update) semi_2 = _tk.findPrev(node.update.startToken, ';');
  }

  if (semi_1) _ws.limit(semi_1, 'ForStatementSemicolon');
  if (semi_2) _ws.limit(semi_2, 'ForStatementSemicolon');

  if (node.body.type === 'BlockStatement') {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    _limit.around(bodyStart, 'ForStatementOpeningBrace');
    _limit.around(bodyEnd, 'ForStatementClosingBrace');
  }
};
