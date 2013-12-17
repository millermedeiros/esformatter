"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function VariableDeclaration(node) {
  var insideFor = node.parent.type === 'ForStatement';

  if (insideFor) {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }

  node.declarations.forEach(function(declarator, i) {
    var idStartToken = declarator.id.startToken;

    // need to swap comma-first line break
    var prevNonEmpty = _tk.findPrevNonEmpty(idStartToken);
    if (i && prevNonEmpty.value === ',') {
      if (_tk.isBr(prevNonEmpty.prev) || _tk.isBr(prevNonEmpty.prev.prev)) {
        var beforeComma = _tk.findPrev(prevNonEmpty, function(t) {
          return !_tk.isEmpty(t) && !_tk.isComment(t);
        });
        _tk.remove(prevNonEmpty);
        _tk.after(beforeComma, prevNonEmpty);
      }
    }

    if (!i && !_tk.isComment(_tk.findPrevNonEmpty(idStartToken))) {
      _tk.removeEmptyAdjacentBefore(idStartToken);
    } else if (!insideFor &&
       (declarator.init || _br.needsBefore('VariableDeclarationWithoutInit'))) {
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

  _ws.afterIfNeeded(node.startToken);
};
