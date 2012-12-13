"use strict";

// white space helpers


var _tk = require('./token');
var _curOpts;


// ---

exports.setOptions = setOptions;

exports.needsAfter = needsAfter;
exports.needsBefore = needsBefore;
exports.needsAfterToken = needsAfterToken;
exports.needsBeforeToken = needsBeforeToken;

exports.removeTrailing = removeTrailingWhiteSpace;

exports.after = after;
exports.afterIfNeeded = afterIfNeeded;
exports.before = before;
exports.beforeIfNeeded = beforeIfNeeded;
exports.aroundIfNeeded = aroundIfNeeded;


// ---


function setOptions(opts){
    _curOpts = opts;
}


// ---


function needsBefore(token, type){
    if (type == null) {
        type = token;
        token = null;
    }
    var needs = !!_curOpts.whiteSpace.before[type];
    return token? needs && needsBeforeToken(token) : needs;
}


function needsAfter(token, type) {
    if (type == null) {
        type = token;
        token = null;
    }
    var needs = !!_curOpts.whiteSpace.after[type];
    return token? needs && needsAfterToken(token) : needs;
}


function removeTrailingWhiteSpace(str){
    return _curOpts.whiteSpace.removeTrailing? str.replace(/[ \t]+$/gm, '') : str;
}


function needsAfterToken(token) {
    var next = token.next;
    return next && next.type !== 'WhiteSpace' && next.type !== 'LineBreak';
}


function needsBeforeToken(token) {
    var prev = token.prev;
    return prev && prev.type !== 'WhiteSpace' && prev.type !== 'LineBreak' && prev.type !== 'Indent';
}


// --


function beforeIfNeeded(token, type){
    if ( needsBefore(token, type) ) {
        before(token, _curOpts.whiteSpace.value);
    }
}


function afterIfNeeded(token, type){
    if ( needsAfter(token, type) ) {
        after(token, _curOpts.whiteSpace.value);
    }
}


function aroundIfNeeded(token, type){
    beforeIfNeeded(token, type);
    afterIfNeeded(token, type);
}


function before(token, value) {
    value = !value? _curOpts.whiteSpace.value : value;
    var ws = {
        type : 'WhiteSpace',
        value : value
    };
    _tk.before(token, ws);
    return ws;
}


function after(token, value) {
    value = !value? _curOpts.whiteSpace.value : value;
    var ws = {
        type : 'WhiteSpace',
        value : value
    };
    _tk.after(token, ws);
    return ws;
}




// ---

// TODO: maybe remove this logic and handle it inside each hook (see #1)

// no need for spaces before/after these tokens
var UNNECESSARY_WHITE_SPACE = {
    BlockComment : true,
    LineBreak : true,
    LineComment : true,
    Punctuator : true,
    WhiteSpace : true
};


exports.sanitizeWhiteSpaces = function (startToken) {
    while (startToken) {
        // remove unnecessary white spaces (this might not be the desired
        // effect in some cases but for now it's simpler to do it like this)
        // TODO: change this logic to allow keeping white spaces, see issue #1.
        //       will probably remove this method and handle it inside
        //       util/whiteSpace.
        if (startToken.type === 'WhiteSpace' && (
            (startToken.prev && startToken.prev.type in UNNECESSARY_WHITE_SPACE) ||
            (startToken.next && startToken.next.type in UNNECESSARY_WHITE_SPACE) )
        ) {
            _tk.remove(startToken);
        }
        startToken = startToken.next;
    }
};
