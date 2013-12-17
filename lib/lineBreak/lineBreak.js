"use strict";


// Line break helpers

var _tk = require('rocambole-token');

// yeah, we use semver to parse integers. it's lame but works and will give
// more flexibility while still keeping a format that is easy to read
var semver = require('semver');

var _curOpts;


// ---


exports.setOptions = setOptions;
function setOptions(opts) {
  _curOpts = opts;
}


exports.needsBefore = needsBefore;
function needsBefore(token, type) {
  if (type == null) {
    return !!_curOpts.before[token];
  }
  var needs = (typeof type === 'boolean') ?
    type :
    !!_curOpts.before[type];
  return needs && needsBeforeToken(token);
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


exports.beforeIfNeeded = beforeIfNeeded;
function beforeIfNeeded(token, nodeType) {
  if (needsBefore(token, nodeType)) {
    // automatically removes white space
    if (token.prev && token.prev.type === 'WhiteSpace') {
      _tk.remove(token.prev);
    }
    before(token);
  }
}


exports.needsBeforeToken = needsBeforeToken;
function needsBeforeToken(token) {
  var prevToken = token.prev;
  return (prevToken &&
prevToken.type !== 'LineBreak' &&
prevToken.type !== 'Indent');
}


exports.aroundIfNeeded = aroundIfNeeded;
function aroundIfNeeded(token, nodeType) {
  beforeIfNeeded(token, nodeType);
  afterIfNeeded(token, nodeType);
}


exports.afterIfNeeded = afterIfNeeded;
function afterIfNeeded(token, nodeType) {
  if (needsAfter(token, nodeType)) {
    if (token.next.type === 'WhiteSpace') {
      _tk.remove(token.next);
    }
    after(token);
  }
}


var needsNoBreak = {
  LineComment: 1,
  BlockComment: 1,
  LineBreak: 1
};

exports.needsAfterToken = needsAfterToken;
function needsAfterToken(token) {
  var nextToken = token.next;
  if (nextToken && nextToken.type === 'WhiteSpace') {
    nextToken = nextToken.next;
  }
  return (nextToken && !(nextToken.type in needsNoBreak));
}


exports.limit = limit;
function limit(token, type) {
  limitBefore(token, type);
  limitAfter(token, type);
}


exports.before = before;
function before(token) {
  _tk.before(token, {
      type: 'LineBreak',
      value: _curOpts.value
  });
}


exports.after = after;
function after(token) {
  _tk.after(token, {
      type: 'LineBreak',
      value: _curOpts.value
  });
}


exports.limitBefore = limitBefore;
function limitBefore(token, type) {
  var expected = getExpect('before', type);
  if (expected < 0) return; // noop
  var start = getStartToken(token);
  limitInBetween('before', start, token, expected);
}


exports.limitAfter = limitAfter;
function limitAfter(token, type) {
  var expected = getExpect('after', type);
  if (expected < 0) return; // noop
  var end = getEndToken(token);
  limitInBetween('after', token, end, expected);
}


function getExpect(location, type) {
  var expected = _curOpts[location][type];
  // default is noop, explicit is better than implicit
  expected = expected != null? expected : -1;

  if (typeof expected === 'boolean') {
    // if user sets booleans by mistake we simply add one if missing (true)
    // or remove all if false
    expected = expected? '>=1' : 0;
  }

  if (expected < 0) {
    // noop
    return expected;
  } else if (typeof expected === 'number') {
    return String(expected);
  } else {
    return expected;
  }
}


function limitInBetween(location, start, end, expected) {
  _tk.removeInBetween(start, end, 'WhiteSpace');
  var n = getDiff(start, end, expected);
  if (n < 0) {
    _tk.removeInBetween(start, end, function(token){
      return token.type === 'LineBreak' && n++ < 0;
    });
  } else if(n > 0) {
    while (n-- > 0) {
      if (location === 'after') {
        after(start);
      } else {
        before(end);
      }
    }
  }
}


function getDiff(start, end, expected) {
  // start will only be equal to end if it's start or file
  if (start === end) return 0;
  var count = countBrInBetween(start, end);
  // yeah, it's ugly to strings to compare integers but was quickest solution
  var vCount = String(count) +'.0.0';
  if (semver.satisfies(vCount, expected)) {
    return 0;
  } else {
    return getSatisfyingMatch(count, vCount, expected) - count;
  }
}


function getSatisfyingMatch(count, vCount, expected) {
  var result;
  var diff = semver.gtr(vCount, expected)? -1 : 1;
  count += diff;
  while (result == null && count >= 0 && count < 100) {
    if (semver.satisfies(String(count) + '.0.0', expected)) {
      result = count;
    }
    count += diff;
  }
  return parseInt(result, 10);
}


function countBrInBetween(start, end) {
  var count = 0;
  _tk.eachInBetween(start, end, function(token){
    if (_tk.isBr(token)) count++;
  });
  return count;
}


function getEndToken(token) {
  var end = _tk.findNextNonEmpty(token);
  return end? end : token.root.endToken;
}

function getStartToken(token) {
  var end = _tk.findPrevNonEmpty(token);
  return end? end : token.root.startToken;
}



// ---


exports.aroundNodeIfNeeded = aroundNodeIfNeeded;
function aroundNodeIfNeeded(node) {
  if (!shouldAddLineBreakAroundNode(node)) return;

  var type = node.type;
  limitBefore(node.startToken, type);

  if (_tk.isSemiColon(node.endToken)) {
    limitAfter(node.endToken, type);
  }
}



// tokens that only break line for special reasons
var CONTEXTUAL_LINE_BREAK = {
  AssignmentExpression: 1,
  ConditionalExpression: 1,
  CallExpression: 1,
  ExpressionStatement: 1,
  SequenceExpression: 1,
  LogicalExpression: 1,
  VariableDeclaration: 1
};

// bypass automatic line break of direct child
var BYPASS_CHILD_LINE_BREAK = {
  CallExpression: 1,
  DoWhileStatement: 1,
  IfStatement: 1,
  WhileStatement: 1,
  ForStatement: 1,
  ForInStatement: 1,
  ReturnStatement: 1,
  ThrowStatement: 1
};

// add line break only if great parent is one of these
var CONTEXTUAL_LINE_BREAK_GREAT_PARENTS = {
  Program: 1,
  BlockStatement: 1,
  FunctionExpression: 1
};

function shouldAddLineBreakAroundNode(node) {

  if (node.parent) {
    // EmptyStatement shouldn't cause line breaks by default since user might
    // be using asi and it's common to add it to begin of line when needed
    if (node.parent.prev &&
      node.parent.prev.type === 'EmptyStatement' &&
      !needsAfter('EmptyStatement')) {
      return false;
    }
    // it is on root it should cause line breaks
    if (node.parent.type === 'Program') {
      return true;
    }
  }

  if (!(node.type in CONTEXTUAL_LINE_BREAK)) {
    return true;
  }
  if (node.parent.type in BYPASS_CHILD_LINE_BREAK) {
    return false;
  }

  // iife
  if (node.type === 'CallExpression' &&
    node.callee.type === 'FunctionExpression') {
    return false;
  }

  var gp = node.parent.parent;
  if (gp && gp.type in CONTEXTUAL_LINE_BREAK_GREAT_PARENTS) {
    return true;
  }
  return false;
}

