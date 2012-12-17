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
    exports.Params(node.params);

    _ws.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    _ws.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');

    _br.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    _br.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');

    _indent.ifNeeded(node.body.startToken, node.indentLevel);
    _indent.ifNeeded(node.body.endToken, node.indentLevel);
};


exports.Params = function(params){
    if (params.length) {
        _ws.beforeIfNeeded(params[0].startToken, 'ParameterList');
        params.forEach(function(param){
            if (param.startToken.next.value === ',') {
                _ws.aroundIfNeeded(param.startToken.next, 'ParameterComma');
            }
        });
        _ws.afterIfNeeded(params[params.length - 1].endToken, 'ParameterList');
    }
};


exports.FunctionExpression = function(node){
    if (_tk.findNextNonEmpty(node.body.startToken).value === '}') {
        // noop
        _tk.removeWsBrInBetween(node.startToken, node.endToken);
    } else {
        if (node.id) {
            _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
        }
        exports.Params(node.params);

        if (node.parent.type !== 'CallExpression') {
            _ws.aroundIfNeeded( node.body.startToken, 'FunctionExpressionOpeningBrace' );
            _ws.aroundIfNeeded( node.endToken, 'FunctionExpressionClosingBrace' );
        } else {
            _ws.afterIfNeeded( node.body.startToken, 'FunctionExpressionOpeningBrace' );
            _ws.beforeIfNeeded( node.endToken, 'FunctionExpressionClosingBrace' );
        }

        _br.aroundIfNeeded( node.body.startToken, 'FunctionExpressionOpeningBrace' );
        _br.aroundIfNeeded( node.endToken, 'FunctionExpressionClosingBrace' );
        _indent.ifNeeded(node.body.endToken, node.closingIndentLevel);
    }
};



exports.BinaryExpression = function(node){
    _tk.removeInBetween(node.startToken, node.endToken, 'LineBreak');
    var operator = _tk.findNext(node.left.endToken, node.operator);
    _ws.aroundIfNeeded(operator, 'BinaryExpressionOperator');
};



exports.CallExpression = exports.NewExpression = function(node){
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
    var shouldIndent = node.parent.type !== 'ForStatement';
    if (! shouldIndent) {
        _tk.removeInBetween(node.startToken, node.endToken, 'LineBreak');
    }

    node.declarations.forEach(function(declarator, i){
        if (! i) {
            _tk.removeAdjacentBefore(declarator.id.startToken, 'LineBreak');
        } else if (shouldIndent) {
            _br.beforeIfNeeded(declarator.id.startToken, 'VariableName');
            _indent.before(declarator.id.startToken, node.indentLevel + 1);
        } else {
            _ws.beforeIfNeeded(declarator.id.startToken, 'VariableName');
        }

        if (declarator.init) {
            _ws.afterIfNeeded(declarator.id.endToken, 'VariableName');
            _tk.removeAdjacentBefore(declarator.init.startToken, 'LineBreak');
            _br.beforeIfNeeded(declarator.init.startToken, 'VariableValue');
            _ws.beforeIfNeeded(declarator.init.startToken, 'VariableValue');
        }
    });

    if ( _ws.needsAfterToken(node.startToken) ) {
        _ws.after(node.startToken);
    }
};


exports.AssignmentExpression = function(node){
    _tk.removeWsBrInBetween(node.left.endToken, node.right.startToken);
    _ws.afterIfNeeded( node.left.endToken, 'AssignmentOperator' );
    _ws.beforeIfNeeded( node.right.startToken, 'AssignmentOperator' );
};


exports.LogicalExpression = function(node){
    var operator = _tk.findNext(node.left.endToken, node.operator);
    _ws.aroundIfNeeded(operator, 'LogicalExpressionOperator');
    // revert line breaks since parenthesis might not be part of
    // node.startToken and node.endToken
    if (node.parent.type === 'ExpressionStatement') {
        var shouldRevert;
        var prev = _tk.findPrevNonEmpty(node.left.startToken);
        if ( prev && prev.value === '(') {
            _tk.removeWsBrInBetween(prev, node.startToken);
            node.startToken = prev;
            shouldRevert = true;
        }
        var next = _tk.findNextNonEmpty(node.right.endToken);
        if ( next && next.value === ')') {
            _tk.removeWsBrInBetween(node.endToken, next);
            node.endToken = next;
            shouldRevert = true;
        }
        if (shouldRevert) {
            _br.aroundNodeIfNeeded(node);
        }
    }
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



exports.WhileStatement = function(node){
    var conditionalStart = _tk.findNext(node.startToken, '(');
    var conditionalEnd = _tk.findPrev(node.body.startToken, ')');

    // XXX: this will probably need to change when we integrate [#1]
    _tk.removeInBetween(node.startToken, conditionalEnd, 'LineBreak');
    _ws.beforeIfNeeded(conditionalStart, 'WhileStatementConditional');

    if (node.body.type === 'BlockStatement') {
        var bodyStart = node.body.startToken;
        var bodyEnd = node.body.endToken;
        if (! _br.needsBefore('WhileStatementOpeningBrace') ) {
            _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
        }
        _br.aroundIfNeeded(bodyStart, 'WhileStatementOpeningBrace');
        _ws.aroundIfNeeded(bodyStart, 'WhileStatementOpeningBrace');
        _br.aroundIfNeeded(bodyEnd, 'WhileStatementClosingBrace');
        _ws.aroundIfNeeded(bodyEnd, 'WhileStatementClosingBrace');
        _indent.before(bodyEnd, node.indentLevel);
        _ws.afterIfNeeded(conditionalEnd, 'WhileStatementConditional');
    }
    else if (conditionalEnd.next && conditionalEnd.next.value !== ';') {
        _ws.afterIfNeeded(conditionalEnd, 'WhileStatementConditional');
    }
};



exports.ForStatement = function(node){
    var expressionStart = _tk.findNext(node.startToken, '(');
    var expressionEnd = _tk.findPrev(node.body.startToken, ')');

    _tk.removeInBetween(node.startToken, expressionEnd, 'LineBreak');

    _ws.beforeIfNeeded(expressionStart, 'ForStatementExpression');

    var semi_1, semi_2;
    if (node.test) {
        semi_1 = _tk.findPrev(node.test.startToken, ';');
        semi_2 = _tk.findNext(node.test.endToken, ';');
    } else {
        if (node.init) semi_1 = _tk.findNext(node.init.endToken, ';');
        if (node.update) semi_2 = _tk.findPrev(node.update.startToken, ';');
    }

    if (semi_1) _ws.aroundIfNeeded(semi_1, 'ForStatementSemicolon');
    if (semi_2) _ws.aroundIfNeeded(semi_2, 'ForStatementSemicolon');

    if (node.body.type === 'BlockStatement') {
        var bodyStart = node.body.startToken;
        var bodyEnd = node.body.endToken;
        if (! _br.needsBefore('ForStatementOpeningBrace') ) {
            _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
        }
        _tk.removeAdjacentAfter(bodyStart, 'WhiteSpace');
        _br.aroundIfNeeded(bodyStart, 'ForStatementOpeningBrace');
        _ws.aroundIfNeeded(bodyStart, 'ForStatementOpeningBrace');
        _br.aroundIfNeeded(bodyEnd, 'ForStatementClosingBrace');
        _ws.aroundIfNeeded(bodyEnd, 'ForStatementClosingBrace');
        _indent.before(bodyEnd, node.indentLevel);
        _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
    }
    else if (expressionEnd.next && expressionEnd.next.value !== ';') {
        _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
    }
};



exports.IfStatement = function(node){

    var startBody = node.consequent.startToken;
    var endBody = node.consequent.endToken;

    var conditionalStart = _tk.findPrev(node.test.startToken, '(');
    var conditionalEnd = _tk.findNext(node.test.endToken, ')');

    _tk.removeWsBrInBetween(node.startToken, conditionalStart);
    _tk.removeWsBrInBetween(conditionalEnd, startBody);

    _ws.beforeIfNeeded(conditionalStart, 'IfStatementConditional');
    _ws.afterIfNeeded(conditionalEnd, 'IfStatementConditional');


    var alt = node.alternate;
    if (alt) {
        var elseKeyword = _tk.findPrev(alt.startToken, 'else');
        var startEmptyRemove = _tk.findPrevNonEmpty(elseKeyword);
        if ( !(startEmptyRemove.type === 'Punctuator' && startEmptyRemove.value === '}')){
            startEmptyRemove = elseKeyword;
        }
        _tk.removeWsBrInBetween(startEmptyRemove, alt.startToken);

        if (alt.type === 'IfStatement') {
            // ElseIfStatement
            _ws.before(alt.startToken);

            _br.beforeIfNeeded(alt.consequent.startToken, 'ElseIfStatementOpeningBrace');
            _indent.ifNeeded( alt.consequent.startToken, node.indentLevel );
            _br.beforeIfNeeded(alt.consequent.endToken, 'ElseIfStatementClosingBrace');
            _br.beforeIfNeeded(elseKeyword, 'ElseIfStatement');
            _br.afterIfNeeded(alt.consequent.endToken, 'ElseIfStatement');

        } else if (alt.type === 'BlockStatement') {
            // ElseStatement
            _ws.beforeIfNeeded(elseKeyword);
            _br.aroundIfNeeded(alt.startToken, 'ElseStatementOpeningBrace');
            _ws.aroundIfNeeded(alt.startToken, 'ElseStatementOpeningBrace');

            if ( _br.needsBefore('ElseStatementClosingBrace') ) {
                var lastNonEmpty = _tk.findPrevNonEmpty(alt.endToken);
                _tk.removeInBetween(lastNonEmpty, alt.endToken, 'WhiteSpace');
                _br.aroundIfNeeded(alt.endToken, 'ElseStatementClosingBrace');
                _indent.ifNeeded(alt.endToken, node.indentLevel);
            } else {
                _ws.aroundIfNeeded(alt.endToken, 'ElseStatementClosingBrace');
            }
            _br.beforeIfNeeded(elseKeyword, 'ElseStatement' );
            _br.afterIfNeeded( alt.endToken, 'ElseStatement' );
            _indent.ifNeeded( elseKeyword, node.indentLevel );
            _indent.ifNeeded( alt.startToken, node.indentLevel );

        } else {
            // ElseStatement without curly braces
            _ws.after(elseKeyword); // required
        }
    }

    // only handle braces if block statement
    if (node.consequent.type === 'BlockStatement') {
        _tk.removeWsBrInBetween(_tk.findPrevNonEmpty(endBody), endBody);

        _br.aroundIfNeeded(startBody, 'IfStatementOpeningBrace');
        _ws.aroundIfNeeded(startBody, 'IfStatementOpeningBrace');
        if (! alt) {
            _br.aroundIfNeeded(endBody, 'IfStatementClosingBrace');
        } else {
            _br.beforeIfNeeded(endBody, 'IfStatementClosingBrace');
        }
        _indent.ifNeeded(startBody, node.indentLevel);
        _indent.ifNeeded(endBody, node.indentLevel);
        _ws.aroundIfNeeded(endBody, 'IfStatementClosingBrace');
    }

};



exports.ReturnStatement = function(node) {
    _tk.removeWsBrInBetween(node.startToken, _tk.findNextNonEmpty(node.startToken));
    _ws.after(node.startToken);
    if ( _tk.isSemiColon(node.endToken) ) {
        _tk.removeWsBrInBetween(_tk.findPrevNonEmpty(node.endToken), node.endToken);
    }
};



exports.ConditionalExpression = function(node){
    // we need to grab the actual punctuators since parenthesis aren't counted
    // as part of test/consequent/alternate
    var questionMark = _tk.findNext(node.test.endToken, '?');
    var colon = _tk.findNext(node.consequent.endToken, ':');

    _tk.removeWsBrInBetween(node.test.endToken, _tk.findNextNonEmpty(questionMark));
    _tk.removeWsBrInBetween(node.consequent.endToken, _tk.findNextNonEmpty(colon));

    _ws.beforeIfNeeded(questionMark, _ws.needsAfter('ConditionalExpressionTest'));
    _ws.afterIfNeeded(questionMark, _ws.needsBefore('ConditionalExpressionConsequent'));
    _ws.beforeIfNeeded(colon, _ws.needsAfter('ConditionalExpressionConsequent'));
    _ws.afterIfNeeded(colon, _ws.needsBefore('ConditionalExpressionAlternate'));
};


exports.UnaryExpression = function(node){
    if (node.operator === 'delete') {
        _tk.removeWsBrInBetween(node.startToken, _tk.findNextNonEmpty(node.startToken));
        _ws.after(node.startToken);
        _br.beforeIfNeeded(node.startToken, 'DeleteOperator');
        var endToken = node.endToken;
        if ( _tk.isSemiColon(endToken.next) ) {
            endToken = endToken.next;
        }
        _br.afterIfNeeded(endToken, 'DeleteOperator');
    }
};


exports.DoWhileStatement = function(node){
    if (node.body.type === 'BlockStatement') {
        _ws.aroundIfNeeded(node.body.startToken, 'DoWhileStatementOpeningBrace');
        _ws.aroundIfNeeded(node.body.endToken, 'DoWhileStatementClosingBrace');
        _br.aroundIfNeeded(node.body.startToken, 'DoWhileStatementOpeningBrace');
        _br.aroundIfNeeded(node.body.endToken, 'DoWhileStatementClosingBrace');
    } else {
        _ws.afterIfNeeded(node.startToken);
    }
    var whileKeyword = _tk.findPrev(node.test.startToken, 'while');
    _ws.aroundIfNeeded(whileKeyword);
};

