"use strict";


// Line break helpers

var _tk = require('./token');

var _curOpts;


// ---


exports.setOptions = setOptions;
function setOptions(opts) {
  _curOpts = opts;
}


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


exports.removeEmptyLines = removeEmptyLines;
function removeEmptyLines(str) {
  return _curOpts.keepEmptyLines ? str : str.replace(/^[\r\n]*$/gm, '');
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


exports.before = before;
function before(token) {
  var br = {
    type: 'LineBreak',
    value: _curOpts.value
  };
  _tk.before(token, br);
  return br;
}


exports.after = after;
function after(token) {
  var br = {
    type: 'LineBreak',
    value: _curOpts.value
  };
  _tk.after(token, br);
  return br;
}



// ---


exports.aroundNodeIfNeeded = aroundNodeIfNeeded;
function aroundNodeIfNeeded(node) {
  if (!shouldAddLineBreakAroundNode(node)) return;

  var type = node.type;
  beforeIfNeeded(node.startToken, type);

  if (_tk.isSemiColon(node.endToken)) {
    afterIfNeeded(node.endToken, type);
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

