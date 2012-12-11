"use strict";


// Line break helpers


var _th = require('./token');
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


// ---


function setOptions(opts){
    _curOpts = opts;
}


function needsLineBreakBefore(type){
    return !!_curOpts.lineBreak.before[type];
}


function needsLineBreakAfter(type){
    return !!_curOpts.lineBreak.after[type];
}


function removeEmptyLines(str) {
    return _curOpts.lineBreak.keepEmptyLines? str : str.replace(/^[\r\n]*$/gm, '');
}


function brBeforeIfNeeded(token, nodeType){
    var prevToken = token.prev;
    if ( needsLineBreakBefore(nodeType) && prevToken){
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
    _th.before(token, br);
    return br;
}


function brAfter(token){
    var br = {
        type : 'LineBreak',
        value : _curOpts.lineBreak.value
    };
    _th.after(token, br);
    return br;
}

