"use strict";

// white space helpers


var _tk = require('./token');
var _curOpts;


// ---

exports.setOptions = setOptions;

exports.needsAfter = needsSpaceAfter;
exports.needsBefore = needsSpaceBefore;
exports.removeTrailing = removeTrailingWhiteSpace;
exports.after = wsAfter;
exports.afterIfNeeded = wsAfterIfNeeded;
exports.aroundIfNeeded = wsAroundIfNeeded;
exports.before = wsBefore;
exports.beforeIfNeeded = wsBeforeIfNeeded;


// ---


function setOptions(opts){
    _curOpts = opts;
}


function needsSpaceBefore(type){
    return !!_curOpts.whiteSpace.before[type];
}


function needsSpaceAfter(type) {
    return !!_curOpts.whiteSpace.after[type];
}


function removeTrailingWhiteSpace(str){
    return _curOpts.whiteSpace.removeTrailing? str.replace(/[ \t]+$/gm, '') : str;
}



function wsBeforeIfNeeded(token, type){
    var prev = token.prev;
    if (needsSpaceBefore(type) && prev &&
        prev.type !== 'WhiteSpace' &&
        prev.type !== 'LineBreak') {
        wsBefore(token, _curOpts.whiteSpace.value);
    }
}


function wsAfterIfNeeded(token, type){
    var next = token.next;
    if (needsSpaceAfter(type) && next &&
        next.type !== 'WhiteSpace' &&
        next.type !== 'LineBreak') {
        wsAfter(token, _curOpts.whiteSpace.value);
    }
}


function wsAroundIfNeeded(token, type){
    wsBeforeIfNeeded(token, type);
    wsAfterIfNeeded(token, type);
}


function wsBefore(token, value) {
    if (!value) return; // avoid inserting non-space
    var ws = {
        type : 'WhiteSpace',
        value : value
    };
    _tk.before(token, ws);
    return ws;
}


function wsAfter(token, value) {
    if (!value) return; // avoid inserting non-space
    var ws = {
        type : 'WhiteSpace',
        value : value
    };
    _tk.after(token, ws);
    return ws;
}


