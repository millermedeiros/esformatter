'use strict';

var _br = require('rocambole-linebreak');
var _ws = require('rocambole-whitespace');

exports.format = function ExportNamedDeclaration(node) {
  _br.limitAfter(node.startToken, 0);
  _ws.limitAfter(node.startToken, 1);
};
