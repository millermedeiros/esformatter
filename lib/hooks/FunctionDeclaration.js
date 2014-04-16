"use strict";

var _limit = require('../limit');
var _params = require('./Params');


module.exports = function FunctionDeclaration(node) {
  _limit.after(node.id.startToken, 'FunctionName');
  _params(node);
  _limit.around(node.body.startToken, 'FunctionDeclarationOpeningBrace');
  _limit.around(node.body.endToken, 'FunctionDeclarationClosingBrace');
};

