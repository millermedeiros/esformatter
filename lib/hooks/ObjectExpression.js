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
    }
  });

  if (!shouldBeSingleLine) {
    _tk.removeEmptyAdjacentBefore(node.endToken);
    _br.aroundIfNeeded(node.endToken, 'ObjectExpressionClosingBrace');
    _indent.before(node.endToken, node.closingIndentLevel);
  }
};

