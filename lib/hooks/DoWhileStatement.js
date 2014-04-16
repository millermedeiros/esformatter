"use strict";

var _tk = require('rocambole-token');
var _br = require('../lineBreak/lineBreak');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function DoWhileStatement(node) {
  if (node.body.type === 'BlockStatement') {
    _br.limit(node.body.startToken, 'DoWhileStatementOpeningBrace');
    _ws.limit(node.body.startToken, 'DoWhileStatementOpeningBrace');
    _br.limit(node.body.endToken, 'DoWhileStatementClosingBrace');
    _ws.limit(node.body.endToken, 'DoWhileStatementClosingBrace');
  } else {
    _ws.limitAfter(node.startToken, 1);
  }
  var whileKeyword = _tk.findPrev(node.test.startToken, 'while');
  _ws.limit(whileKeyword, 1);
};
