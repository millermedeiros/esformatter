'use strict';

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');

exports.format = function ImportDeclaration(node) {
  _br.limitAfter(node.startToken, 0);
  _ws.limitAfter(node.startToken, 1);

  // node.specifiers is actually handled by the ImportSpecifier hook!

  if (!node.specifiers.length) return;

  var fromKeyword = _tk.findPrev(node.endToken, 'from');
  _br.limit(fromKeyword, 0);
  _ws.limit(fromKeyword, 1);
};

exports.getIndentEdges = function(node) {
  // IMPORTANT: getIndentEdges logic is reused by ExportNamedDeclaration
  var braceStart;
  node.specifiers.some(function(spec) {
    var prev = _tk.findPrev(spec.startToken, _tk.isCode);
    if (prev.value === '{') {
      braceStart = prev;
      return true;
    }
  });
  if (!braceStart) {
    return;
  }

  return {
    startToken: braceStart,
    endToken: _tk.findNext(node.specifiers[node.specifiers.length - 1].endToken, '}')
  };
};
