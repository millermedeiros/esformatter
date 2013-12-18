"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');


module.exports = function TryStatement(node) {
  // do it backwards since it's easier to handle
  var finalizer = node.finalizer;
  if (finalizer) {
    _tk.removeEmptyInBetween(_tk.findPrev(finalizer.startToken, '}'), finalizer.startToken);

    _ws.limit(finalizer.startToken, 'FinallyOpeningBrace');
    _ws.limit(finalizer.endToken, 'FinallyClosingBrace');

    // only break lines if body is not empty
    if (finalizer.body.length) {
      _br.limit(finalizer.startToken, 'FinallyOpeningBrace');
      _br.limit(finalizer.endToken, 'FinallyClosingBrace');
    } else {
      _tk.removeEmptyInBetween(finalizer.startToken, finalizer.endToken);
    }
  }

  node.handlers.forEach(function(handler) {
    _ws.limit(handler.body.startToken, 'CatchOpeningBrace');
    _ws.limit(handler.body.endToken, 'CatchClosingBrace');
    // only break lines if body is not empty
    if (handler.body.body.length) {
      _br.limit(handler.body.startToken, 'CatchOpeningBrace');
      _br.limit(handler.body.endToken, 'CatchClosingBrace');

    } else {
      _tk.removeEmptyInBetween(handler.body.startToken, handler.body.endToken);
    }
  });

  _tk.removeEmptyInBetween(node.startToken, node.block.startToken);
  _br.limit(node.block.startToken, 'TryOpeningBrace');
  _ws.limit(node.block.startToken, 'TryOpeningBrace');
  _br.limit(node.block.endToken, 'TryClosingBrace');
  _ws.limit(node.block.endToken, 'TryClosingBrace');
};
