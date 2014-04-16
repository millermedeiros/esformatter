"use strict";

var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');
var _br = require('../lineBreak/lineBreak');
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
      // we want case to always be on the same line!
      _br.limitBefore(caze.test.startToken, 0);
      _ws.limitBefore(caze.test.startToken, 1);
    }
  });
};

