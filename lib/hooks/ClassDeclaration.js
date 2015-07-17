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
  var allowLimitBefore = true;
  while (token && token !== end) {
    if (!tk.isEmpty(token)) {
      if (!tk.isEmpty(token)) {
        br.limitAfter(token, 0);
        if(token.type === 'Punctuator') {
          switch(token.value) {
            case '.':
              ws.limitAfter(token, 0);
              ws.limitBefore(token, 0);
              allowLimitBefore = false;
              break;
            case '[':
            case '(':
              ws.limitAfter(token, 0);
              ws.limitBefore(token, 0);
              if(token.prev && token.prev.value === 'extends') {
                ws.limitBefore(token, 1);
              }
              allowLimitBefore = false;
              break;
            default:
              ws.limitAfter(token, 1);
              ws.limitBefore(token, 0);
              allowLimitBefore = true;
          }
        } else {
          if(allowLimitBefore) {
            ws.limitBefore(token, 1);
          }
          ws.limitAfter(token, 1);
          allowLimitBefore = true;
        }
      }
    }
    token = token.next;
  }
}

exports.getIndentEdges = function(node) {
  return node;
};
