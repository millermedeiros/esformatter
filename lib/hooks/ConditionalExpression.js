"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function ConditionalExpression(node) {
  // we need to grab the actual punctuators since parenthesis aren't counted
  // as part of test/consequent/alternate
  var questionMark = _tk.findNext(node.test.endToken, '?');
  var colon = _tk.findNext(node.consequent.endToken, ':');

  _tk.removeInBetween(node.test.endToken, _tk.findNextNonEmpty(questionMark), _tk.isWs);
  _tk.removeInBetween(node.consequent.endToken, _tk.findNextNonEmpty(colon), _tk.isWs);

  _ws.beforeIfNeeded(questionMark, _ws.needsAfter('ConditionalExpressionTest'));
  _ws.afterIfNeeded(questionMark, _ws.needsBefore('ConditionalExpressionConsequent'));
  _ws.beforeIfNeeded(colon, _ws.needsAfter('ConditionalExpressionConsequent'));
  _ws.afterIfNeeded(colon, _ws.needsBefore('ConditionalExpressionAlternate'));
};
