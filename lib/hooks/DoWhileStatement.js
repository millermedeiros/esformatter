"use strict";


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

