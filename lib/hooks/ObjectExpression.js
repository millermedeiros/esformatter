"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _limit = require('../limit');


module.exports = function ObjectExpression(node) {
  if (!node.properties.length) return;

  // TODO: improve this, there are probably more edge cases
  var shouldBeSingleLine = node.parent.type === 'ForInStatement';

  if (!shouldBeSingleLine) {
    _limit.around(node.startToken, 'ObjectExpressionOpeningBrace');
  } else {
    // XXX: we still have this rule that looks weird, maybe change it in the
    // future since it is not flexible (edge-case tho)
    _tk.removeEmptyInBetween(node.startToken, node.endToken);
  }

  node.properties.forEach(function(prop) {
    if (!shouldBeSingleLine) {
      _br.limitBefore(prop.startToken, 'Property');
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
      _ws.limitBefore(prop.key.startToken, 'Property');
    }
    _ws.limitAfter(prop.key.endToken, 'PropertyName');
    _ws.limitBefore(prop.value.startToken, 'PropertyValue');
    _ws.limitAfter(prop.value.endToken, 'PropertyValue');
    if (!shouldBeSingleLine) {
      _br.limitAfter(prop.endToken, 'Property');
    }
  });

  if (!shouldBeSingleLine) {
    _limit.around(node.endToken, 'ObjectExpressionClosingBrace');
  }
};
