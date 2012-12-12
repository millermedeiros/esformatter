"use strict";


// indent helpers

var repeat = require('amd-utils/string/repeat');
var _ws = require('./whiteSpace');
var _ast = require('./ast');

var _curOpts;


// ---


exports.get = getIndent;
exports.getLevel = getIndentLevel;
exports.before = indent;
exports.removeAll = removeIndent;
exports.setOptions = setOptions;


// ---


function setOptions(opts){
    _curOpts = opts;
}


function indent(token, indentLevel) {
    if (indentLevel && indentLevel > 0){
        _ws.before(token, getIndent(indentLevel));
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
            // ElseIfStatement changes the whole logic
            if (node.type !== 'IfStatement' || node.parent.type !== 'IfStatement' || _ast.getNodeKey(node) !== 'alternate') {
                level++;
            }
        }
        node = node.parent;
    }
    return level;
}

