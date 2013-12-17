"use strict";

var _br = require('../util/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../util/whiteSpace');



module.exports = function SwitchStatement(node) {
  var opening = _tk.findPrev(node.discriminant.startToken, '(');
  var closing = _tk.findNext(node.discriminant.endToken, ')');
  var openingBrace = _tk.findNext(closing, '{');
  var closingBrace = node.endToken;
  _tk.removeEmptyAdjacentBefore(openingBrace);
  _tk.removeEmptyAdjacentBefore(closingBrace);

  _ws.aroundIfNeeded(opening, 'SwitchDiscriminantOpening');
  _ws.aroundIfNeeded(closing, 'SwitchDiscriminantClosing');
  _br.aroundIfNeeded(openingBrace, 'SwitchOpeningBrace');
  _ws.aroundIfNeeded(openingBrace, 'SwitchOpeningBrace');
  _br.aroundIfNeeded(closingBrace, 'SwitchClosingBrace');
  _ws.aroundIfNeeded(closingBrace, 'SwitchClosingBrace');

  node.cases.forEach(function(caze) {
    if (caze.test) {
      _tk.removeEmptyAdjacentBefore(caze.test.startToken);
      _ws.before(caze.test.startToken);
    }
  });
};
