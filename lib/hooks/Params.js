"use strict";

var _ws = require('../whiteSpace/whiteSpace');
var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');


module.exports = function Params(node) {
  var params = node.params;
  if (params.length) {
    _ws.limitBefore(params[0].startToken, 'ParameterList');
    params.forEach(function(param) {
      var next = _tk.findNextNonEmpty(param.startToken);
      if (next.value === ',') {
        _ws.limit(next, 'ParameterComma');
      }
    });
    _ws.limitAfter(params[params.length - 1].endToken, 'ParameterList');
  } else {
    var openingParentheses = _tk.findNext(node.startToken, '(');
    var closingParentheses = _tk.findNext(openingParentheses, ')');
    _tk.removeEmptyInBetween(openingParentheses, closingParentheses);
  }
};
