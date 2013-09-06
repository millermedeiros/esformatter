"use strict";


// indent helpers

var repeat = require('mout/string/repeat');
var _tk = require('./token');
var _ast = require('./ast');

var _curOpts;


// ---


exports.setOptions = setOptions;
function setOptions(opts){
    _curOpts = opts;
}


exports.before = before;
function before(token, indentLevel) {
    if (indentLevel && indentLevel > 0){
        _tk.before(token, {
            type : 'Indent',
            value : getIndent(indentLevel)
        });
    }
}


exports.ifNeeded = ifNeeded;
function ifNeeded(token, indentLevel) {
    if (!token.prev || token.prev.type === 'LineBreak') {
        before(token, indentLevel);
    }
}


exports.getIndent = getIndent;
function getIndent(indentLevel) {
    indentLevel = Math.max(indentLevel, 0);
    return indentLevel? repeat(_curOpts.value, indentLevel) : '';
}


exports.removeAll = removeAll;
function removeAll(str){
    return str.replace(/^[ \t]+/gm, '');
}

exports.inBetween = inBetween;
function inBetween (startToken, endToken, indentLevel) {
    var token = startToken.next;
    while (token!==endToken) {
        // remove indents, fixes comment indentation errors
        if (token.type === 'LineComment' &&
            token.prev.type === 'Indent') {
            _tk.remove(token.prev);
        }
        if (token.prev.type === 'LineBreak' &&
            token.type !== 'LineComment') {
            before(token, indentLevel);
        }
        token = token.next;
    }
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
    ArrayExpression : true,
    AssignmentExpression : true,
    BinaryExpression : true,
    CallExpression : true,
    ConditionalExpression : true,
    ExpressionStatement : true,
    LogicalExpression : true,
    MemberExpression : true,
    NewExpression : true,
    Property : true,
    ReturnStatement : true,
    SequenceExpression : true,
    VariableDeclarator : true,
    VariableDeclaration : true,
    ThrowStatement : true,
    UnaryExpression : true,
    UpdateExpression : true
};


exports.getLevel = getLevel;
function getLevel(node) {
    if ((node.type in BYPASS_INDENT) ||
        (node.parent && node.parent.type in BYPASS_CHILD_INDENT) ) {
        return null;
    }
    return getLevelLoose(node);
}


// get indent level without checking if node should be bypassed
exports.getLevelLoose = getLevelLoose;
function getLevelLoose(node) {
    var originalNode = node;
    var level = 0;
    while (node) {
        if ((!node.parent && _curOpts[node.type]) ||
            (node.parent && _curOpts[node.parent.type]) ) {
            // ElseIfStatement changes the whole logic
            if (node.type !== 'IfStatement' ||
                node.parent.type !== 'IfStatement' ||
                _ast.getNodeKey(node) !== 'alternate') {
                level++;
            }
        }
        if (node.type === 'VariableDeclarator' &&
            node.parent.declarations.length > 1) {
            // multiple var declarations have an extra indent
            level++;
        }
        node = node.parent;
    }
    if (!_curOpts.TopLevelFunctionBlock && !!_ast.getClosest(originalNode, 'FunctionExpression')) {
        level -= 1;
    }
    return level;
}


exports.getCommentIndentLevel = function (node) {
    // indent comments within multi line conditional expressions
    if (node.type === "ConditionalExpression") {
        // bypass all the special subtype exceptions below
        return getLevelLoose(node) + 1;
    }
    var level = 0;
    // comments on chained calls need extra indentation
    if (node.type === 'MemberExpression' && node.parent.type === 'CallExpression') {
        level++;
    }
    while (node) {
        if ( _curOpts[node.type] ) {
            if (!(node.parent.type in BYPASS_CHILD_INDENT &&
                // exclude ObjectExpression within CallExpression from bypassing
                !(node.parent.type === "CallExpression" && node.type === "ObjectExpression")) &&
                !(_ast.getNodeKey(node) in SPECIAL_SUB_TYPES)) {
                level++;
            }
        }
        if (
            // multiple var declarations have an extra indent
            (node.type === 'VariableDeclarator' &&
            node.parent.declarations.length > 1) ||
            // try/catch inside functionexpression is an edge case for comments
            (node.parent && node.parent.type === 'TryStatement' &&
            _ast.getClosest(node, 'FunctionExpression'))
           ) {
            level++;
        }
        node = node.parent;
    }
    return level;
};



// ---


exports.nodeStartIfNeeded = function(node){
    if ( ! shouldIndentNode(node) ) return;
    before(node.startToken, node.indentLevel);
};


// statements that have direct child that should not be indented (mostly
// related to the "test" conditionals and non-block statements)
var CONTEXTUAL_CHILD_INDENT = {
    ConditionalExpression : true,
    DoWhileStatement : true,
    IfStatement : true,
    ForStatement : true,
    ForInStatement : true,
    TryStatement : true,
    WhileStatement : true
};


var SPECIAL_SUB_TYPES = {
    test : true,
    consequent : true,
    alternate: true,
    init : true,
    update : true,
    left : true,
    right: true
};


function shouldIndentNode(node) {
    if (! node.indentLevel) return false;

    if (node.parent.type in CONTEXTUAL_CHILD_INDENT) {
        if (_ast.getNodeKey(node) in SPECIAL_SUB_TYPES) {
            return false;
        }

        // the CONTEXTUAL_CHILD_INDENT nodes are all "block statements" so they
        // should be indented
        if (node.type !== 'BlockStatement' && !(node.type in CONTEXTUAL_CHILD_INDENT)) {
            return false;
        }
    }

    return true;
}


exports.shouldIndentType = function(type){
    return !!_curOpts[type];
};


