"use strict";

var _br = require('../util/lineBreak');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function ObjectExpression(node) {
  if (!node.properties.length) return;

  // TODO: improve this, there are probably more edge cases
  var shouldBeSingleLine = node.parent.type === 'ForInStatement';

  if (!shouldBeSingleLine) {
    _br.aroundIfNeeded(node.startToken, 'ObjectExpressionOpeningBrace');
  } else {
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }

  var extraIndent = false;
  // ObjectExpression within CallExpression within MemberExpression may need extra indent
  if (node.parent.type === 'CallExpression' && node.parent.callee.type === 'MemberExpression') {
    var comma = _tk.findPrevNonEmpty(node.parent.callee.property.startToken);
    if (comma.value === '.' && _tk.isIndent(comma.prev)) {
      extraIndent = true;
      node.closingIndentLevel += 1;
    }
  }

  node.properties.forEach(function(prop) {
    if (!shouldBeSingleLine) {
      _br.beforeIfNeeded(prop.startToken, 'Property');
    }
    var token = prop.endToken.next;
    while (token && token.value !== ',' && token.value !== '}') {
      // TODO: toggle behavior if comma-first
      if (token.type === 'LineBreak') {
        _tk.remove(token);
      }
      token = token.next;
    }

    if (shouldBeSingleLine && prop.key.startToken.prev.value !== '{') {
      _ws.beforeIfNeeded(prop.key.startToken, 'Property');
    }
    _ws.afterIfNeeded(prop.key.endToken, 'PropertyName');
    _ws.beforeIfNeeded(prop.value.startToken, 'PropertyValue');
    if (!shouldBeSingleLine) {
      _br.afterIfNeeded(prop.endToken, 'Property');
      if (extraIndent) {
        _indent.edit(prop.key.startToken.prev, node.closingIndentLevel + 1);
      }
    }
  });

  if (extraIndent) {
    _indent.editCommentIndentInBetween(node.startToken, node.endToken, node.closingIndentLevel + 1);
  }

  if (!shouldBeSingleLine) {
    _tk.removeEmptyAdjacentBefore(node.endToken);
    _br.aroundIfNeeded(node.endToken, 'ObjectExpressionClosingBrace');
    _indent.before(node.endToken, node.closingIndentLevel);
  }
};
