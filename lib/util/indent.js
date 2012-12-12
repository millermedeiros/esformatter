"use strict";


// indent helpers

var repeat = require('amd-utils/string/repeat');
var _ws = require('./whiteSpace');
var _ast = require('./ast');

var _curOpts;


// ---


exports.get = getIndent;
exports.getLevel = getIndentLevel;
exports.getLevelLoose = getLevelLoose;
exports.before = indent;
exports.removeAll = removeIndent;
exports.setOptions = setOptions;


// ---


// some nodes shouldn't be affected by indent rules, so we simply ignore them
var BYPASS_INDENT = {
    BlockStatement : true, // child nodes already add indent
    Identifier : true,
    Literal : true,
    LogicalExpression : true
};


// some child nodes are already responsible for indentation
var BYPASS_CHILD_INDENT = {
    AssignmentExpression : true,
    BinaryExpression : true,
    CallExpression : true,
    ExpressionStatement : true,
    MemberExpression : true,
    Property : true,
    ReturnStatement : true,
    VariableDeclarator : true,
    VariableDeclaration : true
};


// ---


function setOptions(opts){
    _curOpts = opts;
}


function indent(token, indentLevel) {
    if (indentLevel && indentLevel > 0){
        _ws.before(token, getIndent(indentLevel));
    }
}


function getIndent(indentLevel) {
    indentLevel = Math.max(indentLevel, 0);
    return indentLevel? repeat(_curOpts.indent.value, indentLevel) : '';
}


function removeIndent(str){
    return str.replace(/^[ \t]+/gm, '');
}


function getIndentLevel(node) {
    if ( (node.type in BYPASS_INDENT) || (node.parent && node.parent.type in BYPASS_CHILD_INDENT) ) {
        return null;
    }
    return getLevelLoose(node);
}


function getLevelLoose(node) {
    var level = 0;
    while (node) {
        if ( (!node.parent && _curOpts.indent[node.type]) || (node.parent && _curOpts.indent[node.parent.type] ) ) {
            // ElseIfStatement changes the whole logic
            if (node.type !== 'IfStatement' || node.parent.type !== 'IfStatement' || _ast.getNodeKey(node) !== 'alternate') {
                level++;
            }
        }
        node = node.parent;
    }
    return level;
}

