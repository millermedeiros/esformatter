'use strict';

var br = require('rocambole-linebreak');
var limit = require('../limit');
var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');

exports.format = function MethodDefinition(node) {
  br.limitAfter(node.startToken, 0);
  // limit to one space after get/set/static
  if (node.startToken !== node.key.startToken) {
    ws.limitAfter(node.startToken, 1);
  }
  ws.limitAfter(node.key.endToken, 'MethodDefinitionName');

  // parentheses {}
  var opening = node.value.body.startToken;
  limit.around(opening, 'MethodDefinitionOpeningBrace');
  limit.around(node.endToken, 'MethodDefinitionClosingBrace');
  var bodyFirstNonEmpty = tk.findNextNonEmpty(opening);
  if (bodyFirstNonEmpty.value === '}') {
    // noop
    limit.after(opening, 0);
  }
};
