"use strict";


// indent helpers

var repeat = require('amd-utils/string/repeat');
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
    if ( (node.type in BYPASS_INDENT) || (node.parent && node.parent.type in BYPASS_CHILD_INDENT) ) {
        return null;
    }
    return getLevelLoose(node);
}


exports.getLevelLoose = getLevelLoose;
function getLevelLoose(node) {
    var level = 0;
    while (node) {
        if ( (!node.parent && _curOpts[node.type]) || (node.parent && _curOpts[node.parent.type] ) ) {
            // ElseIfStatement changes the whole logic
            if (node.type !== 'IfStatement' || node.parent.type !== 'IfStatement' || _ast.getNodeKey(node) !== 'alternate') {
                level++;
            }
        }
        node = node.parent;
    }
    return level;
}


exports.getCommentIndentLevel = function (node) {
    var level = 0;
    while (node) {
        if ( _curOpts[node.type] ) {
            if (!(node.parent.type in BYPASS_CHILD_INDENT) &&
                !(_ast.getNodeKey(node) in SPECIAL_SUB_TYPES)) {
                level += 1;
            }
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
        return !!node.indentLevel;
    } else {
        return !!node.indentLevel;
    }
}


exports.shouldIndentType = function(type){
    return !!_curOpts[type];
};
