"use strict";

module.exports = function CatchClause(node) {
  var opening = _tk.findPrev(node.param.startToken, '(');
  _ws.beforeIfNeeded(opening, 'CatchParameterList');
  var closing = _tk.findNext(node.param.endToken, ')');
  _ws.afterIfNeeded(closing, 'CatchParameterList');
};
