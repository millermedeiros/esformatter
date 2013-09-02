"use strict";


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.



var rocambole = require('rocambole');

var _tk = require('./util/token');
var _br = require('./util/lineBreak');
var _ws = require('./util/whiteSpace');
var _indent = require('./util/indent');

var _options = require('./options');

// ---


exports.hooks = require('./hooks');
exports.format = format;
// XXX: expose utils package?


// ---


function format(str, opts){
    _options.set(opts);

    // we remove trailing whitespace before since it's simpler
    str = _ws.removeTrailing(str);
    str = _br.removeEmptyLines(str);

    var ast = rocambole.parse(str);
    _ws.sanitizeWhiteSpaces( ast.startToken );
    rocambole.moonwalk(ast, transformNode);

    if (process.env.npm_config_tokens) {
        var token = ast.startToken;
        while (token){
            console.log(token.type +'  - "'+ String(token.value).replace(/\n/g, '\\n') +'"');
            token = token.next;
        }
    }

    str = ast.toString();

    return str;
}



function transformNode(node){
    node.indentLevel = _indent.getLevel(node);

    _br.aroundNodeIfNeeded(node);
    _indent.nodeStartIfNeeded(node);

    if (node.parent) {
        // some child nodes of nodes that usually bypass indent still need the
        // closing bracket indent (like ObjectExpression & FunctionExpression)
        node.closingIndentLevel = _indent.getLevelLoose(node.parent);
    }

    processComments(node);

    // we apply hooks afterwards so they can revert the automatic changes
    if (node.type in exports.hooks) {
        exports.hooks[node.type](node);
    }

    // white spaces are less important so comes afterwards
    _ws.beforeIfNeeded(node.startToken, node.type);
    _ws.afterIfNeeded(node.endToken, node.type);
}


// we process comments inside the node automatically since they are not really
// part of the AST, so we need to indent it relative to the node and location.
function processComments(node){
    var token = node.startToken;
    var endToken = node.endToken;

    while (token && token !== endToken) {
        if (!token._processed &&
            (token.type === 'LineComment' || token.type === 'BlockComment')) {
            if ( _tk.isIndent(token.prev) ) {
                _tk.remove(token.prev);
            }
            var level = _indent.getCommentIndentLevel(node);
            _indent.ifNeeded(token, level);
            if (token.type === 'BlockComment') {
                // format multi line block comments
                token.raw = token.raw.replace(/\n\*/g, "\n" + _indent.getIndent(level) + " *");
            }
            _ws.beforeIfNeeded(token, token.type);
            // we avoid processing same comment multiple times since same
            // comment will be part of multiple nodes (all comments are inside
            // Program)
            token._processed = true;
        }
        token = token.next;
    }
}



