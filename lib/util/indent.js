"use strict";


// indent helpers

var repeat = require('amd-utils/string/repeat');
var _tk = require('./token');
var _ast = require('./ast');

var _curOpts;


// ---


exports.get = getIndent;
exports.getLevel = getIndentLevel;
exports.getLevelLoose = getLevelLoose;
exports.before = indent;
exports.ifNeeded = indentIfNeeded;
exports.removeAll = removeIndent;
exports.setOptions = setOptions;


// ---


function setOptions(opts){
    _curOpts = opts;
}


function indent(token, indentLevel) {
    if (indentLevel && indentLevel > 0){
        _tk.before(token, {
            type : 'Indent',
            value : getIndent(indentLevel)
        });
    }
}


function indentIfNeeded(token, indentLevel) {
    if (!token.prev || token.prev.type === 'LineBreak') {
        indent(token, indentLevel);
    }
}


function getIndent(indentLevel) {
    indentLevel = Math.max(indentLevel, 0);
    return indentLevel? repeat(_curOpts.indent.value, indentLevel) : '';
}


function removeIndent(str){
    return str.replace(/^[ \t]+/gm, '');
}



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
    VariableDeclaration : true,
    ThrowStatement : true
};


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



// ---



exports.getCommentIndentLevel = function (node) {
    var level = 0;
    while (node) {
        if ( _curOpts.indent[node.type] ) {
            if (node.type !== 'IfStatement' || node.parent.type !== 'IfStatement' || _ast.getNodeKey(node) !== 'alternate') {
                level += 1;
            }
        }
        node = node.parent;
    }
    return level;
};



// statements that have direct child that should not be indented (mostly
// related to the "test" conditionals and non-block statements)
var CONTEXTUAL_CHILD_INDENT = {
    IfStatement : true,
    ForStatement : true,
    WhileStatement : true
};


exports.shouldIndent = function (node) {
    if (! node.indentLevel) return false;

    if (node.parent.type in CONTEXTUAL_CHILD_INDENT) {
        var subType = _ast.getNodeKey(node);
        if (subType === 'test' || subType === 'consequent' || subType === 'alternate') {
            return false;
        }
        if (node.type !== 'BlockStatement') {
            return false;
        }
        return !!node.indentLevel;
    } else {
        return !!node.indentLevel;
    }
};
