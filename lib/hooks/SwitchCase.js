"use strict";

var _ws = require('rocambole-whitespace');
var _br = require('rocambole-linebreak');


exports.format = function SwitchCase(node) {
  if (node.test) {
    // we want case to always be on the same line!
    _br.limitBefore(node.test.startToken, 0);
    _ws.limitBefore(node.test.startToken, 1);
  }
};


exports.getIndentEdges = function(node) {
  return {
    startToken: node.startToken.next,
    endToken: node.endToken.next
  };
};
