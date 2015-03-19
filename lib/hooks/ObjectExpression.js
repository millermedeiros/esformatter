"use strict";

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
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
    var valueStart;
    if (prop.kind === 'get' || prop.kind === 'set') {
      valueStart = prop.value.startToken;
    } else {
      valueStart = _tk.findNextNonEmpty(_tk.findPrev(prop.value.startToken, ':'));
    }

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

    if (prop.kind === 'get' || prop.kind === 'set') {
      _ws.limitBefore(prop.key.startToken, 1);
      _ws.limitAfter(prop.key.endToken, 0);
      return;
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


exports.getIndentEdges = function(node, opts) {
  function hasBr(start, end) {
    return _tk.findInBetween(start, end, _tk.isBr);
  }
  var edges = [{
    startToken: node.startToken,
    endToken: _tk.findInBetweenFromEnd(node.startToken, node.endToken, _tk.isBr)
  }];
  node.properties.forEach(function(property) {
    if (opts['ObjectExpression.' + property.value.type] &&
        hasBr(property.value.startToken, property.value.endToken)) {
        edges.push({
          startToken: property.value.startToken,
          endToken: property.value.endToken
        });
      }
  });
  return edges;
};
