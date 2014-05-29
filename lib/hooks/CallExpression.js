"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function CallExpression(node) {
  var args = node['arguments'];
  if (args.length) {
    var firstArg = args[0];
    _limit.before(firstArg.startToken, getArgumentType(firstArg));

    args.forEach(function(arg) {
      var next = _tk.findNextNonEmpty(arg.endToken);
      if (next && next.value === ',') {
        _limit.around(next, 'ArgumentComma');
      }
    });

    var lastArg = args[args.length - 1];
    _limit.after(lastArg.endToken, getArgumentType(lastArg));

  } else {
    var openingParentheses = _tk.findNext(node.callee.endToken, '(');
    var closingParentheses = _tk.findNext(openingParentheses, ')');
    _limit.after(openingParentheses, 0);
    _limit.before(closingParentheses, 0);
  }
};


// these arguments have special rules if they are the first or last arguments
// XXX: maybe do this only if single argument?
var specialTypes = {
  ArrayExpression: true,
  FunctionExpression: true,
  ObjectExpression: true
};

function getArgumentType(arg) {
  var result = 'ArgumentList';
  var type = arg.type;
  if(type in specialTypes) {
    result += type;
  }
  return result;
}


exports.getIndentEdges = function(node) {
  // we only indent if the first argument starts on another line
  var openingParentheses = _tk.findNext(node.callee.endToken, '(');
  if (
    node.arguments.length &&
    _tk.findInBetween(openingParentheses, node.arguments[0].startToken, 'LineBreak')
  ) {
    return {
      startToken: openingParentheses,
      endToken: node.endToken
    };
  }

  return false;
};
