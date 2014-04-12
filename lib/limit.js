'use strict';

var _br = require('./lineBreak/lineBreak');
var _ws = require('./whiteSpace/whiteSpace');


exports.before = limitBefore;
function limitBefore(token, typeOrValue) {
  _br.limitBefore(token, typeOrValue);
  _ws.limitBefore(token, typeOrValue);
}


exports.after = limitAfter;
function limitAfter(token, typeOrValue) {
  _br.limitAfter(token, typeOrValue);
  _ws.limitAfter(token, typeOrValue);
}


exports.around = limitAround;
function limitAround(token, typeOrValue) {
  _br.limit(token, typeOrValue);
  _ws.limit(token, typeOrValue);
}

