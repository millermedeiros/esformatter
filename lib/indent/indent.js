"use strict";

var rocambole = require('rocambole');
var escapeRegExp = require('mout/string/escapeRegExp');
var tk = require('rocambole-token');
var debug = require('debug')('esformatter:indent');
var hooks = require('../hooks');

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
  sanitize(ast);
  return ast;
}


function transformNode(node) {
  if (shouldIndentNode(node)) {
    var type = node.type;
    var edges;
    if (type in hooks && hooks[type].getIndentEdges) {
      edges = hooks[type].getIndentEdges(node);
    } else {
      edges = node;
    }
    indentInBetween(edges.startToken.next, edges.endToken);
  }
}


function shouldIndentNode(node) {
  var value = _opts[node.type];
  debug('[shouldIndentNode]: %s', value);
  return value;
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


exports.sanitize = sanitize;
function sanitize(ast) {
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
}


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

