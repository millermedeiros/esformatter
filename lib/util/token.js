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

    if (! newToken.loc) {
        var startLine = target.loc.start.line;
        var startColumn = target.loc.start.column;
        newToken.loc = {
            start : {
                line : startLine,
                column : startColumn
            },
            end : {
                line : startLine,
                column : startColumn + newToken.value.length
            }
        };
    }

    var diffLines = newToken.loc.end.line - newToken.loc.start.line;
    diffLines += (newToken.type === 'LineBreak')? 1 : 0;
    updateRangeTillEnd(target, newToken.range[1] - newToken.range[0], diffLines);

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

    if (! newToken.loc) {
        var startLine = target.loc.end.line;
        var startColumn = target.loc.end.column;
        newToken.loc = {
            start : {
                line : startLine,
                column : startColumn
            },
            end : {
                line : startLine,
                column : startColumn + newToken.value.length
            }
        };
    }


    if (target.next) {
        var diffLines = newToken.loc.end.line - newToken.loc.start.line;
        diffLines += (newToken.type === 'LineBreak')? 1 : 0;
        updateRangeTillEnd(target.next, newToken.range[1] - newToken.range[0], diffLines);
    }
    else if (target.root) {
        target.root.endToken = newToken;
    }
    newToken.prev = target;
    newToken.next = target.next;
    target.next = newToken;
}



exports.remove = remove;
function remove(target){
    if (target.next) {
        var lineDiff = target.loc.start.line - target.loc.end.line;
        lineDiff -= target.type === 'LineBreak'? 1 : 0; // important!!
        updateRangeTillEnd(target.next, target.range[0] - target.range[1], lineDiff);
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

// internal
exports.updateRangeTillEnd = updateRangeTillEnd;
function updateRangeTillEnd(startToken, diffRange, diffLines){
    do {
        startToken.range[0] += diffRange;
        startToken.range[1] += diffRange;
        //FIXME: loc.column info is wrong
        // startToken.loc.start.column += diffColumns;
        // startToken.loc.end.column += diffColumns;
        startToken.loc.start.line += diffLines;
        startToken.loc.end.line += diffLines;
    } while (startToken = startToken.next);
}




exports.removeInBetween = removeInBetween;
function removeInBetween(startToken, endToken, check){
    while(startToken !== endToken.next) {
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


// FIXME: should start at next token
exports.findNext = findNext;
function findNext(startToken, check){
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


// FIXME: should start at prev token
exports.findPrev = findPrev;
function findPrev(endToken, check){
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
    return findNext(startToken.next, checkNonEmpty);
}


exports.findPrevNonEmpty = findPrevNonEmpty;
function findPrevNonEmpty(endToken){
    return findPrev(endToken.prev, checkNonEmpty);
}


exports.checkNonEmpty = checkNonEmpty;
function checkNonEmpty(token){
    return !isEmpty(token);
}


// IS:
// ====

exports.isWs = isWs;
function isWs(token){
    return token.type === 'WhiteSpace';
}

exports.isBr = isBr;
function isBr(token){
    return token.type === 'LineBreak';
}

exports.isEmpty = isEmpty;
function isEmpty(token){
    return token.type === 'WhiteSpace' || token.type === 'LineBreak';
}

exports.isSemiColon = isSemiColon;
function isSemiColon(token){
    return token.type === 'Punctuator' && token.value === ';';
}

exports.isComma = isComma;
function isComma(token){
    return token.type === 'Punctuator' && token.value === ',';
}

exports.isIndent = isIndent;
function isIndent(token){
    return token.type === 'Indent';
}

