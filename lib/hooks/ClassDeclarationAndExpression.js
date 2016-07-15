'use strict';

// this file handles both ClassDeclaration and ClassExpression

var br = require('rocambole-linebreak');
var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');
var limit = require('../limit');

exports.format = function ClassDeclarationAndExpression(node) {
  var classKeyword = node.startToken;
  br.limit(classKeyword, 'ClassKeyword');
  ws.limitAfter(classKeyword, 1);

  var opening = node.body.startToken;
  var extendsKeyword = tk.findInBetween(classKeyword, opening, 'extends');
  if (extendsKeyword) {
    br.limit(extendsKeyword, 'ClassExtendsKeyword');
    ws.limit(extendsKeyword, 1);
  }

  limit.around(opening, 'ClassOpeningBrace');
  limit.around(node.body.endToken, 'ClassClosingBrace');
};

exports.getIndentEdges = function(node) {
  return node;
};
