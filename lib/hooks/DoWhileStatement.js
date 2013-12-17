"use strict";

var _tk = require('rocambole-token');
var _br = require('../util/lineBreak');
var _ws = require('../util/whiteSpace');


module.exports = function DoWhileStatement(node) {
  if (node.body.type === 'BlockStatement') {
    _br.aroundIfNeeded(node.body.startToken, 'DoWhileStatementOpeningBrace');
    _ws.aroundIfNeeded(node.body.startToken, 'DoWhileStatementOpeningBrace');
    _br.aroundIfNeeded(node.body.endToken, 'DoWhileStatementClosingBrace');
    _ws.aroundIfNeeded(node.body.endToken, 'DoWhileStatementClosingBrace');
  } else {
    _ws.afterIfNeeded(node.startToken);
  }
  var whileKeyword = _tk.findPrev(node.test.startToken, 'while');
  _ws.aroundIfNeeded(whileKeyword);
};
