"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function WhileStatement(node) {
  var conditionalStart = _tk.findNext(node.startToken, '(');
  var conditionalEnd = _tk.findPrev(node.body.startToken, ')');

  _ws.limitBefore(conditionalStart, 'WhileStatementConditional');

  if (node.body.type === 'BlockStatement') {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    if (!_br.needsBefore('WhileStatementOpeningBrace')) {
      _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
    }
    _br.limit(bodyStart, 'WhileStatementOpeningBrace');
    _ws.limit(bodyStart, 'WhileStatementOpeningBrace');
    _br.limit(bodyEnd, 'WhileStatementClosingBrace');
    _ws.limit(bodyEnd, 'WhileStatementClosingBrace');
    _ws.limitAfter(conditionalEnd, 'WhileStatementConditional');
  } else {
    var next = _tk.findNextNonEmpty(conditionalEnd);
    if (! _tk.isSemiColon(next)) {
      _ws.limitAfter(conditionalEnd, 'WhileStatementConditional');
    }
  }
};
