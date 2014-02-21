"use strict";

var _ws = require('../whiteSpace/whiteSpace');


module.exports = function ThrowStatement(node) {
  _ws.limit(node.startToken, 'ThrowKeyword');
};
