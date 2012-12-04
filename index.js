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

var get = require('amd-utils/object/get'); //TODO: delete, used only for debug


// ---


// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run.
var TRANSFORMS = {};

// All supported options also default options)
var DEFAULT_OPTS = {

    indent : {
        value : '    ', // 4 spaces
        FunctionDeclaration : false,
        BlockStatement : true
    },


    lineBreak : {
        value : '\n', // unix format
        keepEmptyLines : true,

        before : {
            FunctionDeclaration : true,
            FunctionDeclarationOpeningBrace : false,
            FunctionDeclarationClosingBrace : true,
            ReturnStatement : true,
            BlockStatement : false,
            BlockStatementClosingBrace : false
        },

        after : {
            FunctionDeclaration : false,
            FunctionDeclarationOpeningBrace : true,
            FunctionDeclarationClosingBrace : true,
            ReturnStatement : true,
            BlockStatement : false,
            BlockStatementClosingBrace : false
        }
    },


    whiteSpace : {
        value : ' ', // single space
        removeTrailing : true,

        before : {
            BinaryExpressionOperator : true,
            FunctionDeclarationOpeningBrace : true,
            FunctionDeclarationClosingBrace : true,
            ParameterList : false,
            ParameterComma : false,
            ArgumentList : false,
            ArgumentComma : false
        },

        after : {
            BinaryExpressionOperator : true,
            FunctionName : false,
            ParameterList : false,
            ParameterComma : true,
            ArgumentList : false,
            ArgumentComma : true
        }
    }

};


// some nodes shouldn't be affected by indent rules, so we simply ignore them
var BYPASS_INDENT = {
    Identifier : true
};

var BYPASS_CHILD_INDENT = {
    ReturnStatement : true
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
    str = walker.moonwalk(str, transformNode).toString();

    return str;
};





// ========


function transformNode(node){
    node.indentLevel = (node.type in BYPASS_INDENT || (node.parent && node.parent.type in BYPASS_CHILD_INDENT))? null : getIndentLevel(node);

    insertLineBreakBeforeNodeIfNeeded(node);

    if (node.indentLevel) {
        insertWhiteSpaceBeforeToken(node.startToken, getIndent(node.indentLevel));
    }

    if (node.type in TRANSFORMS) {
        TRANSFORMS[node.type](node);
    }

    insertLineBreakAfterNodeIfNeeded(node);
}


// ---


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

    insertLineBreakAroundTokenIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    insertLineBreakAroundTokenIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');
};



TRANSFORMS.BinaryExpression = function(node){
    insertWhiteSpaceAfterTokenIfNeeded(node.startToken, 'BinaryExpressionOperator');
    insertWhiteSpaceBeforeTokenIfNeeded(node.right.startToken, 'BinaryExpressionOperator');
};



// -------
// HELPERS
// =======


function insertWhiteSpaceBeforeTokenIfNeeded(token, type){
    if (needsSpaceBefore(type) && token.prev && token.prev.type !== 'WhiteSpace') {
        insertWhiteSpaceBeforeToken(token, _curOpts.whiteSpace.value);
    }
}

function insertWhiteSpaceAfterTokenIfNeeded(token, type){
    if (needsSpaceAfter(type) && token.next && token.next.type !== 'WhiteSpace') {
        insertWhiteSpaceAfterToken(token, _curOpts.whiteSpace.value);
    }
}

function insertWhiteSpaceAroundTokenIfNeeded(token, type){
    insertWhiteSpaceBeforeTokenIfNeeded(token, type);
    insertWhiteSpaceAfterTokenIfNeeded(token, type);
}


function insertLineBreakBeforeNodeIfNeeded(node){
    insertLineBreakBeforeTokenIfNeeded(node.startToken, node.type);
}

function insertLineBreakBeforeTokenIfNeeded(token, nodeType){
    var prevToken = token.prev;
    if (prevToken &&
        prevToken.type !== 'WhiteSpace' &&
        prevToken.type !== 'LineBreak' &&
        (prevToken.loc.end.line === token.loc.start.line) &&
        needsLineBreakBefore(nodeType)
       ) {
           insertLineBreakBeforeToken(token);
    }
}


function insertLineBreakAfterNodeIfNeeded(node){
    insertLineBreakAfterTokenIfNeeded(node.endToken, node.type);
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
                        insertLineBreakBeforeToken(nextToken);
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
    var startRange = token.prev.range[1] + 1;
    var endRange = startRange + value.length;
    var startLine = token.prev.loc.end.line;
    var startColumn = token.prev.loc.end.column;
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
    return _curOpts.whiteSpace.removeTrailing? str.replace(/\s+$/g, '') : str;
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

