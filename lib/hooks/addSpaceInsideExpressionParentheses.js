"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var debug = require('debug')('esformatter:parentheses');


module.exports = function addSpaceInsideExpressionParentheses(node) {
  var opening = node.startToken;
  var closing = node.endToken;

  if (!isValidExpression(node)) {
    debug('not valid expression: %s', node.type);
    return;
  }

  if (node.type === 'BinaryExpression' || opening.value !== '(') {
    var prev = _tk.findPrevNonEmpty(opening);
    opening = isValidParens(prev, node) ? prev : null;
  }

  if (opening && (node.type === 'BinaryExpression' || closing.value !== ')')) {
    var possible = closing.value === ';' || closing.type === 'LineBreak' ?
      _tk.findPrevNonEmpty(closing) : _tk.findNextNonEmpty(closing);
    closing = possible && possible.value === ')' ? possible : null;
  }

  debug(
    'type: %s, opening: "%s", closing: "%s"',
    node.type,
    opening && opening.value,
    closing && closing.value
  );

  if (!opening || !closing) {
    return;
  }

  _ws.limitAfter(opening, 'ExpressionOpeningParentheses');
  _ws.limitBefore(closing, 'ExpressionClosingParentheses');
};


// Literal when inside BinaryExpression might be surrounded by parenthesis
// CallExpression and ArrayExpression don't need spaces
var needExpressionParenthesesSpaces = {
  Literal: true,
  CallExpression: false,
  FunctionExpression: false,
  ArrayExpression: false,
  ObjectExpression: false
};


function isValidExpression(node) {
  var needSpaces = needExpressionParenthesesSpaces[node.type];

  if (needSpaces) {
    return true;
  }

  if (needSpaces == null && node.type.indexOf('Expression') !== -1) {
    if (node.type === 'ExpressionStatement' &&
      (node.expression.callee && node.expression.callee.type === 'FunctionExpression')) {
      // bypass IIFE
      return false;
    }
    return true;
  }

  return false;
}


// this is a hack to check if "(" is part of the parent node to avoid inserting
// unnecessary spaces inside function calls and if statements
function isValidParens(token, node) {
  if (!token || token.value !== '(') {
    return false;
  }

  var pType = node.parent.type;

  if (pType === 'ReturnStatement') return true;

  var prev = _tk.findPrevNonEmpty(token);
  if (pType === 'IfStatement' || pType === 'CallExpression') {
    // we make sure it is not the same
    var opening = _tk.findNext(node.parent.startToken, '(');
    return opening !== token;
  } else {
    // we make sure it is not a regular parentheses
    return !prev || (prev.type !== 'Identifier' && prev.type !== 'Keyword');
  }
}

