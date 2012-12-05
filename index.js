/*jshint node:true*/
"use strict";


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.



var walker = require('es-ast-walker');

var merge = require('amd-utils/object/merge');
var repeat = require('amd-utils/string/repeat');



// ---


// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run.
var TRANSFORMS = {};

// All supported options also default options)
var DEFAULT_OPTS = {

    indent : {
        value : '    ', // 4 spaces
        FunctionDeclaration : true
    },


    lineBreak : {
        value : '\n', // unix format
        keepEmptyLines : true,

        before : {
            BlockStatement : false,
            BlockStatementClosingBrace : false,
            FunctionDeclaration : true,
            FunctionDeclarationClosingBrace : true,
            FunctionDeclarationOpeningBrace : false,
            Property : true,
            ReturnStatement : true
        },

        after : {
            BlockStatement : false,
            BlockStatementClosingBrace : false,
            FunctionDeclaration : false,
            FunctionDeclarationClosingBrace : true,
            FunctionDeclarationOpeningBrace : true,
            Property : true,
            ReturnStatement : true
        }
    },


    whiteSpace : {
        value : ' ', // single space
        removeTrailing : true,

        before : {
            ArgumentComma : false,
            ArgumentList : false,
            BinaryExpressionOperator : true,
            FunctionDeclarationClosingBrace : true,
            FunctionDeclarationOpeningBrace : true,
            LineComment : true,
            ParameterComma : false,
            ParameterList : false
        },

        after : {
            ArgumentComma : true,
            ArgumentList : false,
            BinaryExpressionOperator : true,
            FunctionName : false,
            ParameterComma : true,
            ParameterList : false
        }
    }

};


// some nodes shouldn't be affected by indent rules, so we simply ignore them
var BYPASS_INDENT = {
    Identifier : true,
    Literal : true,
    BlockStatement : true // child nodes already add indent
};


// some child nodes are already responsible for indentation
var BYPASS_CHILD_INDENT = {
    ReturnStatement : true,
    ExpressionStatement : true
};


// no need for spaces before/after these tokens
var UNNECESSARY_WHITE_SPACE = {
    WhiteSpace : true,
    LineBreak : true,
    LineComment : true,
    BlockComment : true,
    Punctuator : true
};


// ---

var _curOpts;
var _br;


exports.format = function(str, opts){
    // everything is sync so we use a local var for brevity
    _curOpts = merge(DEFAULT_OPTS, opts);
    _br = _curOpts.lineBreak.value;

    // we remove indent and trailing whitespace before since it's simpler, code
    // is responsible for re-indenting
    str = removeIndent(str);
    str = removeTrailingWhiteSpace(str);
    str = removeEmptyLines(str);

    var ast = walker.parse(str);
    sanitizeWhiteSpaces( ast.startToken );
    walker.moonwalk(ast, transformNode);

    str = ast.toString();

    return str;
};


function sanitizeWhiteSpaces(startToken) {
    while (startToken) {
        // remove unnecessary white spaces (this might not be the desired
        // effect in some cases but for now it's simpler to do it like this)
        if (startToken.type === 'WhiteSpace' && (
            (startToken.prev && startToken.prev.type in UNNECESSARY_WHITE_SPACE) ||
            (startToken.next && startToken.next.type in UNNECESSARY_WHITE_SPACE) )
        ) {
            startToken.remove();
        }
        startToken = startToken.next;
    }
}



function transformNode(node){
    node.indentLevel = (node.type in BYPASS_INDENT) || (node.parent && node.parent.type in BYPASS_CHILD_INDENT)? null : getIndentLevel(node);

    insertLineBreakBeforeTokenIfNeeded(node.startToken, node.type);

    processComments(node);

    if ( node.indentLevel ) {
        insertWhiteSpaceBeforeToken(node.startToken, getIndent(node.indentLevel));
    }

    if (node.type in TRANSFORMS) {
        TRANSFORMS[node.type](node);
    }

    insertLineBreakAfterTokenIfNeeded(node.endToken, node.type);
}


function processComments(node){
    var token = node.startToken;
    var endToken = node.endToken;

    while (token && token !== endToken) {
        if (!token._processed && (token.type === 'LineComment' || token.type === 'BlockComment') ) {
            insertWhiteSpaceBeforeTokenIfNeeded(token, token.type);
            // need to add 1 since comment is a child of the node
            var indentLevel = node.type !== 'Program'? node.indentLevel + 1 : node.indentLevel;
            if (indentLevel && token.prev && token.prev.type === 'LineBreak') {
                insertWhiteSpaceBeforeToken(token, getIndent(indentLevel));
            }
            // we avoid processing same comment multiple times
            token._processed = true;
        }
        token = token.next;
    }
}



// ====


//TODO: abstract the white space and line break insertion even further
//      it is really dumb to constantly check if it needs to be inserted
//      maybe a config object will be able to process 99% of the cases


TRANSFORMS.FunctionDeclaration = function(node){
    insertWhiteSpaceAfterTokenIfNeeded(node.id.startToken, 'FunctionName');

    if (node.params.length) {
        insertWhiteSpaceBeforeTokenIfNeeded(node.params[0].startToken, 'ParameterList');
        node.params.forEach(function(param){
            if (param.startToken.next.value === ',') {
                insertWhiteSpaceAroundTokenIfNeeded(param.startToken.next, 'ParameterComma');
            }
        });
        insertWhiteSpaceAfterTokenIfNeeded(node.params[node.params.length - 1].endToken, 'ParameterList');
    }

    // only insert space before if it doesn't break line otherwise we indent it
    if (! needsLineBreakBefore('FunctionDeclarationOpeningBrace') ) {
        insertWhiteSpaceBeforeTokenIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    } else {
        insertWhiteSpaceBeforeToken(node.body.startToken, getIndent(node.indentLevel));
    }

    insertLineBreakAroundTokenIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');

    if (!needsLineBreakBefore('FunctionDeclarationClosingBrace') ) {
        insertWhiteSpaceBeforeTokenIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');
    }
    insertLineBreakAroundTokenIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');


    if (node.indentLevel) {
        insertWhiteSpaceBeforeToken(node.body.endToken, getIndent(node.indentLevel));
    }
};



TRANSFORMS.BinaryExpression = function(node){
    insertWhiteSpaceAfterTokenIfNeeded(node.startToken, 'BinaryExpressionOperator');
    insertWhiteSpaceBeforeTokenIfNeeded(node.right.startToken, 'BinaryExpressionOperator');
};


TRANSFORMS.CallExpression = function(node){
    var args = node['arguments'];
    if ( args.length ) {
        insertWhiteSpaceBeforeTokenIfNeeded(args[0].startToken, 'ArgumentList');
        args.forEach(function(arg){
            if (arg.startToken.next.value === ',') {
                insertWhiteSpaceAroundTokenIfNeeded(arg.startToken.next, 'ArgumentComma');
            }
        });
        insertWhiteSpaceAfterTokenIfNeeded(args[args.length - 1].endToken, 'ArgumentList');
    }
};


TRANSFORMS.ObjectExpression = function(node){
    if (node.properties.length) {
        node.properties.forEach(function(prop){
            insertLineBreakBeforeTokenIfNeeded(prop.startToken, 'Property');
            var token = prop.endToken.next;
            while (token.value !== ',') {
                // XXX: toggle behavior if comma-first
                if (token.type === 'LineBreak') {
                    token.remove();
                }
                token = token.next;
            }
            insertLineBreakAfterTokenIfNeeded(token, 'Property');
        });
    }
};



// -------
// HELPERS
// =======


function insertWhiteSpaceBeforeTokenIfNeeded(token, type){
    if (needsSpaceBefore(type) && token.prev && token.prev.type !== 'WhiteSpace' && token.prev.type !== 'LineBreak') {
        insertWhiteSpaceBeforeToken(token, _curOpts.whiteSpace.value);
    }
}

function insertWhiteSpaceAfterTokenIfNeeded(token, type){
    if (needsSpaceAfter(type) && token.next && token.next.type !== 'WhiteSpace' && token.next.type !== 'LineBreak') {
        insertWhiteSpaceAfterToken(token, _curOpts.whiteSpace.value);
    }
}

function insertWhiteSpaceAroundTokenIfNeeded(token, type){
    insertWhiteSpaceBeforeTokenIfNeeded(token, type);
    insertWhiteSpaceAfterTokenIfNeeded(token, type);
}



function insertLineBreakBeforeTokenIfNeeded(token, nodeType){
    var prevToken = token.prev;
    if ( needsLineBreakBefore(nodeType) ) {
        if (prevToken) {
            switch (prevToken.type) {
                case 'LineBreak':
                case 'WhiteSpace':
                    break;
                default:
                    if (prevToken.loc.end.line === token.loc.start.line) {
                    insertLineBreakBeforeToken(token);
                }
            }
        } else {
            insertLineBreakBeforeToken(token);
        }
    }
}


function insertLineBreakAroundTokenIfNeeded(token, nodeType){
    insertLineBreakBeforeTokenIfNeeded(token, nodeType);
    insertLineBreakAfterTokenIfNeeded(token, nodeType);
}


function insertLineBreakAfterTokenIfNeeded(token, nodeType){
    var nextToken = token.next;
    if (needsLineBreakAfter(nodeType)) {
        if (nextToken) {
            switch (nextToken.type) {
                case 'LineComment':
                case 'BlockComment':
                case 'LineBreak':
                    break;
                default:
                    if(nextToken.loc.start.line === token.loc.end.line) {
                        insertLineBreakAfterToken(token);
                    }
            }
        } else {
            insertLineBreakAfterToken(token);
        }
    }
}


// TODO: refactor node insertion and abstract it inside ast-walker

function insertWhiteSpaceBeforeToken(token, value) {
    var startRange = token.prev.range[1] + 1;
    var startLine = token.prev.loc.end.line;
    var startColumn = token.prev.loc.end.column;
    var ws = {
        type : 'WhiteSpace',
        value : value,
        range : [startRange, startRange + value.length],
        loc : {
            start : {
                line : startLine,
                column : startColumn
            },
            end : {
                line : startLine,
                column : startColumn + value.length
            }
        }
    };
    token.before(ws);
    return ws;
}


function insertWhiteSpaceAfterToken(token, value) {
    var startRange = token.range[1] + 1;
    var startLine = token.loc.end.line;
    var startColumn = token.loc.end.column;
    var ws = {
        type : 'WhiteSpace',
        value : value,
        range : [startRange, startRange + value.length],
        loc : {
            start : {
                line : startLine,
                column : startColumn
            },
            end : {
                line : startLine,
                column : startColumn + value.length
            }
        }
    };
    token.after(ws);
    return ws;
}


function insertLineBreakBeforeToken(token){
    var value = _curOpts.lineBreak.value;
    var startRange = token.range[0];
    var endRange = startRange + value.length;
    var startLine = token.loc.start.line;
    var startColumn = token.loc.start.column;
    var br = {
        type : 'LineBreak',
        value : value,
        range : [startRange, endRange],
        loc : {
            start : {
                line : startLine,
                column : startColumn
            },
            end : {
                line : startLine + 1,
                column : startColumn + value.length
            }
        }
    };
    token.before(br);
    return br;
}

function insertLineBreakAfterToken(token){
    var value = _curOpts.lineBreak.value;
    var startRange = token.range[1] + 1;
    var endRange = startRange + value.length;
    var startLine = token.loc.end.line;
    var startColumn = token.loc.end.column;
    var br = {
        type : 'LineBreak',
        value : value,
        range : [startRange, endRange],
        loc : {
            start : {
                line : startLine,
                column : startColumn
            },
            end : {
                line : startLine + 1,
                column : startColumn + value.length
            }
        }
    };
    token.after(br);
    return br;
}



// indent
// ------

function getIndent(indentLevel) {
    indentLevel = Math.max(indentLevel, 0);
    return indentLevel? repeat(_curOpts.indent.value, indentLevel) : '';
}

function removeIndent(str){
    return str.replace(/^[ \t]+/gm, '');
}

function getIndentLevel(node) {
    var level = 0;
    while (node) {
        if ( (!node.parent && _curOpts.indent[node.type]) || (node.parent && _curOpts.indent[node.parent.type] ) ) {
            // && (node.loc.start.line !== node.parent.loc.start.line)
            level++;
        }
        node = node.parent;
    }
    return level;
}

// white space
// -----------


function needsSpaceBefore(type){
    return !!_curOpts.whiteSpace.before[type];
}


function needsSpaceAfter(type) {
    return !!_curOpts.whiteSpace.after[type];
}


function removeTrailingWhiteSpace(str){
    return _curOpts.whiteSpace.removeTrailing? str.replace(/[ \t]+$/gm, '') : str;
}




// line break
// ----------

function needsLineBreakBefore(type){
    return !!_curOpts.lineBreak.before[type];
}

function needsLineBreakAfter(type){
    return !!_curOpts.lineBreak.after[type];
}


function removeEmptyLines(str) {
    return _curOpts.lineBreak.keepEmptyLines? str : str.replace(/^[\r\n]*$/gm, '');
}

