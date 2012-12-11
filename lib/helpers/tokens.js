
exports.before = function(target, newToken) {

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
                line : startLine + (newToken.type === 'LineBreak'? 1 : 0),
                column : startColumn + newToken.value.length
            }
        };
    }

    updateRangeTillEnd(target, newToken.range[1] - newToken.range[0], newToken.loc.end.line - newToken.loc.start.line);
    newToken.prev = target.prev;
    newToken.next = target;
    if (target.prev) {
        target.prev.next = newToken;
    }
    else if (target.root) {
        target.root.startToken = newToken;
    }
    target.prev = newToken;
};


exports.after = function(target, newToken) {

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
                line : startLine + (newToken.type === 'LineBreak'? 1 : 0),
                column : startColumn + newToken.value.length
            }
        };
    }


    if (target.next) {
        updateRangeTillEnd(target.next, newToken.range[1] - newToken.range[0], newToken.loc.end.line - newToken.loc.start.line);
    }
    else if (target.root) {
        target.root.endToken = newToken;
    }
    newToken.prev = target;
    newToken.next = target.next;
    target.next = newToken;
};


exports.remove = function(target){
    if (target.next) {
        updateRangeTillEnd(target.next, target.range[0] - target.range[1], target.loc.start.line - target.loc.end.line);
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
};


function updateRangeTillEnd(startToken, diffColumns, diffLines){
    diffColumns = diffColumns || 0 ;
    diffLines = diffLines || 0 ;
    do {
        startToken.range[0] += diffColumns;
        startToken.range[1] += diffColumns;
        startToken.loc.start.column += diffColumns;
        startToken.loc.end.column += diffColumns;
        startToken.loc.start.line += diffLines;
        startToken.loc.end.line += diffLines;
    } while (startToken = startToken.next);
}


