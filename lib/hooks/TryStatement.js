"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _limit = require('../limit');


module.exports = function TryStatement(node) {
  // do it backwards since it's easier to handle
  var finalizer = node.finalizer;
  if (finalizer) {
    _ws.limit(finalizer.startToken, 'FinallyOpeningBrace');
    _ws.limit(finalizer.endToken, 'FinallyClosingBrace');

    // only break lines if body is not empty
    if (finalizer.body.length) {
      _br.limit(finalizer.startToken, 'FinallyOpeningBrace');
      _br.limit(finalizer.endToken, 'FinallyClosingBrace');
    } else {
      // XXX: empty body, so we should remove all white spaces
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
      // XXX: empty body, so we should remove all white spaces
      _tk.removeEmptyInBetween(handler.body.startToken, handler.body.endToken);
    }
  });

  _limit.around(node.block.startToken, 'TryOpeningBrace');
  _limit.around(node.block.endToken, 'TryClosingBrace');
};
