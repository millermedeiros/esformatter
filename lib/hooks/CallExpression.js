"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _limit = require('../limit');


module.exports = function CallExpression(node) {
  function checkBefore(type) {
    return args[0].type === type && !_ws.needsBefore('ArgumentList' + type);
  }
  function checkAfter(type) {
    return args[args.length - 1].type === type && !_ws.needsAfter('ArgumentList' + type);
  }
  var args = node['arguments'];
  if (args.length) {
    if (!checkBefore('FunctionExpression') && !checkBefore('ObjectExpression') && !checkBefore('ArrayExpression')) {
      var firstArg = args[0].startToken;
      _limit.before(firstArg, 'ArgumentList');
    }
    args.forEach(function(arg) {
      var next = _tk.findNextNonEmpty(arg.endToken);
      if (next && next.value === ',') {
        _limit.around(next, 'ArgumentComma');
      }
    });
    if (!checkAfter('FunctionExpression') && !checkAfter('ObjectExpression') && !checkAfter('ArrayExpression')) {
      var lastArg = args[args.length - 1].endToken;
      _limit.after(lastArg, 'ArgumentList');
    }
  } else {
    var openingParentheses = _tk.findNext(node.callee.endToken, '(');
    var closingParentheses = _tk.findNext(openingParentheses, ')');
    _limit.after(openingParentheses, 0);
    _limit.before(closingParentheses, 0);
  }
};
