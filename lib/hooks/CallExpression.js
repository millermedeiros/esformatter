"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


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
};

exports.getIndentEdges = function(node) {
  if (!node.arguments.length) {
    return false;
  }

  var start;
  var openingParentheses = _tk.findNext(node.callee.endToken, '(');

  node.arguments.some(function(arg, i, args) {
    if (_tk.findInBetween(openingParentheses, arg.startToken, _tk.isBr)) {
      start = i ? args[i - 1].endToken.next : openingParentheses;
      return true;
    }
  });

  return start ? {
    startToken: start,
    endToken: node.endToken
  } : false;

};
