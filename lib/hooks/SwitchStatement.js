"use strict";

var _br = require('../lineBreak/lineBreak');
var _tk = require('rocambole-token');
var _ws = require('../whiteSpace/whiteSpace');



module.exports = function SwitchStatement(node) {
  var opening = _tk.findPrev(node.discriminant.startToken, '(');
  var closing = _tk.findNext(node.discriminant.endToken, ')');
  var openingBrace = _tk.findNext(closing, '{');
  var closingBrace = node.endToken;
  _tk.removeEmptyAdjacentBefore(openingBrace);
  _tk.removeEmptyAdjacentBefore(closingBrace);

  _ws.limit(opening, 'SwitchDiscriminantOpening');
  _ws.limit(closing, 'SwitchDiscriminantClosing');
  _br.limit(openingBrace, 'SwitchOpeningBrace');
  _ws.limit(openingBrace, 'SwitchOpeningBrace');
  _br.limit(closingBrace, 'SwitchClosingBrace');
  _ws.limit(closingBrace, 'SwitchClosingBrace');

  node.cases.forEach(function(caze) {
    if (caze.test) {
      _tk.removeEmptyAdjacentBefore(caze.test.startToken);
      _ws.before(caze.test.startToken);
    }
  });
};
