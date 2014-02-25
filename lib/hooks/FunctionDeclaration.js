"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _params = require('./Params');



module.exports = function FunctionDeclaration(node) {
  _tk.removeEmptyInBetween(node.id.startToken, _tk.findNext(node.id.startToken, '{'));

  _ws.limitAfter(node.id.startToken, 'FunctionName');
  _params(node);

  _tk.removeEmptyAdjacentBefore(node.body.endToken);

  _br.limit(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _ws.limit(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _br.limit(node.body.endToken, 'FunctionDeclarationClosingBrace');
  _ws.limit(node.body.endToken, 'FunctionDeclarationClosingBrace');
};
