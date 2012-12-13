"use strict";


// Line break helpers


var _tk = require('./token');
var _curOpts;


// ---


exports.setOptions = setOptions;

exports.needsBefore = needsBefore;
exports.needsAfter = needsAfter;
exports.needsBeforeToken = needsBeforeToken;
exports.needsAfterToken = needsAfterToken;

exports.removeEmptyLines = removeEmptyLines;

exports.beforeIfNeeded = beforeIfNeeded;
exports.aroundIfNeeded = aroundIfNeeded;
exports.afterIfNeeded = afterIfNeeded;
exports.before = before;
exports.after = after;
exports.aroundNodeIfNeeded = aroundNodeIfNeeded;


// ---


function setOptions(opts){
    _curOpts = opts;
}


// can pass just a type or token + type
function needsBefore(token, type){
    if (type == null) {
        type = token;
        token = null;
    }
    var needs = !!_curOpts.lineBreak.before[type];
    return token? needs && needsBeforeToken(token) : needs;
}


// can pass just a type or token + type
function needsAfter(token, type){
    if (type == null) {
        type = token;
        token = null;
    }
    var needs = !!_curOpts.lineBreak.after[type];
    return token? needs && needsAfterToken(token) : needs;
}


function removeEmptyLines(str) {
    return _curOpts.lineBreak.keepEmptyLines? str : str.replace(/^[\r\n]*$/gm, '');
}


function beforeIfNeeded(token, nodeType){
    if ( needsBefore(token, nodeType) ) {
        // automatically removes white space
        if (token.prev && token.prev.type === 'WhiteSpace') {
            _tk.remove(token.prev);
        }
        before(token);
    }
}


function needsBeforeToken(token) {
    var prevToken = token.prev;
    return (prevToken &&
            prevToken.type !== 'LineBreak' &&
            prevToken.type !== 'Indent' &&
            prevToken.loc.end.line === token.loc.start.line);
}


function aroundIfNeeded(token, nodeType){
    beforeIfNeeded(token, nodeType);
    afterIfNeeded(token, nodeType);
}


function afterIfNeeded(token, nodeType){
    if ( needsAfter(token, nodeType) ) {
        if (token.next && token.next.type === 'WhiteSpace') {
            _tk.remove(token.next);
        }
        after(token);
    }
}


var needsNoBreak = {
    LineComment : 1,
    BlockComment : 1,
    LineBreak : 1
};

function needsAfterToken(token){
    var nextToken = token.next;
    return (nextToken && !(nextToken.type in needsNoBreak) && nextToken.loc.start.line === token.loc.end.line);
}


function before(token){
    var br = {
        type : 'LineBreak',
        value : _curOpts.lineBreak.value
    };
    _tk.before(token, br);
    return br;
}


function after(token){
    var br = {
        type : 'LineBreak',
        value : _curOpts.lineBreak.value
    };
    _tk.after(token, br);
    return br;
}


function aroundNodeIfNeeded(node) {
    var type = node.type;

    beforeIfNeeded(node.startToken, type);

    if (node.endToken.value !== ';') {
        var nextNonEmpty = _tk.findNextNonEmpty(node.endToken);
        if (nextNonEmpty && nextNonEmpty.type === 'punctuator' && nextNonEmpty.value === ';') {
            _tk.removeWsBrInBetween(node.endToken, nextNonEmpty);
            afterIfNeeded(nextNonEmpty, type);
        }
    } else {
        afterIfNeeded(node.endToken, type);
    }
}


// ---


// tokens that only break line for special reasons
var CONTEXTUAL_LINE_BREAK = {
    AssignmentExpression : true,
    CallExpression : true,
    ExpressionStatement : true
};

// bypass automatic line break of direct child
var BYPASS_CHILD_LINE_BREAK = {
    CallExpression : 1,
    IfStatement : 1,
    WhileStatement : 1,
    ForStatement : 1,
    ReturnStatement : 1
};

// add line break only if great parent is one of these
var CONTEXTUAL_LINE_BREAK_GREAT_PARENTS = {
    Program : 1,
    BlockStatement : 1,
    FunctionExpression : 1
};

exports.shouldAddLineBreak = function (node) {
    if (! (node.type in CONTEXTUAL_LINE_BREAK)) {
        return true;
    }
    if ( node.parent.type in BYPASS_CHILD_LINE_BREAK ) {
        return false;
    }

    var gp = node.parent.parent;
    if ( gp && gp.type in CONTEXTUAL_LINE_BREAK_GREAT_PARENTS ) {
        return true;
    }
    return false;
};
