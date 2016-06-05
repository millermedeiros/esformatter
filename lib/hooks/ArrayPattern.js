'use strict';

var limit = require('../limit');
var tk = require('rocambole-token');

exports.format = function ArrayPattern(node) {
  limit.around(node.startToken, 'ArrayPatternOpening');
  limit.around(node.endToken, 'ArrayPatternClosing');

  // array pattern might be like `[a,,b]`, so second element is actually `null`
  // that's why we can't blindly use the el.endToken so we store `searchStart`
  var searchStart = node.startToken;
  node.elements.forEach(function(el) {
    searchStart = tk.findNext(
      el ? el.endToken : searchStart,
      [',', ']']
    );
    if (searchStart.value === ',') {
      limit.around(searchStart, 'ArrayPatternComma');
    }
  });
};
