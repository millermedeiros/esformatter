"use strict";

var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function ReturnStatement(node) {
  // need to make sure we only remove line breaks inside the node itself
  // because of ASI (see #29)
  var nonEmpty = _tk.findInBetween(node.startToken.next, node.endToken, _tk.isNotEmpty);
  if (nonEmpty) _tk.removeEmptyInBetween(node.startToken, nonEmpty);

  _ws.afterIfNeeded(node.startToken);
  if (_tk.isSemiColon(node.endToken)) {
    _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(node.endToken), node.endToken);
  }
};
