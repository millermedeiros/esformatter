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
    var prevToken = token.prev;
    if ( needsLineBreakBefore(nodeType) && prevToken ) {
        if(prevToken.type !== 'LineBreak' &&
           prevToken.type !== 'WhiteSpace' &&
           prevToken.loc.end.line === token.loc.start.line) {
            brBefore(token);
        }
    }
}


function brAroundIfNeeded(token, nodeType){
    brBeforeIfNeeded(token, nodeType);
    brAfterIfNeeded(token, nodeType);
}


function brAfterIfNeeded(token, nodeType){
    var nextToken = token.next;
    if (needsLineBreakAfter(nodeType)) {
        if (nextToken) {
            switch (nextToken.type) {
                case 'LineComment':
                case 'BlockComment':
                case 'LineBreak':
                    break;
                default:
                    if(nextToken.loc.start.line === token.loc.end.line) {
                        brAfter(token);
                    }
            }
        } else {
            brAfter(token);
        }
    }
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
    if (node.endToken.value !== ';' && node.endToken.next && node.endToken.next.value === ';') {
        brAfterIfNeeded(node.endToken.next, type);
    } else {
        brAfterIfNeeded(node.endToken, type);
    }
}

