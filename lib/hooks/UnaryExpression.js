"use strict";

var _br = require('../util/lineBreak');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function UnaryExpression(node) {
  if (node.operator === 'delete') {
    _tk.removeEmptyInBetween(node.startToken, _tk.findNextNonEmpty(node.startToken));
    _ws.after(node.startToken);
    _br.beforeIfNeeded(node.startToken, 'DeleteOperator');
    var endToken = node.endToken;
    if (_tk.isSemiColon(endToken.next)) {
      endToken = endToken.next;
    }
    _br.afterIfNeeded(endToken, 'DeleteOperator');
  }
};
