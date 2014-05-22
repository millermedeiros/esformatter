"use strict";

var _limit = require('../limit');
var _params = require('./Params');


exports.format = function FunctionDeclaration(node) {
  _limit.after(node.id.startToken, 'FunctionName');
  _params.format(node);
  _limit.around(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _limit.around(node.body.endToken, 'FunctionDeclarationClosingBrace');
};


exports.getIndentEdges = function(node) {
  return node.body;
};
