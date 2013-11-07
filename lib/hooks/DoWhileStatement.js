"use strict";

var _tk = require('../util/token');
var _brws = require('../util/insert');
var _ws = require('../util/whiteSpace');


module.exports = function DoWhileStatement(node) {
  if (node.body.type === 'BlockStatement') {
    _brws.aroundIfNeeded(node.body.startToken, 'DoWhileStatementOpeningBrace');
    _brws.aroundIfNeeded(node.body.endToken, 'DoWhileStatementClosingBrace');
  } else {
    _ws.afterIfNeeded(node.startToken);
  }
  var whileKeyword = _tk.findPrev(node.test.startToken, 'while');
  _ws.aroundIfNeeded(whileKeyword);
};
