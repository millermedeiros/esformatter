"use strict";


// Hooks for each node.type that should be processed individually
// ---
// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run and also allow
// monkey-patching/spies/mock/stub.


// ---


var _tk = require('./util/token');
var _ws = require('./util/whiteSpace');
var _br = require('./util/lineBreak');
var _indent = require('./util/indent');


// ---


exports.FunctionDeclaration = function(node){
    _ws.afterIfNeeded(node.id.startToken, 'FunctionName');

    if (node.params.length) {
        _ws.beforeIfNeeded(node.params[0].startToken, 'ParameterList');
        node.params.forEach(function(param){
            if (param.startToken.next.value === ',') {
                _ws.aroundIfNeeded(param.startToken.next, 'ParameterComma');
            }
        });
        _ws.afterIfNeeded(node.params[node.params.length - 1].endToken, 'ParameterList');
    }

    // only insert space before if it doesn't break line otherwise we indent it
    if (! _br.needsBefore('FunctionDeclarationOpeningBrace') ) {
        _ws.beforeIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    } else {
        _indent.before(node.body.startToken, node.indentLevel);
    }

    if (! _br.needsAfter('FunctionDeclarationOpeningBrace') ) {
        _ws.afterIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    }

    _br.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');

    if (!_br.needsBefore('FunctionDeclarationClosingBrace') ) {
        _ws.beforeIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');
    }
    _br.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');


    if (node.indentLevel) {
        _indent.before(node.body.endToken, node.indentLevel);
    }
};



exports.BinaryExpression = function(node){
    _ws.afterIfNeeded(node.startToken, 'BinaryExpressionOperator');
    _ws.beforeIfNeeded(node.right.startToken, 'BinaryExpressionOperator');
};



exports.CallExpression = function(node){
    var args = node['arguments'];
    if ( args.length ) {
        _ws.beforeIfNeeded(args[0].startToken, 'ArgumentList');
        args.forEach(function(arg){
            if (arg.endToken.next.value === ',') {
                _ws.aroundIfNeeded(arg.endToken.next, 'ArgumentComma');
            }
        });
        _ws.afterIfNeeded(args[args.length - 1].endToken, 'ArgumentList');
    }

    var gp = node.parent.parent;
    if (gp && (gp.type === 'Program' || gp.type === 'BlockStatement')) {
        _br.beforeIfNeeded(node.startToken, 'CallExpression');
        if (node.endToken.next && node.endToken.next.value === ';') {
            _br.afterIfNeeded(node.endToken.next, 'CallExpression');
        } else {
            _br.afterIfNeeded(node.endToken, 'CallExpression');
        }
    }
};



exports.ObjectExpression = function(node){
    if (! node.properties.length) return;

    _br.aroundIfNeeded(node.startToken, 'ObjectExpressionOpeningBrace');

    node.properties.forEach(function(prop){
        _br.beforeIfNeeded(prop.startToken, 'Property');
        _ws.afterIfNeeded(prop.key.endToken, 'PropertyName');
        var token = prop.endToken.next;
        while (token && token.value !== ',' && token.value !== '}') {
            // TODO: toggle behavior if comma-first
            if (token.type === 'LineBreak') {
                _tk.remove(token);
            }
            token = token.next;
        }
        _ws.beforeIfNeeded(prop.value.startToken, 'PropertyValue');
        _br.afterIfNeeded(prop.endToken, 'Property');
    });

    _br.aroundIfNeeded(node.endToken, 'ObjectExpressionClosingBrace');

    _indent.before(node.endToken, node.closingIndentLevel);
};



exports.VariableDeclaration = function(node){
    node.declarations.forEach(function(declarator, i){
        if (! i) {
            _tk.removeAdjacentBefore(declarator.id.startToken, 'LineBreak');
        } else {
            _br.beforeIfNeeded(declarator.id.startToken, 'VariableName');
            _indent.before(declarator.id.startToken, node.indentLevel + 1);
        }

        if (declarator.init) {
            _ws.afterIfNeeded(declarator.id.endToken, 'VariableName');
            _tk.removeAdjacentBefore(declarator.init.startToken, 'LineBreak');
            _br.beforeIfNeeded(declarator.init.startToken, 'VariableValue');
            _ws.beforeIfNeeded(declarator.init.startToken, 'VariableValue');
        }
    });

    if ( _ws.needsSpaceAfterToken(node.startToken) ) {
        _ws.after(node.startToken);
    }
};


exports.AssignmentExpression = function(node){
    _tk.removeAdjacentAfter(node.left.endToken, 'LineBreak');
    _tk.removeAdjacentBefore(node.right.startToken, 'LineBreak');

    _ws.afterIfNeeded( node.left.endToken, 'AssignmentOperator' );
    _ws.beforeIfNeeded( node.right.startToken, 'AssignmentOperator' );

    var gp = node.parent.parent;
    if (gp && (gp.type === 'Program' || gp.type === 'BlockStatement') ){
        _br.beforeIfNeeded(node.startToken, 'AssignmentExpression');
        var nextToken = node.endToken.next;
        if (nextToken && nextToken.value === ';') {
            _br.afterIfNeeded(nextToken, 'AssignmentExpression');
        } else {
            _br.afterIfNeeded(node.endToken, 'AssignmentExpression');
        }
    }
};


exports.LogicalExpression = function(node){
    var operator = node.left.endToken.next;
    if (operator.value === ')') {
        operator = operator.next;
    }
    _ws.aroundIfNeeded(operator, 'LogicalExpressionOperator');
};



exports.SequenceExpression = function(node){
    node.expressions.forEach(function(expr, i){
        if (i) {
            var operator = expr.startToken.prev;
            while (operator.value !== ',') {
                operator = operator.prev;
            }
            _ws.aroundIfNeeded(operator, 'CommaOperator');
        }
    });
};


