'use strict';

var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');
var br = require('rocambole-linebreak');
var limit = require('../limit');

exports.format = function ClassDeclaration(node) {
  var opening = tk.findNext(node.startToken, '{');
  var closing = node.endToken;
  // yes, we remove all the line breaks and limit to a single whitespace in
  // between the words since line breaks here are stupid and would make things
  // more complex
  limitInBetweenKeywords(node.startToken, opening);
  limit.around(opening, 'ClassDeclarationOpeningBrace');
  limit.around(closing, 'ClassDeclarationClosingBrace');
};

function limitInBetweenKeywords(start, end) {
  var token = start;
  while (token && token !== end) {
    if (!tk.isEmpty(token)) {
      if(token.value === '.') {
        ws.limitAfter(token, 0);
        ws.limitBefore(token, 0);
      } else {
        ws.limitAfter(token, 1);
      }
      br.limitAfter(token, 0);
    }
    token = token.next;
  }
}

exports.getIndentEdges = function(node) {
  return node;
};
