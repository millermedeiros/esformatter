"use strict";


// helpers to deal with tokens (add/remove/etc)


// ---


exports.before = before;
exports.after = after;

exports.remove = remove;
exports.removeInBetween = removeInBetween;
exports.removeWsBrInBetween = removeWsBrInBetween;
exports.removeWsBrAdjacentBefore = removeWsBrAdjacentBefore;
exports.removeAdjacentBefore = removeAdjacentBefore;
exports.removeAdjacentAfter = removeAdjacentAfter;

exports.findNext = findNext;
exports.findPrev = findPrev;
exports.findNextNonEmpty = findNextNonEmpty;
exports.findPrevNonEmpty = findPrevNonEmpty;

exports.isEmpty = checkWsBr;


// ---


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
function updateRangeTillEnd(startToken, diffColumns, diffLines){
    do {
        startToken.range[0] += diffColumns;
        startToken.range[1] += diffColumns;
        //FIXME: loc.column info is wrong
        startToken.loc.start.column += diffColumns;
        startToken.loc.end.column += diffColumns;
        startToken.loc.start.line += diffLines;
        startToken.loc.end.line += diffLines;
    } while (startToken = startToken.next);
}




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


function removeWsBrAdjacentBefore(startToken) {
    removeAdjacentBefore(startToken, checkWsBr);
}


function removeWsBrInBetween(startToken, endToken) {
    removeInBetween(startToken, endToken, checkWsBr);
}


function checkWsBr(token){
    return token.type === 'WhiteSpace' || token.type === 'LineBreak';
}


// FIXME: should start at next token
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


function findNextNonEmpty(startToken){
    return findNext(startToken.next, checkNonEmpty);
}


function findPrevNonEmpty(endToken){
    return findPrev(endToken.prev, checkNonEmpty);
}


function checkNonEmpty(token){
    return !checkWsBr(token);
}

