"use strict";

var _br = require('../util/lineBreak');
var _brws = require('../util/insert');
var _indent = require('../util/indent');
var _tk = require('../util/token');
var _ws = require('../util/whiteSpace');


module.exports = function TryStatement(node) {
  // do it backwards since it's easier to handle
  var finalizer = node.finalizer;
  if (finalizer) {
    _tk.removeEmptyInBetween(_tk.findPrev(finalizer.startToken, '}'), finalizer.startToken);

    _ws.aroundIfNeeded(finalizer.startToken, 'FinallyOpeningBrace');
    _ws.aroundIfNeeded(finalizer.endToken, 'FinallyClosingBrace');

    // only break lines if body is not empty
    if (finalizer.body.length) {
      _br.aroundIfNeeded(finalizer.startToken, 'FinallyOpeningBrace');
      _br.aroundIfNeeded(finalizer.endToken, 'FinallyClosingBrace');
      // indent finally closing brace when there is a body
      _indent.before(finalizer.endToken, node.closingIndentLevel);
    } else {
      _tk.removeEmptyInBetween(finalizer.startToken, finalizer.endToken);
    }
  }

  node.handlers.forEach(function(handler) {
    _ws.aroundIfNeeded(handler.body.startToken, 'CatchOpeningBrace');
    _ws.aroundIfNeeded(handler.body.endToken, 'CatchClosingBrace');
    // only break lines if body is not empty
    if (handler.body.body.length) {
      _br.aroundIfNeeded(handler.body.startToken, 'CatchOpeningBrace');
      _br.aroundIfNeeded(handler.body.endToken, 'CatchClosingBrace');

      // indent catch closing brace when there is a body
      _indent.before(handler.body.endToken, node.closingIndentLevel);
    } else {
      _tk.removeEmptyInBetween(handler.body.startToken, handler.body.endToken);
    }
  });

  _tk.removeEmptyInBetween(node.startToken, node.block.startToken);
  _brws.aroundIfNeeded(node.block.startToken, 'TryOpeningBrace');
  _brws.aroundIfNeeded(node.block.endToken, 'TryClosingBrace');
  _indent.before(node.block.endToken, node.closingIndentLevel);
};
