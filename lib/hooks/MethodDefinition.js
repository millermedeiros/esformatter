'use strict';

var br = require('rocambole-linebreak');
var limit = require('../limit');
var tk = require('rocambole-token');
var ws = require('rocambole-whitespace');

exports.format = function MethodDefinition(node) {
  br.limitAfter(node.startToken, 0);

  // key name
  if (node.startToken.value === '[') {
    // computed key
    limit.around(node.startToken, 'MethodDefinitionComputedOpening');
    limit.around(
      tk.findNext(node.key.endToken, ']'),
      'MethodDefinitionComputedClosing'
    );
  } else {
    if (node.startToken !== node.key.startToken) {
      // limit to one space after get/set/static
      ws.limitAfter(node.startToken, 1);
    }
    ws.limitAfter(node.key.endToken, 'MethodDefinitionName');
  }

  // curly braces {}
  var opening = node.value.body.startToken;
  limit.around(opening, 'MethodDefinitionOpeningBrace');
  limit.around(node.endToken, 'MethodDefinitionClosingBrace');
  var bodyFirstNonEmpty = tk.findNextNonEmpty(opening);
  if (bodyFirstNonEmpty.value === '}') {
    // noop
    limit.after(opening, 0);
  }
};
