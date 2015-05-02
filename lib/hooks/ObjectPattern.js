'use strict';

var br = require('rocambole-linebreak');
var ws = require('rocambole-whitespace');

exports.format = function ObjectPattern(node) {
  node.properties.forEach(function(prop, index) {
    if (!prop) return;

    br.limit(prop.startToken, 0);
    if (index !== 0) {
      ws.limitBefore(prop.startToken, 1);
    }

    if (index == node.properties.length - 1) {
      ws.limitAfter(prop.startToken, 0);
    }
  });
};
