"use strict";

var rocambole = require('rocambole');
var escapeRegExp = require('mout/string/escapeRegExp');
var tk = require('rocambole-token');
var debug = require('debug')('esformatter:indent');
var hooks = require('../hooks');

// ---


var _opts;

// this hash table is used to map special node types (used only for
// indentation) into the real hooks
var _specialTypes = {
  'VariableDeclaration': 'MultipleVariableDeclaration',
  'MemberExpression': 'ChainedMemberExpression'
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
  if (shouldIndentNode(node)) {
    var type = node.type;
    var edges;

    if (type in hooks && hooks[type].getIndentEdges) {
      edges = hooks[type].getIndentEdges(node, _opts);
      // for some nodes we might decide that they should not be indented
      // (complex rules based on context)
      if (!edges) {
        return;
      }
    } else if (isChainedMemberExpressionArgument(node)) {
      // ChainedMemberExpression already adds indentation to end of the
      // argument, so we use previous token as base, to avoid adding an extra
      // indent
      if (!tk.findInBetween(node.startToken, node.endToken, 'LineBreak')) {
        return;
      }

      edges = {
        startToken: node.startToken,
        endToken: tk.findPrev(node.endToken, 'LineBreak')
      };
    } else {
      edges = node;
    }

    // some complex nodes like IfStatement contains multiple sub-parts that
    // should be indented, so we allow an Array of edges as well
    if (Array.isArray(edges)) {
      edges.forEach(function(edge) {
        indentInBetween(edge.startToken, edge.endToken);
      });
    } else {
      indentInBetween(edges.startToken, edges.endToken);
    }
  }
}


function isChainedMemberExpressionArgument(node) {
  return (
    node.parent &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression'
  );
}

function shouldIndentNode(node) {
  var value = _opts[node.type];
  debug('[shouldIndentNode] type: %s, value: %s', node.type, value);
  if (node.type in _specialTypes) {
    value = value || _opts[_specialTypes[node.type]];
    debug('[specialNodeType] indent: %s', value);
  }
  return !!value;
}


function indentInBetween(startToken, endToken) {
  var token = getIndentStart(startToken);
  debug(
    '[indentInBetween] originalStart: %s, start: %s, end: %s',
    startToken.value,
    token.value,
    endToken.value
  );
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


function getIndentStart(token) {
  var val = token.value;
  return (
    val === '{' ||
    val === '(' ||
    val === '['
  ) ? token.next : token;
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

