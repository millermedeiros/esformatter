/*jshint node:true*/
"use strict";


// non-destructive changes to EcmaScript code using an "enhanced" AST for the
// process, it updates the tokens in place and add/remove spaces & line breaks
// based on user settings.
// not using any kind of code rewrite based on string concatenation to avoid
// breaking the program correctness and/or undesired side-effects.



var walker = require('rocambole');

var merge = require('amd-utils/object/merge');
var repeat = require('amd-utils/string/repeat');



// ---


// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run and we could potentially
// monkey-patch these methods in the future.
var HOOKS = {};
exports.hooks = HOOKS;


// All supported options also default options)
var DEFAULT_OPTS = {

    indent : {
        value : '    ', // 4 spaces
        FunctionDeclaration : true,
        ObjectExpression : true,
        VariableDeclarator : false
    },


    lineBreak : {
        value : '\n', // unix format
        keepEmptyLines : true,

        before : {
            AssignmentExpression : true,
            BlockStatement : false,
            CallExpression : true,
            FunctionDeclaration : true,
            FunctionDeclarationClosingBrace : true,
            FunctionDeclarationOpeningBrace : false,
            ObjectExpressionClosingBrace : true,
            Property : true,
            ReturnStatement : true,
            VariableName : true,
            VariableValue : false,
            VariableDeclaration : true
        },

        after : {
            AssignmentExpression : true,
            BlockStatement : false,
            CallExpression : true,
            FunctionDeclaration : false,
            FunctionDeclarationClosingBrace : true,
            FunctionDeclarationOpeningBrace : true,
            ObjectExpressionOpeningBrace : true,
            Property : false,
            ReturnStatement : true
        }
    },


    whiteSpace : {
        value : ' ', // single space
        removeTrailing : true,

        before : {
            ArgumentComma : false,
            ArgumentList : false,
            AssignmentOperator : true,
            BinaryExpressionOperator : true,
            CommaOperator : false,
            FunctionDeclarationClosingBrace : true,
            FunctionDeclarationOpeningBrace : true,
            LineComment : true,
            LogicalExpressionOperator : true,
            PropertyValue : true,
            ParameterComma : false,
            ParameterList : false,
            VariableValue : true
        },

        after : {
            ArgumentComma : true,
            ArgumentList : false,
            AssignmentOperator : true,
            BinaryExpressionOperator : true,
            CommaOperator : true,
            FunctionName : false,
            LogicalExpressionOperator : true,
            PropertyName : true,
            ParameterComma : true,
            ParameterList : false,
            SemiColon : true,
            VariableName : true,
            VarToken : true
        }
    }

};


// some nodes shouldn't be affected by indent rules, so we simply ignore them
var BYPASS_INDENT = {
    BlockStatement : true, // child nodes already add indent
    Identifier : true,
    Literal : true
};


// some child nodes are already responsible for indentation
var BYPASS_CHILD_INDENT = {
    CallExpression : true,
    ExpressionStatement : true,
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
    processTokens(ast);

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

    if (! (node.type in BYPASS_AUTOMATIC_LINE_BREAK)) {
        brBeforeIfNeeded(node.startToken, node.type);
    }

    processComments(node);

    if ( node.indentLevel ) {
        indent(node.startToken, node.indentLevel);
    } else if (node.type in CLOSING_CHILD_INDENT) {
        node.closingIndentLevel = getIndentLevel(node.parent);
    }

    if (node.type in exports.hooks) {
        exports.hooks[node.type](node);
    }

    if (! (node.type in BYPASS_AUTOMATIC_LINE_BREAK)) {
        brAfterIfNeeded(node.endToken, node.type);
    }
}


function processComments(node){
    var token = node.startToken;
    var endToken = node.endToken;

    while (token && token !== endToken) {
        if (!token._processed && (token.type === 'LineComment' || token.type === 'BlockComment') ) {
            wsBeforeIfNeeded(token, token.type);
            // need to add 1 since comment is a child of the node
            var indentLevel = node.type !== 'Program' && node.type !== 'ExpressionStatement'? node.indentLevel + 1 : node.indentLevel;
            if (indentLevel && token.prev && token.prev.type === 'LineBreak') {
                indent(token, indentLevel);
            }
            // we avoid processing same comment multiple times
            token._processed = true;
        }
        token = token.next;
    }
}



function processTokens(ast) {
    if (! needsSpaceAfter('SemiColon') && ! needsSpaceBefore('SemiColon')) return;
    var token = ast.startToken;
    while (token) {
        //XXX: unsure about this behavior
        if (token.value === ';' && token.next && token.next.type !== 'Punctuator') {
            wsAroundIfNeeded(token, 'SemiColon');
        }
        token = token.next;
    }
}


// ====


//TODO: abstract the white space and line break insertion even further
//      it is really dumb to constantly check if it needs to be inserted
//      maybe a config object will be able to process 99% of the cases


HOOKS.FunctionDeclaration = function(node){
    wsAfterIfNeeded(node.id.startToken, 'FunctionName');

    if (node.params.length) {
        wsBeforeIfNeeded(node.params[0].startToken, 'ParameterList');
        node.params.forEach(function(param){
            if (param.startToken.next.value === ',') {
                wsAroundIfNeeded(param.startToken.next, 'ParameterComma');
            }
        });
        wsAfterIfNeeded(node.params[node.params.length - 1].endToken, 'ParameterList');
    }

    // only insert space before if it doesn't break line otherwise we indent it
    if (! needsLineBreakBefore('FunctionDeclarationOpeningBrace') ) {
        wsBeforeIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    } else {
        indent(node.body.startToken, node.indentLevel);
    }

    if (! needsLineBreakAfter('FunctionDeclarationOpeningBrace') ) {
        wsAfterIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    }

    brAroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');

    if (!needsLineBreakBefore('FunctionDeclarationClosingBrace') ) {
        wsBeforeIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');
    }
    brAroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');


    if (node.indentLevel) {
        indent(node.body.endToken, node.indentLevel);
    }
};



HOOKS.BinaryExpression = function(node){
    wsAfterIfNeeded(node.startToken, 'BinaryExpressionOperator');
    wsBeforeIfNeeded(node.right.startToken, 'BinaryExpressionOperator');
};



HOOKS.CallExpression = function(node){
    var args = node['arguments'];
    if ( args.length ) {
        wsBeforeIfNeeded(args[0].startToken, 'ArgumentList');
        args.forEach(function(arg){
            if (arg.endToken.next.value === ',') {
                wsAroundIfNeeded(arg.endToken.next, 'ArgumentComma');
            }
        });
        wsAfterIfNeeded(args[args.length - 1].endToken, 'ArgumentList');
    }

    var gp = node.parent.parent;
    if (gp && (gp.type === 'Program' || gp.type === 'BlockStatement')) {
        brBeforeIfNeeded(node.startToken, 'CallExpression');
        if (node.endToken.next && node.endToken.next.value === ';') {
            brAfterIfNeeded(node.endToken.next, 'CallExpression');
        } else {
            brAfterIfNeeded(node.endToken, 'CallExpression');
        }
    }
};



HOOKS.ObjectExpression = function(node){
    if (! node.properties.length) return;

    brAroundIfNeeded(node.startToken, 'ObjectExpressionOpeningBrace');

    node.properties.forEach(function(prop){
        brBeforeIfNeeded(prop.startToken, 'Property');
        wsAfterIfNeeded(prop.key.endToken, 'PropertyName');
        var token = prop.endToken.next;
        while (token && token.value !== ',' && token.value !== '}') {
            // TODO: toggle behavior if comma-first
            if (token.type === 'LineBreak') {
                token.remove();
            }
            token = token.next;
        }
        wsBeforeIfNeeded(prop.value.startToken, 'PropertyValue');
        brAfterIfNeeded(prop.endToken, 'Property');
    });

    brAroundIfNeeded(node.endToken, 'ObjectExpressionClosingBrace');

    indent(node.endToken, node.closingIndentLevel);
};



HOOKS.VariableDeclaration = function(node){
    node.declarations.forEach(function(declarator, i){
        if (! i) {
            removeAdjacentBefore(declarator.id.startToken, 'LineBreak');
        } else {
            brBeforeIfNeeded(declarator.id.startToken, 'VariableName');
            indent(declarator.id.startToken, node.indentLevel + 1);
        }

        if (declarator.init) {
            wsAfterIfNeeded(declarator.id.endToken, 'VariableName');
            removeAdjacentBefore(declarator.init.startToken, 'LineBreak');
            brBeforeIfNeeded(declarator.init.startToken, 'VariableValue');
            wsBeforeIfNeeded(declarator.init.startToken, 'VariableValue');
        }
    });

    wsAfterIfNeeded(node.startToken, 'VarToken');
};


HOOKS.AssignmentExpression = function(node){
    removeAdjacentAfter(node.left.endToken, 'LineBreak');
    removeAdjacentBefore(node.right.startToken, 'LineBreak');

    wsAfterIfNeeded( node.left.endToken, 'AssignmentOperator' );
    wsBeforeIfNeeded( node.right.startToken, 'AssignmentOperator' );

    var gp = node.parent.parent;
    if (gp && (gp.type === 'Program' || gp.type === 'BlockStatement') ){
        brBeforeIfNeeded(node.startToken, 'AssignmentExpression');
        var nextToken = node.endToken.next;
        if (nextToken && nextToken.value === ';') {
            brAfterIfNeeded(nextToken, 'AssignmentExpression');
        } else {
            brAfterIfNeeded(node.endToken, 'AssignmentExpression');
        }
    }
};


HOOKS.LogicalExpression = function(node){
    var operator = node.left.endToken.next;
    if (operator.value === ')') {
        operator = operator.next;
    }
    wsAroundIfNeeded(operator, 'LogicalExpressionOperator');
};



HOOKS.SequenceExpression = function(node){
    node.expressions.forEach(function(expr, i){
        if (i) {
            var operator = expr.startToken.prev;
            while (operator.value !== ',') {
                operator = operator.prev;
            }
            wsAroundIfNeeded(operator, 'CommaOperator');
        }
    });
};



// -------
// HELPERS
// =======


function removeBrBetween(startToken, endToken){
    while(startToken !== endToken) {
        if (startToken.type === 'LineBreak') {
            startToken.remove();
        }
        startToken = startToken.next;
    }
}


function removeAdjacentBefore(token, type){
    var prev = token.prev;
    while (prev && prev.type === type) {
        prev.remove();
        prev = prev.prev;
    }
}


function removeAdjacentAfter(token, type){
    var next = token.next;
    while (next && next.type === type) {
        next.remove();
        next = next.next;
    }
}


function wsBeforeIfNeeded(token, type){
    var prev = token.prev;
    if (needsSpaceBefore(type) && prev &&
        prev.type !== 'WhiteSpace' &&
        prev.type !== 'LineBreak') {
        wsBefore(token, _curOpts.whiteSpace.value);
    }
}

function wsAfterIfNeeded(token, type){
    var next = token.next;
    if (needsSpaceAfter(type) && next &&
        next.type !== 'WhiteSpace' &&
        next.type !== 'LineBreak') {
        wsAfter(token, _curOpts.whiteSpace.value);
    }
}

function wsAroundIfNeeded(token, type){
    wsBeforeIfNeeded(token, type);
    wsAfterIfNeeded(token, type);
}



function brBeforeIfNeeded(token, nodeType){
    var prevToken = token.prev;
    if ( needsLineBreakBefore(nodeType) ) {
        if (prevToken){
            if(prevToken.type !== 'LineBreak' &&
               prevToken.type !== 'WhiteSpace' &&
               prevToken.loc.end.line === token.loc.start.line) {
                brBefore(token);
            }
        } else {
            brBefore(token);
        }
    }
}


function brAroundIfNeeded(token, nodeType){
    brBeforeIfNeeded(token, nodeType);
    brAfterIfNeeded(token, nodeType);
}


function brAfterIfNeeded(token, nodeType){
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
                        brAfter(token);
                    }
            }
        } else {
            brAfter(token);
        }
    }
}


// TODO: refactor node insertion and abstract it inside ast-walker

function wsBefore(token, value) {
    if (!value) return; // avoid inserting non-space
    var startRange = token.range[0];
    var startLine = token.loc.start.line;
    var startColumn = token.loc.start.column;
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


function wsAfter(token, value) {
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


function brBefore(token){
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

function brAfter(token){
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

function indent(token, indentLevel) {
    if (indentLevel && indentLevel > 0){
        wsBefore(token, getIndent(indentLevel));
    }
}


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

