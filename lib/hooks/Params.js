"use strict";

var _ws = require('../whiteSpace');
var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function Params(node) {
  var params = node.params;
  if (params.length) {
    _ws.limitBefore(params[0].startToken, 'ParameterList');
    params.forEach(function(param, i) {
      // if only one param or last one there are no commas to look for
      if (i === params.length - 1) return;

      _ws.limit(_tk.findNext(param.startToken, ','), 'ParameterComma');
    });
    _ws.limitAfter(params[params.length - 1].endToken, 'ParameterList');
  } else {
    var openingParentheses = _tk.findNext(node.startToken, '(');
    _limit.after(openingParentheses, 0);
  }
};
