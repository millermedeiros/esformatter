"use strict";

var _br = require('../util/lineBreak');
var _tk = require('rocambole-token');
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

    } else {
      _tk.removeEmptyInBetween(handler.body.startToken, handler.body.endToken);
    }
  });

  _tk.removeEmptyInBetween(node.startToken, node.block.startToken);
  _br.aroundIfNeeded(node.block.startToken, 'TryOpeningBrace');
  _ws.aroundIfNeeded(node.block.startToken, 'TryOpeningBrace');
  _br.aroundIfNeeded(node.block.endToken, 'TryClosingBrace');
  _ws.aroundIfNeeded(node.block.endToken, 'TryClosingBrace');
};
