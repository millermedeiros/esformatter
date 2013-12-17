"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function IfStatement(node) {

  var startBody = node.consequent.startToken;
  var endBody = node.consequent.endToken;

  var conditionalStart = _tk.findPrev(node.test.startToken, '(');
  var conditionalEnd = _tk.findNext(node.test.endToken, ')');

  _tk.removeEmptyInBetween(node.startToken, conditionalStart);
  _tk.removeEmptyInBetween(conditionalEnd, startBody);

  _ws.aroundIfNeeded(conditionalStart, 'IfStatementConditionalOpening');
  _ws.aroundIfNeeded(conditionalEnd, 'IfStatementConditionalClosing');

  var alt = node.alternate;
  if (alt) {
    var elseKeyword = _tk.findPrev(alt.startToken, 'else');
    var startEmptyRemove = _tk.findPrevNonEmpty(elseKeyword);
    if (!(startEmptyRemove.type === 'Punctuator' && startEmptyRemove.value === '}')) {
      startEmptyRemove = elseKeyword;
    }
    _tk.removeEmptyInBetween(startEmptyRemove, alt.startToken);

    if (alt.type === 'IfStatement') {
      // ElseIfStatement
      _ws.before(alt.startToken);

      _br.beforeIfNeeded(alt.consequent.startToken, 'ElseIfStatementOpeningBrace');
      _br.beforeIfNeeded(alt.consequent.endToken, 'ElseIfStatementClosingBrace');
      _br.beforeIfNeeded(elseKeyword, 'ElseIfStatement');
      _br.afterIfNeeded(alt.consequent.endToken, 'ElseIfStatement');
    } else if (alt.type === 'BlockStatement') {
      // ElseStatement
      _ws.beforeIfNeeded(elseKeyword);
      _br.aroundIfNeeded(alt.startToken, 'ElseStatementOpeningBrace');
      _ws.aroundIfNeeded(alt.startToken, 'ElseStatementOpeningBrace');

      if (_br.needsBefore('ElseStatementClosingBrace')) {
        var lastNonEmpty = _tk.findPrevNonEmpty(alt.endToken);
        _tk.removeInBetween(lastNonEmpty, alt.endToken, 'WhiteSpace');
        _br.aroundIfNeeded(alt.endToken, 'ElseStatementClosingBrace');
      } else {
        _ws.aroundIfNeeded(alt.endToken, 'ElseStatementClosingBrace');
      }
      _br.beforeIfNeeded(elseKeyword, 'ElseStatement');
      _br.afterIfNeeded(alt.endToken, 'ElseStatement');
    } else {
      // ElseStatement without curly braces
      _ws.after(elseKeyword); // required
    }
  }

  // only handle braces if block statement
  if (node.consequent.type === 'BlockStatement') {
    _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(endBody), endBody);

    _br.aroundIfNeeded(startBody, 'IfStatementOpeningBrace');
    _ws.aroundIfNeeded(startBody, 'IfStatementOpeningBrace');
    if (!alt) {
      _br.aroundIfNeeded(endBody, 'IfStatementClosingBrace');
    } else {
      _br.beforeIfNeeded(endBody, 'IfStatementClosingBrace');
    }
    _ws.aroundIfNeeded(endBody, 'IfStatementClosingBrace');
  }

};
