"use strict";

var _br = require('../util/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../util/whiteSpace');


module.exports = function WhileStatement(node) {
  var conditionalStart = _tk.findNext(node.startToken, '(');
  var conditionalEnd = _tk.findPrev(node.body.startToken, ')');

  // XXX: this will probably need to change when we integrate [#1]
  _tk.removeInBetween(node.startToken, conditionalEnd, 'LineBreak');
  _ws.beforeIfNeeded(conditionalStart, 'WhileStatementConditional');

  if (node.body.type === 'BlockStatement') {
    var bodyStart = node.body.startToken;
    var bodyEnd = node.body.endToken;
    if (!_br.needsBefore('WhileStatementOpeningBrace')) {
      _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
    }
    _br.aroundIfNeeded(bodyStart, 'WhileStatementOpeningBrace');
    _ws.aroundIfNeeded(bodyStart, 'WhileStatementOpeningBrace');
    _br.aroundIfNeeded(bodyEnd, 'WhileStatementClosingBrace');
    _ws.aroundIfNeeded(bodyEnd, 'WhileStatementClosingBrace');
    _ws.afterIfNeeded(conditionalEnd, 'WhileStatementConditional');
  } else if (conditionalEnd.next && conditionalEnd.next.value !== ';') {
    _ws.afterIfNeeded(conditionalEnd, 'WhileStatementConditional');
  }
};
