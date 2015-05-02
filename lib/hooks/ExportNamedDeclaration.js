'use strict';
var varDeclaration = require('./VariableDeclaration');

exports.format = function ExportNamedDeclaration(node) {
    var _br = require('rocambole-linebreak');
    var _tk = require('rocambole-token');
    var _ws = require('rocambole-whitespace');

    _br.limitAfter(node.startToken, 0);
    _ws.limitAfter(node.startToken, 1);
};

