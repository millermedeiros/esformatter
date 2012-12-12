"use strict";


// Line break helpers


var _tk = require('./token');
var _curOpts;


// ---


exports.setOptions = setOptions;
exports.needsBefore = needsLineBreakBefore;
exports.needsAfter = needsLineBreakAfter;
exports.removeEmptyLines = removeEmptyLines;
exports.beforeIfNeeded = brBeforeIfNeeded;
exports.aroundIfNeeded = brAroundIfNeeded;
exports.afterIfNeeded = brAfterIfNeeded;
exports.before = brBefore;
exports.after = brAfter;
exports.aroundNodeIfNeeded = aroundNodeIfNeeded;


// ---


function setOptions(opts){
    _curOpts = opts;
}


function needsLineBreakBefore(type){
    var val = _curOpts.lineBreak.before[type];
    return !!val;
}


function needsLineBreakAfter(type){
    var val = _curOpts.lineBreak.after[type];
    return !!val;
}


function removeEmptyLines(str) {
    return _curOpts.lineBreak.keepEmptyLines? str : str.replace(/^[\r\n]*$/gm, '');
}


function brBeforeIfNeeded(token, nodeType){
    if ( needsLineBreakBefore(nodeType) && needsBeforeToken(token) ) {
        brBefore(token);
    }
}


function needsBeforeToken(token) {
    var prevToken = token.prev;
    return (prevToken &&
            prevToken.type !== 'LineBreak' &&
            prevToken.type !== 'WhiteSpace' &&
            prevToken.loc.end.line === token.loc.start.line);
}


function brAroundIfNeeded(token, nodeType){
    brBeforeIfNeeded(token, nodeType);
    brAfterIfNeeded(token, nodeType);
}


function brAfterIfNeeded(token, nodeType){
    if (needsLineBreakAfter(nodeType) && needsAfterToken(token)) {
        brAfter(token);
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


function brBefore(token){
    var br = {
        type : 'LineBreak',
        value : _curOpts.lineBreak.value
    };
    _tk.before(token, br);
    return br;
}


function brAfter(token){
    var br = {
        type : 'LineBreak',
        value : _curOpts.lineBreak.value
    };
    _tk.after(token, br);
    return br;
}


function aroundNodeIfNeeded(node) {
    var type = node.type;

    brBeforeIfNeeded(node.startToken, type);

    if (node.endToken.value !== ';') {
        var nextNonEmpty = _tk.findNextNonEmpty(node.endToken);
        if (nextNonEmpty && nextNonEmpty.type === 'punctuator' && nextNonEmpty.value === ';') {
            _tk.removeWsBrInBetween(node.endToken, nextNonEmpty);
            brAfterIfNeeded(nextNonEmpty, type);
        }
    } else {
        brAfterIfNeeded(node.endToken, type);
    }
}

