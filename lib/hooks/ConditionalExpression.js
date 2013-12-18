"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function ConditionalExpression(node) {
  // we need to grab the actual punctuators since parenthesis aren't counted
  // as part of test/consequent/alternate
  var questionMark = _tk.findNext(node.test.endToken, '?');
  var colon = _tk.findNext(node.consequent.endToken, ':');

  _tk.removeInBetween(node.test.endToken, _tk.findNextNonEmpty(questionMark), _tk.isWs);
  _tk.removeInBetween(node.consequent.endToken, _tk.findNextNonEmpty(colon), _tk.isWs);

  _ws.limitBefore(questionMark, _ws.needsAfter('ConditionalExpressionTest'));
  _ws.limitAfter(questionMark, _ws.needsBefore('ConditionalExpressionConsequent'));
  _ws.limitBefore(colon, _ws.needsAfter('ConditionalExpressionConsequent'));
  _ws.limitAfter(colon, _ws.needsBefore('ConditionalExpressionAlternate'));
};
