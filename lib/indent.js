"use strict";

var rocambole = require('rocambole');
var escapeRegExp = require('mout/string/escapeRegExp');
var repeat = require('mout/string/repeat');
var tk = require('rocambole-token');
var debug = require('debug')('esformatter:indent');
var hooks = require('./hooks');

// ---


var _opts;

// this hash table is used to map special node types (used only for
// indentation) into the real hooks
var _specialTypes = {
  'VariableDeclaration': 'MultipleVariableDeclaration'
};


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
  var indentLevel = getIndentLevel(node);
  if (indentLevel > 0) {
    var type = node.type;
    var edges;

    if (type in hooks && hooks[type].getIndentEdges) {
      edges = hooks[type].getIndentEdges(node, _opts);
      // for some nodes we might decide that they should not be indented
      // (complex rules based on context)
      if (!edges) {
        debug('[transformNode]: hook returned no edges');
        return;
      }
    } else {
      edges = node;
    }

    debug(
      '[transformNode] type: %s, edges: %s, %s',
      node.type,
      edges && edges.startToken && edges.startToken.value,
      edges && edges.endToken && edges.endToken.value
    );

    // some complex nodes like IfStatement contains multiple sub-parts that
    // should be indented, so we allow an Array of edges as well
    if (Array.isArray(edges)) {
      edges.forEach(function(edge) {
        indentInBetween(edge.startToken, edge.endToken, edge.level || indentLevel);
      });
    } else {
      indentInBetween(edges.startToken, edges.endToken, edges.level || indentLevel);
    }
  }
}


function getIndentLevel(node) {
  var value = _opts[node.type];
  debug('[getIndentLevel] type: %s, value: %s', node.type, value);
  if (node.type in _specialTypes) {
    value = value || _opts[_specialTypes[node.type]];
    debug('[specialNodeType] indent: %s', value);
  }
  return value;
}


exports.indentInBetween = indentInBetween;
function indentInBetween(startToken, endToken, level) {
  level = level == null ? 1 : level;
  var token = getIndentStart(startToken);
  debug(
    '[indentInBetween] originalStart: %s, start: %s, end: %s, level: %s',
    startToken && startToken.value,
    token && token.value,
    endToken && endToken.value,
    level
  );

  if (level < 0 || !startToken || !token || !endToken) return;

  var next;
  while (token && token !== endToken) {
    next = token.next;
    if (tk.isBr(token.prev)) {
      if (tk.isWs(token)) {
        tk.remove(token);
      } else if (!tk.isBr(token)) {
        indentBefore(token, level);
      }
    }
    token = next;
  }
}


function getIndentStart(token) {
  var val = token.value;
  return (
    val === '{' ||
    val === '(' ||
    val === '['
  ) ? token.next : token;
}


exports.indentBefore = indentBefore;
function indentBefore(token, level) {
  var value = repeat(_opts.value, level);

  if (tk.isIndent(token)) {
    token.value += value;
    token.level += level;
  } else if (tk.isWs(token)) {
    token.type = 'Indent';
    token.value = value;
    token.level = level;
  } else {
    tk.before(token, {
      type: 'Indent',
      value: value,
      level: level
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

