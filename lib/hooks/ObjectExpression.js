"use strict";

var _br = require('../lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace');
var _limit = require('../limit');


exports.format = function ObjectExpression(node) {
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
    // we need to grab first/last "executable" token to avoid issues (see #191)
    var valueStart = _tk.findNextNonEmpty(_tk.findPrev(prop.value.startToken, ':'));
    var eol = _tk.findNext(prop.value.endToken, ['LineBreak', ',', '}']);
    var valueEnd = _tk.findPrev(eol, function(token) {
      return !_tk.isEmpty(token) && !_tk.isComment(token);
    });

    // convert comma-first to comma-last
    var comma = _tk.findNext(prop.value.endToken, [',', '}']);
    if (_tk.isComma(comma)) {
      var br = _tk.findInBetween(prop.value.endToken, comma, _tk.isBr);
      if (br) {
        _tk.remove(br);
      }
      _tk.remove(comma);
      _tk.after(valueEnd, comma);
    }

    if (!shouldBeSingleLine) {
      _br.limitBefore(prop.key.startToken, 'PropertyName');
      _br.limitAfter(prop.key.endToken, 'PropertyName');
      _br.limitBefore(prop.value.startToken, 'PropertyValue');
      _br.limitAfter(prop.value.endToken, 'PropertyValue');
    } else if (prop.key.startToken.prev.value !== '{') {
      _ws.limitBefore(prop.key.startToken, 'Property');
    }

    _ws.limitBefore(prop.key.startToken, 'PropertyName');
    _ws.limitAfter(prop.key.endToken, 'PropertyName');
    _ws.limitBefore(valueStart, 'PropertyValue');
    _ws.limitAfter(valueEnd, 'PropertyValue');
  });

  if (!shouldBeSingleLine) {
    _limit.around(node.endToken, 'ObjectExpressionClosingBrace');
  }
};


exports.getIndentEdges = function(node) {
  // FIXME: maybe find a better way to abstract this kind of logic, this is
  // related to bug #142 but unsure if we will have the same kind of error
  // elsewhere.
  if (node.parent.type === 'ArrayExpression') {
    var isOnSeparateLine = _tk.findInBetween(
      _tk.findPrevNonEmpty(node.startToken),
      node.startToken,
      _tk.isBr
    );
    return isOnSeparateLine ? node : null;
  }

  if (isChainedMemberExpressionArgument(node)) {
    return {
      startToken: node.startToken,
      endToken: _tk.findInBetweenFromEnd(node.startToken, node.endToken, _tk.isBr)
    };
  }

  return node;
};


function isChainedMemberExpressionArgument(node) {
  return (
    node.parent &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression'
  );
}
