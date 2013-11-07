"use strict";

var _brws = require('../util/insert');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');



module.exports = function FunctionDeclaration(node) {
  _tk.removeEmptyInBetween(node.id.startToken, _tk.findNext(node.id.startToken, '{'));

  _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
  require('./Params')(node.params);

  _tk.removeEmptyAdjacentBefore(node.body.endToken);

  _brws.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _brws.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');

  _indent.ifNeeded(node.body.startToken, node.indentLevel);
  _indent.ifNeeded(node.body.endToken, node.indentLevel);
};
