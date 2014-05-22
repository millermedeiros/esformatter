"use strict";

var _ws = require('../whiteSpace/whiteSpace');


exports.format = function ThrowStatement(node) {
  _ws.limit(node.startToken, 'ThrowKeyword');
};
