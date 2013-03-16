"use strict";


// helpers to deal with tokens (add/remove/etc)


// ---


exports.before = before;
function before(target, newToken) {

    if (!newToken.range) {
        var startRange = target.range[0];
        var endRange = startRange + newToken.value.length;
        newToken.range = [startRange, endRange];
    }

    newToken.prev = target.prev;
    newToken.next = target;
    if (target.prev) {
        target.prev.next = newToken;
    }
    else if (target.root) {
        target.root.startToken = newToken;
    }
    target.prev = newToken;
}


exports.after = after;
function after(target, newToken) {

    if (!newToken.range) {
        var startRange = target.range[1] + 1;
        var endRange = startRange + newToken.value.length;
        newToken.range = [startRange, endRange];
    }

    if (! target.next && target.root) {
        target.root.endToken = newToken;
    }
    newToken.prev = target;
    newToken.next = target.next;
    target.next = newToken;
}



exports.remove = remove;
function remove(target){
    if (target.next) {
        target.next.prev = target.prev;
    }
    else if(target.root) {
        target.root.endToken = target.prev;
    }

    if (target.prev) {
        target.prev.next = target.next;
    }
    else if (target.root) {
        target.root.startToken = target.next;
    }
}



exports.removeInBetween = removeInBetween;
function removeInBetween(startToken, endToken, check){
    while(startToken && startToken !== endToken.next) {
        if (typeof check === 'function') {
            if ( check(startToken) ) {
                remove(startToken);
            }
        }
        else if (startToken.type === check) {
            remove(startToken);
        }
        startToken = startToken.next;
    }
}


exports.findInBetween = findInBetween;
function findInBetween(startToken, endToken, check){
    var found;
    while(startToken && startToken !== endToken.next && !found) {
        if (typeof check === 'function') {
            if ( check(startToken) ) {
                found = startToken;
            }
        }
        else if (startToken.type === check) {
            found = startToken;
        }
        startToken = startToken.next;
    }
    return found;
}


exports.eachInBetween = eachInBetween;
function eachInBetween(startToken, endToken, iterator){
    while (startToken && startToken !== endToken.next) {
        iterator(startToken);
        startToken = startToken.next;
    }
}


exports.removeAdjacentBefore = removeAdjacentBefore;
function removeAdjacentBefore(token, check){
    var prev = token.prev;
    if (typeof check === 'function') {
        while (prev && check(prev)) {
            remove(prev);
            prev = prev.prev;
        }
    } else {
        while (prev && prev.type === check) {
            remove(prev);
            prev = prev.prev;
        }
    }
}


exports.removeAdjacentAfter = removeAdjacentAfter;
function removeAdjacentAfter(token, check){
    var next = token.next;
    if (typeof check === 'function') {
        while (next && check(next)) {
            remove(next);
            next = next.next;
        }
    } else {
        while (next && next.type === check) {
            remove(next);
            next = next.next;
        }
    }
}


exports.removeWsBrAdjacentBefore = removeWsBrAdjacentBefore;
function removeWsBrAdjacentBefore(startToken) {
    removeAdjacentBefore(startToken, isEmpty);
}


exports.removeWsBrInBetween = removeWsBrInBetween;
function removeWsBrInBetween(startToken, endToken) {
    removeInBetween(startToken, endToken, isEmpty);
}


exports.findNext = findNext;
function findNext(startToken, check){
    startToken = startToken? startToken.next : null;
    while (startToken) {
        if (typeof check === 'function') {
            if (check(startToken)) {
                return startToken;
            }
        } else if (startToken.type === check || startToken.value === check) {
            return startToken;
        }
        startToken = startToken.next;
    }
}


exports.findPrev = findPrev;
function findPrev(endToken, check){
    endToken = endToken? endToken.prev : null;
    while (endToken) {
        if (typeof check === 'function') {
            if (check(endToken)) {
                return endToken;
            }
        } else if (endToken.type === check || endToken.value === check) {
            return endToken;
        }
        endToken = endToken.prev;
    }
}


exports.findNextNonEmpty = findNextNonEmpty;
function findNextNonEmpty(startToken){
    return findNext(startToken, checkNonEmpty);
}


exports.findPrevNonEmpty = findPrevNonEmpty;
function findPrevNonEmpty(endToken){
    return findPrev(endToken, checkNonEmpty);
}


function checkNonEmpty(token){
    return !isEmpty(token);
}


// IS:
// ====

exports.isWs = isWs;
function isWs(token){
    return token && token.type === 'WhiteSpace';
}

exports.isBr = isBr;
function isBr(token){
    return token && token.type === 'LineBreak';
}

exports.isEmpty = isEmpty;
function isEmpty(token){
    return token &&
        (token.type === 'WhiteSpace' ||
         token.type === 'LineBreak' ||
         token.type === 'Indent');
}

exports.isSemiColon = isSemiColon;
function isSemiColon(token){
    return token && (token.type === 'Punctuator' && token.value === ';');
}

exports.isComma = isComma;
function isComma(token){
    return token && (token.type === 'Punctuator' && token.value === ',');
}

exports.isIndent = isIndent;
function isIndent(token){
    return token && token.type === 'Indent';
}


exports.isComment = isComment;
function isComment(token){
    return token && (token.type === 'LineComment' || token.type === 'BlockComment');
}
