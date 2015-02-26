"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');
var _parens = require('./expressionParentheses');


exports.format = function CallExpression(node) {
  var args = node['arguments'];
  if (args.length) {
    var firstArg = args[0];
    _limit.before(firstArg.startToken, 'ArgumentList');

    args.forEach(function(arg) {
      var next = _tk.findNextNonEmpty(arg.endToken);
      if (next && next.value === ',') {
        _limit.around(next, 'ArgumentComma');
      }
    });

    var lastArg = args[args.length - 1];
    _limit.after(lastArg.endToken, 'ArgumentList');

  } else {
    var openingParentheses = _tk.findNext(node.callee.endToken, '(');
    var closingParentheses = _tk.findNext(openingParentheses, ')');
    _limit.after(openingParentheses, 0);
    _limit.before(closingParentheses, 0);
  }

  // iife
  if (node.callee.type === 'FunctionExpression') {
    var parens = _parens.getParentheses({
      type: 'Special',
      startToken: node.startToken,
      endToken: node.endToken
    });
    if (parens) {
      _limit.after(parens.opening, 'IIFEOpeningParentheses');
      _limit.before(parens.closing, 'IIFEClosingParentheses');
    }
  }

};

exports.getIndentEdges = function(node, opts) {
  if (!node.arguments.length) {
    return false;
  }

  var start;
  var openingParentheses = _tk.findNext(node.callee.endToken, '(');

  function hasBr(start, end) {
    return _tk.findInBetween(start, end, _tk.isBr);
  }

  node.arguments.some(function(arg, i, args) {
    var prev = i ? args[i - 1].endToken.next : openingParentheses;
    if (hasBr(prev, arg.startToken)) {
      start = prev;
      return true;
    }
  });

  if (!start) {
    // we handle BinaryExpressions here because multiple operations are grouped
    // inside the same root node, and we need to indent if it breaks lines
    node.arguments.some(function(arg) {
      if (opts['CallExpression.' + arg.type] &&
        hasBr(arg.startToken, arg.endToken)) {
        start = arg.startToken.next;
        return true;
      }
    });
  }

  return start ? {
    startToken: start,
    endToken: node.endToken
  } : false;

};
