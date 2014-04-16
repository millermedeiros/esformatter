"use strict";

// some nodes need special rules based on parent node + key, so we separate
// these on this module to "remove" complexity from the main module

var getNodeKey = require('rocambole-node').getNodeKey;


function isOfType(node, type) {
  return node && node.type === type;
}


function matchKey(node, key) {
  return getNodeKey(node) === key;
}


function makeMatch() {
  var keys = Array.prototype.slice.call(arguments);
  return function matchTypes(node){
    return keys.some(matchKey.bind(this, node));
  };
}


// ---


exports.IfStatement = function(node, opts){
  // this will indent `if`, `else` and `else if` appropriately
  var key = getNodeKey(node);
  return key === 'consequent' ||
    (key === 'alternate' && node.type !== 'IfStatement') ||
    (key === 'test' && opts.IfStatementConditional);
};


exports.DoWhileStatement = makeMatch('body');
exports.ForStatement = makeMatch('body');
exports.TryStatement = makeMatch('block', 'finalizer');

// functions should indent only `body` and `params` to avoid issues with "{"
// if it starts on next line
exports.FunctionDeclaration = makeMatch('body', 'params');

exports.FunctionExpression = function(node, opts){
  if (!opts.TopLevelFunctionBlock && isTopLevelFunctionBlock(node.parent)) {
    return false;
  }
  return matchKey(node, 'body') || matchKey(node, 'params');
};


function isTopLevelFunctionBlock(node) {
  return isOfType(node.parent, 'CallExpression') &&
    isOfType(node.parent.parent, 'ExpressionStatement') &&
    isOfType(node.parent.parent.parent, 'Program');
}



