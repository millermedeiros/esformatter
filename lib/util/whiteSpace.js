"use strict";

// white space helpers

var _tk = require('./token');

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




// ---

// TODO: maybe remove this logic and handle it inside each hook (see #1)

// no need for spaces before/after these tokens
var UNNECESSARY_WHITE_SPACE = {
  BlockComment: true,
  LineBreak: true,
  LineComment: true,
  Punctuator: true,
  WhiteSpace: true
};


exports.sanitizeWhiteSpaces = sanitizeWhiteSpaces;
function sanitizeWhiteSpaces(startToken) {
  while (startToken) {
    // remove unnecessary white spaces (this might not be the desired
    // effect in some cases but for now it's simpler to do it like this)
    // TODO: change this logic to allow keeping white spaces, see issue #1.
    if (startToken.type === 'WhiteSpace') {
      if ((!startToken.prev || _tk.isBr(startToken.prev)) &&
        !_tk.isBr(startToken.next)) {
        // we reuse WhiteSpace tokens and convert them to Indent
        startToken.type = 'Indent';
      } else if ((startToken.prev && startToken.prev.type in UNNECESSARY_WHITE_SPACE) ||
        (startToken.next && startToken.next.type in UNNECESSARY_WHITE_SPACE)) {
        _tk.remove(startToken);
      }
    }
    startToken = startToken.next;
  }
}

