"use strict";

var rocambole = require('rocambole');
var specialParent = require('./specialParent');

var escapeRegExp = require('mout/string/escapeRegExp');

var getNodeKey = require('rocambole-node').getNodeKey;
var tk = require('rocambole-token');


// ---


var _opts;


// ---


exports.setOptions = setOptions;
function setOptions(opts){
  _opts = opts;
}


// transform AST in place
exports.transform = transform;
function transform(ast) {
  rocambole.moonwalk(ast, transformNode);
  exports.sanitize(ast);
  return ast;
}


function transformNode(node) {
  if (shouldIndentNode(node)) {
    var edges = getIndentEdges(node);
    indentInBetween(edges.start, edges.end);

    if (shouldIndentNodeType('ChainedMemberExpression') &&
        isChainedMemberExpressionArgument(node)) {
      indentInBetween(node.startToken.next, node.endToken.next);
    }
  }
}


function getIndentEdges(node){
  var start = node.startToken;
  var end = node.endToken;

  if (isInsideIfTest(node)) {
    start = tk.findPrev(start, '(');
    end = tk.findNext(end, ')');
  } else if (node.type === 'ConditionalExpression') {
    start = start.next;
    end = end.next;
  } else {
    start = start.next;
  }

  return {
    start: start,
    end: end
  };
}


function isInsideIfTest(node) {
  return node.parent && node.parent.type === 'IfStatement' &&
    getNodeKey(node) === 'test';
}


function shouldIndentNode(node){
  return (!isSpecial(node) && shouldIndentNodeType(node.type)) ||
    (isSpecial(node.parent) && shouldIdentSpecial(node)) ||
    (shouldIndentNodeType('ChainedMemberExpression') &&
    isTopChainedMemberExpression(node)) ||
    (shouldIndentNodeType('MultipleVariableDeclaration') &&
    isMultipleVariableDeclaration(node));
}


function isSpecial(node) {
  return node && node.type in specialParent;
}


function shouldIndentNodeType(type) {
  return _opts[type];
}


function shouldIdentSpecial(node) {
  return shouldIndentNodeType(node.parent.type) &&
    specialParent[node.parent.type](node, _opts);
}


function isMultipleVariableDeclaration(node){
  return node.type === 'VariableDeclaration' && node.declarations.length > 1;
}


function isTopChainedMemberExpression(node) {
  return node &&
    node.type === 'MemberExpression' &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression' &&
    node.parent.parent.type === 'ExpressionStatement' &&
    // only indent if line breaks in between tokens
    tk.findInBetween(node.startToken, node.endToken, 'LineBreak');
}


function isChainedMemberExpressionArgument(node) {
  return isTopChainedMemberExpression(node.parent.callee) &&
    shouldIndentNodeType(node.type) &&
    isOnSeparateLine(node.parent.callee.property.startToken.prev);
}


function isOnSeparateLine(token) {
  // this is a naive check but will work if token is the first non-empty token
  // of the line
  return tk.isBr(token.prev) || tk.isBr(token.prev.prev);
}


function indentInBetween(startToken, endToken) {
  var token = startToken;
  var next;
  while (token && token !== endToken) {
    next = token.next;
    if (tk.isBr(token.prev)) {
      if (tk.isWs(token)) {
        tk.remove(token);
      } else if (!tk.isBr(token)) {
        indentBefore(token);
      }
    }
    token = next;
  }
}


function indentBefore(token) {
  if (tk.isIndent(token)) {
    token.value += _opts.value;
    token.level += 1;
  } else if (tk.isWs(token)) {
    token.type = 'Indent';
    token.value = _opts.value;
    token.level = 1;
  } else {
    tk.before(token, {
      type: 'Indent',
      value: _opts.value,
      level: 1
    });
  }
}


exports.sanitize = function(ast) {
  var token = ast.startToken;
  while (token) {
    var next = token.next;
    if (isOriginalIndent(token)) {
      tk.remove(token);
    } else if (token.type === 'BlockComment') {
      updateBlockComment(token);
    }
    token = next;
  }
};


function isOriginalIndent(token) {
  // original indent don't have a "indentLevel" value
  // we also need to remove any indent that happens after a token that
  // isn't a line break (just in case
  return (token.type === 'WhiteSpace' && (!token.prev || tk.isBr(token.prev)) && !tk.isBr(token.next)) ||
    (token.type === 'Indent' && (token.level == null || !tk.isBr(token.prev)));
}


function updateBlockComment(comment) {
  var orig = new RegExp('([\\n\\r]+)' + escapeRegExp(comment.originalIndent || ''), 'gm');
  var update = comment.prev && comment.prev.type === 'Indent'? comment.prev.value : '';
  comment.raw = comment.raw.replace(orig, '$1' + update);
}

