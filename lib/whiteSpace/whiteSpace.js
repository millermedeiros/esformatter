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


// ---


exports.needsBefore = needsBefore;
function needsBefore(token, type) {
  if (typeof type === 'boolean') {
    return type && needsBeforeToken(token);
  } else if (type == null) {
    type = token;
    token = null;
  }
  var needs = !!_curOpts.before[type];
  return token ? needs && needsBeforeToken(token) : needs;
}


exports.needsAfter = needsAfter;
function needsAfter(token, type) {
  if (typeof type === 'boolean') {
    return type && needsAfterToken(token);
  } else if (type == null) {
    type = token;
    token = null;
  }
  var needs = !!_curOpts.after[type];
  return token ? needs && needsAfterToken(token) : needs;
}


exports.removeTrailing = removeTrailing;
function removeTrailing(str) {
  return _curOpts.removeTrailing ? str.replace(/[ \t]+$/gm, '') : str;
}


exports.needsAfterToken = needsAfterToken;
function needsAfterToken(token) {
  var next = token.next;
  return next && !_tk.isEmpty(next) && !_tk.isSemiColon(next) && !_tk.isComma(next);
}


exports.needsBeforeToken = needsBeforeToken;
function needsBeforeToken(token) {
  var prev = token.prev;
  return prev && !_tk.isEmpty(prev) && prev.type !== 'Indent';
}


// --


exports.beforeIfNeeded = beforeIfNeeded;
function beforeIfNeeded(token, type) {
  var needs = type != null ? needsBefore(token, type) : needsBeforeToken(token);
  if (needs) {
    before(token, _curOpts.value);
  }
}


exports.afterIfNeeded = afterIfNeeded;
function afterIfNeeded(token, type) {
  var needs = type != null ? needsAfter(token, type) : needsAfterToken(token);
  if (needs) {
    after(token, _curOpts.value);
  }
}


exports.aroundIfNeeded = aroundIfNeeded;
function aroundIfNeeded(token, type) {
  beforeIfNeeded(token, type);
  afterIfNeeded(token, type);
}


exports.before = before;
function before(token, value) {
  value = !value ? _curOpts.value : value;
  var ws = {
    type: 'WhiteSpace',
    value: value
  };
  _tk.before(token, ws);
  return ws;
}


exports.after = after;
function after(token, value) {
  value = !value ? _curOpts.value : value;
  var ws = {
    type: 'WhiteSpace',
    value: value
  };
  _tk.after(token, ws);
  return ws;
}



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
