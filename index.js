/*jshint node:true*/
"use strict";


// using local version since I modified the code
// var _falafel = require('./lib/falafel');
var walker = require('es-ast-walker');

var pluck = require('amd-utils/array/pluck');
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
            FunctionDeclarationOpeningBrace : true,
            FunctionDeclarationClosingBrace : true,
            ParameterList : false,
            ParameterComma : false,
            ArgumentList : false,
            ArgumentComma : false
        },

        after : {
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
    str = walker.moonwalk(str, transformNode).toString();
    str = removeEmptyLines(str);

    return str;
};





// ========


function transformNode(node){
    node.indentLevel = (node.type in BYPASS_INDENT || (node.parent && node.parent.type in BYPASS_CHILD_INDENT))? null : getIndentLevel(node);
    if (node.type in TRANSFORMS) {
        node.update( TRANSFORMS[node.type](node) );
    }
}


// ---


/*
TRANSFORMS.BlockStatement = function(node){
    var str = '';
    str += wrapLineBreak('{', 'BlockStatementClosingBrace');
    // var body = node.source();
    // str += body.substring(1, body.length - 2);
    str += node.source();
    str += wrapLineBreak('}', 'BlockStatementClosingBrace');
    return str;
};
*/


TRANSFORMS.FunctionDeclaration = function(node){
    var str = '';

    str += getIndent(node.indentLevel);

    // easier to regenarate the function declaration than to parse tokens
    str += 'function ';
    str += wrapSpace(node.id.name, 'FunctionName');
    str += '(';
    str += getSpaceBefore('ParameterList');
    // TODO: check comma first and multiple lines
    str += pluck(node.params, 'name').join( wrapSpace(',', 'ParameterComma') );
    str += getSpaceAfter('ParameterList');
    str += ')';

    str += getSpaceBefore('FunctionDeclarationOpeningBrace');
    str += wrapLineBreak('{', 'FunctionDeclarationOpeningBrace');

    // function.body is a BlockStatement but we have separate rules for it
    var body = node.body.toString();
    str += body.substring(1, body.length - 1);

    str += getSpaceBefore('FunctionDeclarationClosingBrace');
    str += getIndent(node.indentLevel - 1);
    str += wrapLineBreak('}', 'FunctionDeclarationClosingBrace');

    return str;
};


TRANSFORMS.ReturnStatement = function(node){
    var str = '';
    var prevToken = node.getPrevToken();

    if (prevToken && prevToken.type !== 'WhiteSpace' &&
        (prevToken.loc.end.line === node.loc.start.line) &&
        hasLineBreakBefore('ReturnStatement')
       ) {
           str += _br;
    }

    str += getIndent(node.indentLevel) + node.getStartToken().value +' ';
    str += node.argument.toString();
    // avoid ASI
    str += node.getEndToken().value;

    var nextToken = node.getNextToken();
    if (nextToken && hasLineBreakAfter('ReturnStatement')) {
        switch (nextToken.type) {
            case 'LineComment':
            case 'BlockComment':
                break;
            default:
                if(nextToken.loc.start.line === node.loc.end.line) {
                    str += _br;
                }
        }
    }

    return str;
};


TRANSFORMS.CallExpression = function(node){
    var str = '';
    str += getIndent(node.indentLevel);
    str += node.callee.name;
    str += '(';
    var args = node['arguments'];
    if (args.length) {
        str += getSpaceBefore('ArgumentList');
        args = args.map(function(arg){
            if (arg.type === 'Identifier') {
                return arg.name;
            } else if (arg.type === 'Literal'){
                return arg.raw;
            } else {
                return arg.toString();
            }
        });
        str += args.join( wrapSpace(',', 'ArgumentComma') );
        str += getSpaceAfter('ArgumentList');
    }
    str += ')';
    return str;
};




// -------
// HELPERS
// =======

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

function wrapSpace(node, type) {
    return getSpaceBefore(type) + node + getSpaceAfter(type);
}


function getSpaceBefore(type){
    return _curOpts.whiteSpace.before[type]? _curOpts.whiteSpace.value : '';
}


function getSpaceAfter(type) {
    return _curOpts.whiteSpace.after[type]? _curOpts.whiteSpace.value : '';
}


function removeTrailingWhiteSpace(str){
    return _curOpts.whiteSpace.removeTrailing? str.replace(/\s+$/g, '') : str;
}




// line break
// ----------

function wrapLineBreak(node, type){
    return getLineBreakBefore(type) + node + getLineBreakAfter(type);
}


function getLineBreakBefore(type){
    return hasLineBreakBefore(type)? _curOpts.lineBreak.value : '';
}


function getLineBreakAfter(type){
    return hasLineBreakAfter(type)? _curOpts.lineBreak.value : '';
}

function hasLineBreakBefore(type){
    return _curOpts.lineBreak.before[type];
}

function hasLineBreakAfter(type){
    return _curOpts.lineBreak.after[type];
}


function removeEmptyLines(str) {
    return _curOpts.lineBreak.keepEmptyLines? str : str.replace(/^[\r\n]*$/gm, '');
}

