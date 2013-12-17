"use strict";


// Line break helpers

var _tk = require('rocambole-token');

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
  var amount = getAmount('before', type);
  if (amount < 0) return; // noop
  var start = getStartToken(token);
  limitInBetween('before', start, token, amount);
}


exports.limitAfter = limitAfter;
function limitAfter(token, type) {
  var amount = getAmount('after', type);
  if (amount < 0) return; // noop
  var end = getEndToken(token);
  limitInBetween('after', token, end, amount);
}


function getAmount(location, type) {
  var amount = _curOpts[location][type];
  // default is noop, explicit is better than implicit
  amount = amount != null? amount : -1;

  if (typeof amount === 'boolean') {
    // if user sets booleans by mistake we simply add one if missing (true)
    // or remove all if false
    amount = amount? [1, Infinity] : 0;
  }

  if (amount < 0) {
    // noop
    return amount;
  } else if (typeof amount === 'number') {
    return {
      min: amount,
      max: amount,
      values: [amount]
    };
  } else {
    return {
      min: Math.min.apply(Math, amount),
      max: Math.max.apply(Math, amount),
      values: amount
    };
  }
}


function limitInBetween(location, start, end, amount) {
  _tk.removeInBetween(start, end, 'WhiteSpace');
  var n = getDiff(start, end, amount);
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
  // we clamp count inside range or we snap to closest value
  if (count <= expected.min) {
    return expected.min - count;
  } else if (count >= expected.max) {
    return expected.max - count;
  } else {
    return count - getNearestValue(expected.values, count);
  }
}


function getNearestValue(vals, check) {
  var nearest;
  vals.forEach(function(val){
    if (nearest == null || val <= check) {
      nearest = val;
    }
  });
  return nearest;
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

