/*jshint node:true*/
"use strict";


var _falafel = require('falafel');

var pluck = require('amd-utils/array/pluck');
var merge = require('amd-utils/object/merge');
var repeat = require('amd-utils/string/repeat');

var get = require('amd-utils/object/get'); //TODO: delete, used only for debug


// ---

var PARSE_OPTS = {
    comment : true,
    loc : true,
    raw : true,
    tolerant : true
};

// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run.
var TRANSFORMS = {};
var SPECIAL_LINE_BREAKS = {};

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
            ReturnStatement : true,
            BlockStatement : false,
            BlockStatementClosingBrace : true
        },

        after : {
            FunctionDeclaration : true,
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
var SKIP_INDENT_RULES = {
    Identifier : true
};


// ---

var _curOpts;


exports.format = function(str, opts){
    // everything is sync so we use a local var for brevity
    _curOpts = merge(DEFAULT_OPTS, opts);

    // we remove indent and trailing whitespace before since it's simpler, code
    // is responsible for re-indenting
    str = removeIndent(str);
    str = removeTrailingWhiteSpace(str);
    str = removeEmptyLines(str);
    // str = _falafel(str, PARSE_OPTS, addLineBreaks).toString();
    str = _falafel(str, PARSE_OPTS, addWhiteSpaces).toString();
    // str = _falafel(str, PARSE_OPTS, transformNode).toString();

    return str;
};


/*
function transformNode(node){
    addLineBreaks(node);
    addWhiteSpaces(node);
}
*/


var _addedLineBreaks = [];


function addLineBreaks(node){
    if (_addedLineBreaks.indexOf(node) !== -1) {
        // add line break only once
        return;
    }

    var before = getLineBreakBefore(node.type);
    var after = getLineBreakAfter(node.type);

    if ( before ) {
        if ( (node.prev && (node.prev.loc.end.line < node.loc.start.line)) ||
             (node.parent && (node.parent.loc.start.line < node.loc.start.line)) ) {
            before = '';
        } else {
            node.loc.start.line += 1;
            node.loc.end.line += 1;
            bumpNextLines(node);
            bumpParentLines(node);
        }
    }

    if (after) {
        if (node.next && (node.next.loc.start.line > node.loc.end.line)) {
            after = '';
        } else {
            node.loc.end.line += 1;
            bumpNextLines(node);
            bumpParentLines(node);
        }
    }

    if ( before || after || node.type in SPECIAL_LINE_BREAKS ) {
        var content = (node.type in SPECIAL_LINE_BREAKS)?
                        SPECIAL_LINE_BREAKS[node.type](node) :
                        node.source();
        node.update( before + content + after );
        _addedLineBreaks.push(node);
    }
}


function bumpNextLines(node){
    var next = node.next;
    while (next) {
        next.loc.start.line += 1;
        next.loc.end.line += 1;
        next = next.next;
    }
}


function bumpParentLines(node){
    var parent = node.parent;
    while (parent) {
        parent.loc.end.line += 1;
        bumpNextLines(parent);
        parent = parent.parent;
    }
}


SPECIAL_LINE_BREAKS.BlockStatement = function(node){
    var str = node.source();
    str = str.substring(0, str.length - 2) + wrapLineBreak('}', 'BlockStatementClosingBrace');
    return str;
};


// ========


// var _addedSpaces = [];

function addWhiteSpaces(node){
    // process only once
    // if (_addedSpaces.indexOf(node)) {
        // return;
    // }

    node.indentLevel = (node.type in SKIP_INDENT_RULES)? null : getIndentLevel(node);

    // if (node.indentLevel != null) {
        // console.log(node.type, node.indentLevel);
    // }

    if (node.type in TRANSFORMS) {
        node.update( TRANSFORMS[node.type](node) );
        // _addedSpaces.push(node);
    }
}


// ---


TRANSFORMS.FunctionDeclaration = function(node){
    var str = getIndent(node.indentLevel);

    // easier to regenarate the function declaration
    str += 'function ';
    str += wrapSpace(node.id.name, 'FunctionName');
    str += '(';
    str += getSpaceBefore('ParameterList');
    str += pluck(node.params, 'name').join( wrapSpace(',', 'ParameterComma') );
    str += getSpaceAfter('ParameterList');
    str += ')';

    // str += getSpaceBefore('FunctionDeclarationOpeningBrace');

    // console.log('======')
    // console.log(str)
    // console.log('------')
    // console.log(node.body.source())
    // console.log('======')

    str += node.body.source();
    // str = str.substring(0, str.length - 2) + getSpaceBefore('FunctionDeclarationClosingBrace') + '}';

    return str;
};

/* */
TRANSFORMS.BlockStatement = function(node){
    var str = getSpaceBefore('FunctionDeclarationOpeningBrace');
    str += '{';
    // console.log(node.type, '\n-----\n', node.source(), '\n======' )
    var body = node.source();
    // str += body.substring(1, body.length - 2);
    str += body;
    str += getSpaceBefore('FunctionDeclarationClosingBrace');
    str += '}';
    return str;
};
/* */

TRANSFORMS.ReturnStatement = function(node){
    // console.log('=======')
    // console.log( get(node, 'parent.parent.id.name'), '"'+ node.argument.source() +'"')
    var str = getIndent(node.indentLevel) + 'return ';
    switch (node.argument.type) {
        case 'Identifier':
            str += node.argument.name;
            break;
        case 'Literal':
            str += node.argument.raw;
            break;
        default:
            str += node.argument.source();
            break;
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
                return arg.source();
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
        if ( (!node.parent && _curOpts.indent[node.type]) || (node.parent && _curOpts.indent[node.parent.type] && (node.loc.start.line !== node.parent.loc.start.line) ) ) {
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
    return _curOpts.lineBreak.before[type]? _curOpts.lineBreak.value : '';
}


function getLineBreakAfter(type){
    return _curOpts.lineBreak.after[type]? _curOpts.lineBreak.value : '';
}


function removeEmptyLines(str) {
    return _curOpts.lineBreak.keepEmptyLines? str : str.replace(/^[\r\n]*$/gm, '');
}

