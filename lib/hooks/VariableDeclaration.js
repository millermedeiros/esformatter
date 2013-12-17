"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function VariableDeclaration(node) {
  var insideFor = node.parent.type === 'ForStatement';

  if (insideFor) {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  } else {
    _tk.removeInBetween(node.startToken, node.declarations[0].startToken, ['WhiteSpace']);
  }

  node.declarations.forEach(function(declarator, i) {
    var idStartToken = declarator.id.startToken;

    // need to swap comma-first line break
    var prevNonEmpty = _tk.findPrevNonEmpty(idStartToken);
    if (i && prevNonEmpty.value === ',') {
      if (_tk.isBr(prevNonEmpty.prev)) {
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
      _br.beforeIfNeeded(idStartToken, 'VariableName');
    }
    _ws.beforeIfNeeded(idStartToken, 'VariableName');

    if (declarator.init) {
      _ws.afterIfNeeded(declarator.id.endToken, 'VariableName');
      var equalSign = _tk.findNext(declarator.id.endToken, '=');
      var valueStart = _tk.findNextNonEmpty(equalSign);
      _tk.removeEmptyAdjacentBefore(valueStart);
      _br.beforeIfNeeded(valueStart, 'VariableValue');
      _ws.beforeIfNeeded(valueStart, 'VariableValue');
    }
  });

  _ws.afterIfNeeded(node.startToken);
};
