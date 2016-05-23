"use strict";

var _limit = require('../limit');

exports.format = function BlockStatement(node) {
  if (!shouldHandle(node)) {
    return;
  }

  _limit.around(node.startToken, 'BlockStatementOpeningBrace');
  _limit.around(node.endToken, 'BlockStatementClosingBrace');
};

function shouldHandle(node) {
  // BlockStatement is very generic and used in a bunch of different cases
  // (function/do/while/arrowFunction/for/forOf/...) so we only handle a few
  // cases here and let the other hooks take care of everything else
  return node.parent.type === 'Program' ||
    node.parent.type === 'BlockStatement';
}

exports.getIndentEdges = function(node) {
  if (!shouldHandle(node)) {
    return false;
  }
  return node;
};
