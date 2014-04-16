"use strict";

var _tk = require('rocambole-token');

module.exports = function UpdateExpression(node) {
  // XXX: should never have spaces or line breaks before/after "++" and "--"!
  _tk.removeEmptyInBetween(node.startToken, node.endToken);
};
