"use strict";

var _ws = require('../util/whiteSpace');


module.exports = function Params(params) {
  if (params.length) {
    _ws.beforeIfNeeded(params[0].startToken, 'ParameterList');
    params.forEach(function(param) {
      if (param.startToken.next.value === ',') {
        _ws.aroundIfNeeded(param.startToken.next, 'ParameterComma');
      }
    });
    _ws.afterIfNeeded(params[params.length - 1].endToken, 'ParameterList');
  }
};
