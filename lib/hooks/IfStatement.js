"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function IfStatement(node) {

  var startBody = node.consequent.startToken;
  var endBody = node.consequent.endToken;

  var conditionalStart = _tk.findPrev(node.test.startToken, '(');
  var conditionalEnd = _tk.findNext(node.test.endToken, ')');

  _ws.limit(conditionalStart, 'IfStatementConditionalOpening');
  _ws.limit(conditionalEnd, 'IfStatementConditionalClosing');

  var alt = node.alternate;
  if (alt) {
    var elseKeyword = _tk.findPrev(alt.startToken, 'else');

    if (alt.type === 'IfStatement') {
      // ElseIfStatement
      _br.limitBefore(alt.startToken, 0);
      _ws.limitBefore(alt.startToken, 1);

      _br.limitBefore(alt.consequent.startToken, 'ElseIfStatementOpeningBrace');
      _br.limitBefore(alt.consequent.endToken, 'ElseIfStatementClosingBrace');
      _br.limitBefore(elseKeyword, 'ElseIfStatement');
      if (! alt.alternate) {
        // we only limit the line breaks after the ElseIfStatement if it is not
        // followed by an ElseStatement, otherwise it would add line breaks
        // that it shouldn't
        _br.limitAfter(alt.consequent.endToken, 'ElseIfStatement');
      }

    } else if (alt.type === 'BlockStatement') {
      // ElseStatement

      _br.limit(alt.startToken, 'ElseStatementOpeningBrace');
      _ws.limit(alt.startToken, 'ElseStatementOpeningBrace');

      _br.limitBefore(elseKeyword, 'ElseStatement');
      _br.limitAfter(alt.endToken, 'ElseStatement');

      _ws.limitBefore(elseKeyword, 1);

      _br.limit(alt.endToken, 'ElseStatementClosingBrace');
      _ws.limit(alt.endToken, 'ElseStatementClosingBrace');
    } else {
      // ElseStatement without curly braces
      _ws.limitAfter(elseKeyword, 1);
    }
  }

  // only handle braces if block statement
  if (node.consequent.type === 'BlockStatement') {
    _br.limit(startBody, 'IfStatementOpeningBrace');
    _ws.limit(startBody, 'IfStatementOpeningBrace');
    if (!alt) {
      _br.limit(endBody, 'IfStatementClosingBrace');
    } else {
      _br.limitBefore(endBody, 'IfStatementClosingBrace');
    }
    _ws.limit(endBody, 'IfStatementClosingBrace');
  }

};
