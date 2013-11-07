"use strict";

var _br = require('../util/lineBreak');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function VariableDeclaration(node) {
  var shouldIndent = node.parent.type !== 'ForStatement';
  var indentLevel = node.indentLevel + 1;

  if (!shouldIndent) {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }

  _tk.removeInBetween(node.startToken, node.declarations[0].startToken, ['WhiteSpace', 'Indent']);

  node.declarations.forEach(function(declarator, i) {
    var idStartToken = declarator.id.startToken;

    // need to swap comma-first line break
    var prevNonEmpty = _tk.findPrevNonEmpty(idStartToken);
    if (i && prevNonEmpty.value === ',') {
      _tk.removeAdjacentBefore(prevNonEmpty, 'Indent');
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
    } else if (shouldIndent) {
      // allow declarations without init on a single line
      if (declarator.init || _br.needsBefore('VariableDeclarationWithoutInit')) {
        _br.beforeIfNeeded(idStartToken, 'VariableName');
        _indent.before(idStartToken, indentLevel);
      } else {
        _ws.beforeIfNeeded(idStartToken, 'VariableName');
      }
    } else {
      _ws.beforeIfNeeded(idStartToken, 'VariableName');
    }

    if (declarator.init) {
      _ws.afterIfNeeded(declarator.id.endToken, 'VariableName');
      var equalSign = _tk.findNext(declarator.id.endToken, '=');
      var valueStart = _tk.findNextNonEmpty(equalSign);
      _tk.removeEmptyAdjacentBefore(valueStart);
      _br.beforeIfNeeded(valueStart, 'VariableValue');
      _ws.beforeIfNeeded(valueStart, 'VariableValue');
    }
  });

  _tk.eachInBetween(node.startToken, node.endToken, function(token) {
    // ASI messes with endToken + comments since comment isn't considered
    // a node "terminator"
    if (_tk.isComment(token) &&
      (token.next !== node.endToken || !_tk.isBr(node.endToken))) {
      _indent.before(token, indentLevel);
    }
  });

  _ws.afterIfNeeded(node.startToken);
};
