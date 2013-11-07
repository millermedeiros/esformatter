"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


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
      _ws.beforeIfNeeded(args[0].startToken, 'ArgumentList');
    }
    args.forEach(function(arg) {
      var next = _tk.findNextNonEmpty(arg.endToken);
      if (next && next.value === ',') {
        _tk.removeEmptyInBetween(arg.endToken, _tk.findNextNonEmpty(next));
        _ws.aroundIfNeeded(next, 'ArgumentComma');
      } else {
        _tk.removeEmptyInBetween(arg.endToken, next);
      }
    });
    if (!checkAfter('FunctionExpression') && !checkAfter('ObjectExpression') && !checkAfter('ArrayExpression')) {
      _ws.afterIfNeeded(args[args.length - 1].endToken, 'ArgumentList');
    }
  }
};
