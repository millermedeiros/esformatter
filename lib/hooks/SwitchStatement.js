"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _limit = require('../limit');


module.exports = function SwitchStatement(node) {
  var opening = _tk.findPrev(node.discriminant.startToken, '(');
  var closing = _tk.findNext(node.discriminant.endToken, ')');
  var openingBrace = _tk.findNext(closing, '{');
  var closingBrace = node.endToken;

  _limit.around(openingBrace, 'SwitchOpeningBrace');
  _limit.around(closingBrace, 'SwitchClosingBrace');
  _limit.around(opening, 'SwitchDiscriminantOpening');
  _limit.around(closing, 'SwitchDiscriminantClosing');

  node.cases.forEach(function(caze) {
    if (caze.test) {
      // XXX: we want case to always be on the same line!
      _tk.removeEmptyAdjacentBefore(caze.test.startToken);
      _ws.before(caze.test.startToken);
    }
  });
};

