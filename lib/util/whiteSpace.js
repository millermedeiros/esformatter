"use strict";

// white space helpers


var _tk = require('./token');
var _curOpts;


// ---

exports.setOptions = setOptions;

exports.needsSpaceAfterToken = needsSpaceAfterToken;
exports.needsSpaceBeforeToken = needsSpaceBeforeToken;
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


// ---


function needsSpaceBefore(type){
    return !!_curOpts.whiteSpace.before[type];
}


function needsSpaceAfter(type) {
    return !!_curOpts.whiteSpace.after[type];
}


function removeTrailingWhiteSpace(str){
    return _curOpts.whiteSpace.removeTrailing? str.replace(/[ \t]+$/gm, '') : str;
}


function needsSpaceAfterToken(token) {
    var next = token.next;
    return next && next.type !== 'WhiteSpace' && next.type !== 'LineBreak';
}


function needsSpaceBeforeToken(token) {
    var prev = token.prev;
    return prev && prev.type !== 'WhiteSpace' && prev.type !== 'LineBreak';
}


// --


function wsBeforeIfNeeded(token, type){
    if (needsSpaceBefore(type) && needsSpaceBeforeToken(token)) {
        wsBefore(token, _curOpts.whiteSpace.value);
    }
}


function wsAfterIfNeeded(token, type){
    if (needsSpaceAfter(type) && needsSpaceAfterToken(token)){
        wsAfter(token, _curOpts.whiteSpace.value);
    }
}


function wsAroundIfNeeded(token, type){
    wsBeforeIfNeeded(token, type);
    wsAfterIfNeeded(token, type);
}


function wsBefore(token, value) {
    value = !value? _curOpts.whiteSpace.value : value;
    var ws = {
        type : 'WhiteSpace',
        value : value
    };
    _tk.before(token, ws);
    return ws;
}


function wsAfter(token, value) {
    value = !value? _curOpts.whiteSpace.value : value;
    var ws = {
        type : 'WhiteSpace',
        value : value
    };
    _tk.after(token, ws);
    return ws;
}


