"use strict";

var _ws = require('../whiteSpace');


exports.format = function ThrowStatement(node) {
  _ws.limit(node.startToken, 'ThrowKeyword');
};
