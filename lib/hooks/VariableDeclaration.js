"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');


exports.format = function VariableDeclaration(node) {
  var insideFor = node.parent.type === 'ForStatement';

  node.declarations.forEach(function(declarator, i) {
    var idStartToken = declarator.id.startToken;

    // need to swap comma-first line break
    var prevNonEmpty = _tk.findPrevNonEmpty(idStartToken);
    if (i && prevNonEmpty.value === ',') {
      if (_tk.isBr(prevNonEmpty.prev) || _tk.isBr(prevNonEmpty.prev.prev)) {
        var beforeComma = _tk.findPrev(prevNonEmpty, function(t) {
          return !_tk.isEmpty(t) && !_tk.isComment(t);
        });
        _ws.limit(prevNonEmpty, 0);
        _tk.remove(prevNonEmpty);
        _tk.after(beforeComma, prevNonEmpty);
      }
    }

    if (!i && !_tk.isComment(_tk.findPrevNonEmpty(idStartToken))) {
      // XXX: we don't allow line breaks or multiple spaces after "var"
      // keyword for now (might change in the future)
      _tk.removeEmptyAdjacentBefore(idStartToken);
    } else if (!insideFor && declarator.init) {
      _br.limit(idStartToken, 'VariableName');
    }
    _ws.limitBefore(idStartToken, 'VariableName');

    if (declarator.init) {
      _ws.limitAfter(declarator.id.endToken, 'VariableName');
      var equalSign = _tk.findNext(declarator.id.endToken, '=');
      var valueStart = _tk.findNextNonEmpty(equalSign);
      _br.limitBefore(valueStart, 'VariableValue');
      _ws.limitBefore(valueStart, 'VariableValue');
      _br.limitAfter(declarator.endToken, 'VariableValue');
      _ws.limitAfter(declarator.endToken, 'VariableValue');
    }
  });

  // always add a space after the "var" keyword
  _ws.limitAfter(node.startToken, 1);
};


exports.getIndentEdges = function(node, opts) {
  var edges = [];

  if (opts.MultipleVariableDeclaration && node.declarations.length > 1) {
    edges.push(node);
  }

  node.declarations.forEach(function(declaration) {
    var init = declaration.init;
    if (init && opts['VariableDeclaration.' + init.type]) {
      edges.push({
        startToken: init.startToken,
        endToken: init.endToken.next || node.endToken
      });
    }
  });

  return edges;
};
