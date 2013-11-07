"use strict";

var _brws = require('../util/insert');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');



module.exports = function SwitchStatement(node) {
  var opening = _tk.findPrev(node.discriminant.startToken, '(');
  var closing = _tk.findNext(node.discriminant.endToken, ')');
  var openingBrace = _tk.findNext(closing, '{');
  var closingBrace = node.endToken;
  _tk.removeEmptyAdjacentBefore(openingBrace);
  _tk.removeEmptyAdjacentBefore(closingBrace);

  _ws.aroundIfNeeded(opening, 'SwitchDiscriminantOpening');
  _ws.aroundIfNeeded(closing, 'SwitchDiscriminantClosing');
  _brws.aroundIfNeeded(openingBrace, 'SwitchOpeningBrace');
  _brws.aroundIfNeeded(closingBrace, 'SwitchClosingBrace');

  _indent.before(openingBrace, node.indentLevel);

  node.cases.forEach(function(caze, i) {
    if (caze.test) {
      _tk.removeEmptyAdjacentBefore(caze.test.startToken);
      _ws.before(caze.test.startToken);
    }
    // re-indent comments to proper level
    var prevCaseEnd = i === 0 ? openingBrace : node.cases[i - 1].endToken;
    _indent.editCommentIndentInBetween(prevCaseEnd, caze.startToken, caze.indentLevel);
    _indent.editCommentIndentInBetween(caze.startToken, caze.endToken, caze.indentLevel + 1);
  });
  _indent.before(closingBrace, node.closingIndentLevel);
};
