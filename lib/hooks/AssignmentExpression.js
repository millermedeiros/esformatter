"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace');
var _br = require('../lineBreak');


exports.format = function AssignmentExpression(node) {
  // can't use node.right.startToken since it might be surrounded by
  // a parenthesis (see #5)
  var operator = _tk.findNext(node.left.endToken, node.operator);
  _br.limit(operator, 'AssignmentOperator');
  _ws.limit(operator, 'AssignmentOperator');
};


exports.getIndentEdges = function(node) {
  var operator = _tk.findNext(node.left.endToken, node.operator);
  if (_tk.findInBetween(operator, node.right.startToken, _tk.isBr)) {
    // we only indent if assignment is on next line
    return {
      startToken: operator,
      endToken: node.endToken
    };
  }
};
