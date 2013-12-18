"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function CatchClause(node) {
  var opening = _tk.findPrev(node.param.startToken, '(');
  _ws.limitBefore(opening, 'CatchParameterList');
  var closing = _tk.findNext(node.param.endToken, ')');
  _ws.limitAfter(closing, 'CatchParameterList');
};
