"use strict";

var _tk = require('rocambole-token');

module.exports = function UpdateExpression(node) {
  _tk.removeEmptyInBetween(node.startToken, node.endToken);
};
