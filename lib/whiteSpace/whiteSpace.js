"use strict";

// white space helpers

var _tk = require('rocambole-token');
var repeat = require('mout/string/repeat');
var debug = require('debug');
var debugBefore = debug('esformatter:ws:before');
var debugAfter = debug('esformatter:ws:after');

var _curOpts;


// ---


exports.setOptions = setOptions;
function setOptions(opts) {
  _curOpts = opts;
}


// --


exports.limit = limit;
function limit(token, type) {
  // limit on whiteSpaces does not support ranges since ranges are kinda dumb
  // in this context..
  limitBefore(token, type);
  limitAfter(token, type);
}


exports.limitBefore = limitBefore;
function limitBefore(token, type) {
  var amount = getAmountBeforeType(type);
  debugBefore(
    '[limitBefore] type: %s, amount: %s, token: %s',
    type, amount, token.value
  );
  if (amount < 0) return; // noop
  update('before', token, amount);
}


exports.limitAfter = limitAfter;
function limitAfter(token, type) {
  var amount = getAmountAfterType(type);
  debugAfter(
    '[limitAfter] type: %s, amount: %s, token: %s',
    type, amount, token.value
  );
  if (amount < 0) return; // noop
  update('after', token, amount);
}


exports.getAmountAfterType = getAmountAfterType;
function getAmountAfterType(type) {
  return getAmount('after', type);
}


exports.getAmountBeforeType = getAmountBeforeType;
function getAmountBeforeType(type) {
  return getAmount('before', type);
}


function getAmount(position, type) {
  if (typeof type === 'number') {
    return type;
  }
  var amount = _curOpts[position][type];
  return amount == null? -1 : amount;
}


function update(position, target, amount) {
  var adjacent = position === 'before'? target.prev : target.next;
  var adjacentIsWs = _tk.isWs(adjacent);

  if (!adjacent || _tk.isBr(adjacent)) return;

  if (amount === 0 && adjacentIsWs) {
    _tk.remove(adjacent);
    return;
  }

  var ws;
  if (adjacentIsWs) {
    ws = adjacent;
  } else {
    ws = {
      type: 'WhiteSpace'
    };
  }
  ws.value = repeat(_curOpts.value, amount);

  if (! adjacentIsWs) {
    _tk[position](target, ws);
  }
}
