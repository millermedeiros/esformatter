"use strict";


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.



var walker = require('rocambole');

var merge = require('amd-utils/object/merge');

var _tk = require('./lib/util/token');
var _br = require('./lib/util/lineBreak');
var _ws = require('./lib/util/whiteSpace');
var _indent = require('./lib/util/indent');


// ---


exports.hooks = require('./lib/hooks');
exports.format = format;
// XXX: expose utils package?


// ---


// we use these objectss to configure default behavior, will be simpler than
// using multiple if/else and switch statements.
// these are only settings that can't be configured by the user.


// some nodes shouldn't be affected by indent rules, so we simply ignore them
var BYPASS_INDENT = {
    BlockStatement : true, // child nodes already add indent
    Identifier : true,
    Literal : true
};


// some child nodes are already responsible for indentation
var BYPASS_CHILD_INDENT = {
    AssignmentExpression : true,
    BinaryExpression : true,
    CallExpression : true,
    ExpressionStatement : true,
    MemberExpression : true,
    Property : true,
    ReturnStatement : true,
    VariableDeclarator : true
};



// some child nodes of nodes that usually bypass indent still need the closing
// bracket indent
var CLOSING_CHILD_INDENT = {
    ObjectExpression : true
};


// no need for spaces before/after these tokens
var UNNECESSARY_WHITE_SPACE = {
    BlockComment : true,
    LineBreak : true,
    LineComment : true,
    Punctuator : true,
    WhiteSpace : true
};


// tokens that only break line for special reasons
var BYPASS_AUTOMATIC_LINE_BREAK = {
    CallExpression : true,
    AssignmentExpression : true
};



// ---


var _curOpts;


function format(str, opts){

    // TODO: maybe centralize the options handling into a separate module
    // TODO: check if it is a valid preset and throw descriptive errors if not
    var preset = opts && opts.preset? opts.preset : 'default';
    var baseOpts = require('./lib/preset/'+ preset +'.json');
    _curOpts = opts = merge(baseOpts, opts);
    _ws.setOptions(opts);
    _br.setOptions(opts);
    _indent.setOptions(opts);

    // we remove indent and trailing whitespace before since it's simpler, code
    // is responsible for re-indenting
    str = _indent.removeAll(str);
    str = _ws.removeTrailing(str);
    str = _br.removeEmptyLines(str);

    var ast = walker.parse(str);
    sanitizeWhiteSpaces( ast.startToken );
    walker.moonwalk(ast, transformNode);

    str = ast.toString();

    return str;
}


function sanitizeWhiteSpaces(startToken) {
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
}



function transformNode(node){
    node.indentLevel = (node.type in BYPASS_INDENT) || (node.parent && node.parent.type in BYPASS_CHILD_INDENT)? null : _indent.getLevel(node);

    if (! (node.type in BYPASS_AUTOMATIC_LINE_BREAK)) {
        _br.beforeIfNeeded(node.startToken, node.type);
    }

    _ws.beforeIfNeeded(node.startToken, node.type);

    processComments(node);

    if ( node.indentLevel ) {
        _indent.before(node.startToken, node.indentLevel);
    } else if (node.type in CLOSING_CHILD_INDENT) {
        node.closingIndentLevel = _indent.getLevel(node.parent);
    }

    if (node.type in exports.hooks) {
        exports.hooks[node.type](node);
    }

    if (! (node.type in BYPASS_AUTOMATIC_LINE_BREAK)) {
        _br.afterIfNeeded(node.endToken, node.type);
    }

    _ws.afterIfNeeded(node.endToken, node.type);
}


// we process comments inside the node automatically since they are not really
// part of the AST, so we need to indent it relative to the node and location.
function processComments(node){
    var token = node.startToken;
    var endToken = node.endToken;

    while (token && token !== endToken) {
        if (!token._processed && (token.type === 'LineComment' || token.type === 'BlockComment') ) {
            _ws.beforeIfNeeded(token, token.type);
            // no need to indent if same line
            if (token.prev && (token.prev.type === 'LineBreak' || token.prev.loc.end.line !== token.loc.start.line)) {
                var indentLevel = getCommentIndentLevel(node);
                _indent.before(token, indentLevel);
            }
            // we avoid processing same comment multiple times since same
            // comment will be part of multiple nodes (all comments are inside
            // Program)
            token._processed = true;
        }
        token = token.next;
    }
}


function getCommentIndentLevel(node) {
    var level = 0;
    while (node) {
        if ( _curOpts.indent[node.type] ) {
            level += 1;
        }
        node = node.parent;
    }
    return level;
}
