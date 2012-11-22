// Borrowed from substack/node-falafel and edited
// ---
// https://github.com/substack/node-falafel
// Released under the MIT license
// ---
// Added extra features (prev/next/tokens)
// since it will be easier to traverse and modify


var parse = require('esprima').parse;

var INJECTED_KEYS = {
    parent : true,
    nextToken : true,
    prevToken : true,
    startToken : true,
    endToken : true,
    updateStartLine : true,
    updateEndLine : true
};

module.exports = function (src, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src || opts.source;
    opts.range = true;
    opts.tokens = true;
    if (typeof src !== 'string') src = String(src);

    var ast = parse(src, opts);
    var tokens = ast.tokens;

    var result = {
        chunks : src.split(''),
        toString : function () { return result.chunks.join('') },
        inspect : function () { return result.toString() }
    };
    var index = 0;

    (function walk (node, parent, prev, next) {
        insertHelpers(node, parent, prev, next, result.chunks, tokens);

        Object.keys(node).forEach(function (key) {
            if (key in INJECTED_KEYS) return;

            var child = node[key];
            if (Array.isArray(child)) {
                child.forEach(function (c, j) {
                    if (c && typeof c.type === 'string') {
                        walk(c, node, (j? child[j - 1] : undefined), child[j + 1]);
                    }
                });
            }
            else if (child && typeof child.type === 'string') {
                insertHelpers(child, node, undefined, undefined, result.chunks, tokens);
                walk(child, node);
            }
        });
        fn(node);
    })(ast);

    return result;
};

function insertHelpers (node, parent, prev, next, chunks, tokens) {
    if (!node.range) return;

    node.parent = parent;
    node.next = next;
    node.prev = prev;

    var i = -1;
    while (token = tokens[++i]) {
        if (token.range[0] > node.range[1]) {
            node.nextToken = token;
            break;
        }
        if ( token.range[0] === node.range[0] ) {
            node.startToken = token;
            node.prevToken = i? tokens[i - 1] : undefined;
        }
        if ( token.range[1] === node.range[1] ) {
            node.endToken = token;
        }
    }

    node.source = function () {
        return chunks.slice(
            node.range[0], node.range[1]
        ).join('');
    };

    if (node.update && typeof node.update === 'object') {
        var prevUpdate = node.update;
        Object.keys(prevUpdate).forEach(function (key) {
            update[key] = prevUpdate[key];
        });
        node.update = update;
    }
    else {
        node.update = update;
    }

    function update (s) {
        chunks[node.range[0]] = s;
        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
            chunks[i] = '';
        }
    }

    node.updateStartLine = function(diff){
        updateNextLoc(node, diff);
        updateParentLoc(node, diff);
    };

    node.updateEndLine = function(diff){
        updateNextLoc(node, diff);
        updateParentLoc(node, diff);
    };

}


function updateNextLoc(node, diff) {
    var next = node.next;
    while (next) {
        updateLoc(next, diff);
        updateLoc(next.startToken, diff);
        updateLoc(next.endToken, diff);
        updateLoc(next.nextToken, diff);
        next = next.next;
    }
}

function updateParentLoc(node, diff) {
    var parent = node.parent;
    while (parent) {
        parent.loc.end.line += diff;
        updateNextLoc(parent, diff);
        updateNextLoc(parent.endToken, diff);
        parent = parent.parent;
    }
}

function updateLoc(node, diff){
    if (node) {
        node.loc.start.line += diff;
        node.loc.end.line += diff;
    }
}


function countLines(str){
    return (str.match(/[\r\n]/g) || '').length;
}
