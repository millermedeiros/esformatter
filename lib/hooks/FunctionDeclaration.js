"use strict";

var _br = require('../util/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../util/whiteSpace');



module.exports = function FunctionDeclaration(node) {
  _tk.removeEmptyInBetween(node.id.startToken, _tk.findNext(node.id.startToken, '{'));

  _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
  require('./Params')(node.params);

  _tk.removeEmptyAdjacentBefore(node.body.endToken);

  _br.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _ws.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _br.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');
  _ws.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');
};
