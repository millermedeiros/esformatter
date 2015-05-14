"use strict";

var _limit = require('../limit');
var _params = require('./Params');


exports.format = function FunctionDeclaration(node) {
  if (node.id) {
    _limit.around(node.id.startToken, 'FunctionName');
  }
  _params.format(node);
  _limit.around(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _limit.around(node.body.endToken, 'FunctionDeclarationClosingBrace');
};


exports.getIndentEdges = function(node, opts) {
  return [
    _params.getIndentEdges(node, opts),
    node.body
  ];
};
