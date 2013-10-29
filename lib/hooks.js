"use strict";


// Hooks for each node.type that should be processed individually
// ---
// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run and also allow
// monkey-patching/spies/mock/stub.


// ---


var _ast = require('./util/ast');
var _tk = require('./util/token');
var _ws = require('./util/whiteSpace');
var _br = require('./util/lineBreak');
var _indent = require('./util/indent');
var _brws = require('./util/insert');


// ---


exports.FunctionDeclaration = function(node){
    _tk.removeEmptyInBetween(node.id.startToken, _tk.findNext(node.id.startToken, '{'));

    _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
    exports.Params(node.params);

    _tk.removeEmptyAdjacentBefore(node.body.endToken);

    _brws.aroundIfNeeded(node.body.startToken, 'FunctionDeclarationOpeningBrace');
    _brws.aroundIfNeeded(node.body.endToken, 'FunctionDeclarationClosingBrace');

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
    _tk.removeEmptyInBetween(_tk.findPrev(node.body.startToken, ')'),
                            node.body.startToken);

    if (_tk.findNextNonEmpty(node.body.startToken).value === '}') {
        // noop
        _tk.removeEmptyInBetween(node.startToken, node.endToken);
    } else {
        if (node.id) {
            _ws.afterIfNeeded(node.id.startToken, 'FunctionName');
        }
        exports.Params(node.params);

        _ws.aroundIfNeeded( node.body.startToken, 'FunctionExpressionOpeningBrace' );
        if (node.parent.type !== 'CallExpression') {
            _ws.aroundIfNeeded( node.endToken, 'FunctionExpressionClosingBrace' );
        } else {
            _ws.beforeIfNeeded( node.endToken, 'FunctionExpressionClosingBrace' );
        }

        _br.aroundIfNeeded( node.body.startToken, 'FunctionExpressionOpeningBrace' );
        _br.aroundIfNeeded( node.endToken, 'FunctionExpressionClosingBrace' );
        _indent.ifNeeded(node.body.endToken, node.closingIndentLevel);
    }
};



exports.BinaryExpression = function(node){
    _tk.removeInBetween(node.startToken, node.endToken, ['LineBreak', 'Indent']);
    var operator = _tk.findNext(node.left.endToken, node.operator);
    _ws.aroundIfNeeded(operator, 'BinaryExpressionOperator');
    addSpaceInsideExpressionParentheses(node);
};



exports.CallExpression = exports.NewExpression = function(node){
    function checkBefore(type) {
        return args[0].type === type && !_ws.needsBefore('ArgumentList' + type);
    }
    function checkAfter(type) {
        return args[args.length - 1].type === type && !_ws.needsAfter('ArgumentList' + type);
    }
    var args = node['arguments'];
    if ( args.length ) {
        if (!checkBefore('FunctionExpression') && !checkBefore('ObjectExpression') && !checkBefore('ArrayExpression')) {
            _ws.beforeIfNeeded(args[0].startToken, 'ArgumentList');
        }
        args.forEach(function(arg){
            var next = _tk.findNextNonEmpty(arg.endToken);
            if (next && next.value === ',') {
                _tk.removeEmptyInBetween(arg.endToken, _tk.findNextNonEmpty(next));
                _ws.aroundIfNeeded(next, 'ArgumentComma');
            } else {
                _tk.removeEmptyInBetween(arg.endToken, next);
            }
        });
        if (!checkAfter('FunctionExpression') && !checkAfter('ObjectExpression') && !checkAfter('ArrayExpression')) {
            _ws.afterIfNeeded(args[args.length - 1].endToken, 'ArgumentList');
        }
    }
};



exports.MemberExpression = function(node){
    // indent chained calls that are on separate lines
    if (node.parent.type === 'CallExpression'){
        var comma = _tk.findPrevNonEmpty(node.property.startToken);
        // check comma value to ignore key[obj] also ignore same line
        if (comma.value === '.'){
            _tk.removeAdjacentBefore(comma, 'Indent');
            if (_tk.isBr(comma.prev) ) {
                // indent level should be based on ExpressionStatement since
                // CallExpression and MemberExpression ignore the indent
                var baseIndentNode = _ast.getClosest(node, 'ExpressionStatement');
                var indentLevel = _indent.getLevel(baseIndentNode);
                // they should at least line up with ExpressionStatement if indent
                // is disabled
                if (_indent.shouldIndentType('ChainedMemberExpression')) {
                    indentLevel += 1;
                }
                _indent.before(comma, indentLevel);
            }
        }
    }
    var opening = _tk.findPrev(node.property.startToken, "["),
        closing = _tk.findNext(node.property.endToken, "]");
    if (opening && closing) {
        _ws.afterIfNeeded(opening, "MemberExpressionOpening");
        _ws.beforeIfNeeded(closing, "MemberExpressionClosing");
    }
};


exports.ExpressionStatement = function(node){
    // bypass IIFE
    if (node.expression.type !== 'CallExpression' || node.expression.callee.type !== 'FunctionExpression') {
        addSpaceInsideExpressionParentheses(node);
    }
};


function addSpaceInsideExpressionParentheses(node){
    var opening = node.startToken;
    var closing = node.endToken;

    if (node.type === 'BinaryExpression' || opening.value !== '(') {
        var prev = _tk.findPrevNonEmpty(opening);
        opening = prev && _tk.isExpressionOpening(prev)? prev : null;
    }

    if (opening && (node.type === 'BinaryExpression' || closing.value !== ')')) {
        var possible = closing.value === ';' || closing.type === 'LineBreak'?
            _tk.findPrevNonEmpty(closing) : _tk.findNextNonEmpty(closing);
        closing = possible && possible.value === ')'? possible : null;
    }

    if (!opening || !closing){
        return;
    }

    _ws.afterIfNeeded(opening, 'ExpressionOpeningParentheses');
    _ws.beforeIfNeeded(closing, 'ExpressionClosingParentheses');
}



exports.Literal = function(node){
    addSpaceInsideExpressionParentheses(node);
};



exports.ObjectExpression = function(node){
    if (! node.properties.length) return;

    // TODO: improve this, there are probably more edge cases
    var shouldBeSingleLine = node.parent.type === 'ForInStatement';

    if (! shouldBeSingleLine) {
        _br.aroundIfNeeded(node.startToken, 'ObjectExpressionOpeningBrace');
    } else {
        _tk.removeEmptyInBetween(node.startToken, node.endToken);
    }

    node.properties.forEach(function(prop){
        if (! shouldBeSingleLine) {
            _br.beforeIfNeeded(prop.startToken, 'Property');
        }
        var token = prop.endToken.next;
        while (token && token.value !== ',' && token.value !== '}') {
            // TODO: toggle behavior if comma-first
            if (token.type === 'LineBreak') {
                _tk.remove(token);
            }
            token = token.next;
        }

        if (shouldBeSingleLine && prop.key.startToken.prev.value !== '{') {
            _ws.beforeIfNeeded(prop.key.startToken, 'Property');
        }
        _ws.afterIfNeeded(prop.key.endToken, 'PropertyName');
        _ws.beforeIfNeeded(prop.value.startToken, 'PropertyValue');
        if (! shouldBeSingleLine) {
            _br.afterIfNeeded(prop.endToken, 'Property');
        }
    });

    if (! shouldBeSingleLine) {
        _tk.removeEmptyAdjacentBefore(node.endToken);
        _br.aroundIfNeeded(node.endToken, 'ObjectExpressionClosingBrace');
        _indent.before(node.endToken, node.closingIndentLevel);
    }
};



exports.VariableDeclaration = function(node){
    var shouldIndent = node.parent.type !== 'ForStatement';
    var indentLevel = node.indentLevel + 1;

    if (! shouldIndent) {
        _tk.removeEmptyInBetween(node.startToken, node.endToken);
    }

    _tk.removeInBetween(node.startToken, node.declarations[0].startToken, ['WhiteSpace', 'Indent']);

    node.declarations.forEach(function(declarator, i){
        var idStartToken = declarator.id.startToken;

        // need to swap comma-first line break
        var prevNonEmpty = _tk.findPrevNonEmpty(idStartToken);
        if (i && prevNonEmpty.value === ',') {
            _tk.removeAdjacentBefore(prevNonEmpty, 'Indent');
            if ( _tk.isBr(prevNonEmpty.prev) ) {
                var beforeComma = _tk.findPrev(prevNonEmpty, function(t){
                    return !_tk.isEmpty(t) && !_tk.isComment(t);
                });
                _tk.remove(prevNonEmpty);
                _tk.after(beforeComma, prevNonEmpty);
            }
        }

        if (! i && ! _tk.isComment(_tk.findPrevNonEmpty(idStartToken)) ) {
            _tk.removeEmptyAdjacentBefore(idStartToken);
        } else if (shouldIndent) {
            // allow declarations without init on a single line
            if (declarator.init || _br.needsBefore('VariableDeclarationWithoutInit')) {
                _br.beforeIfNeeded(idStartToken, 'VariableName');
                _indent.before(idStartToken, indentLevel);
            } else {
                _ws.beforeIfNeeded(idStartToken, 'VariableName');
            }
        } else {
            _ws.beforeIfNeeded(idStartToken, 'VariableName');
        }

        if (declarator.init) {
            _ws.afterIfNeeded(declarator.id.endToken, 'VariableName');
            var equalSign = _tk.findNext(declarator.id.endToken, '=');
            var valueStart = _tk.findNextNonEmpty(equalSign);
            _tk.removeEmptyAdjacentBefore(valueStart);
            _br.beforeIfNeeded(valueStart, 'VariableValue');
            _ws.beforeIfNeeded(valueStart, 'VariableValue');
        }
    });

    _tk.eachInBetween(node.startToken, node.endToken, function(token){
        // ASI messes with endToken + comments since comment isn't considered
        // a node "terminator"
        if (_tk.isComment(token) &&
            (token.next !== node.endToken || ! _tk.isBr(node.endToken))) {
            _indent.before(token, indentLevel);
        }
    });

    _ws.afterIfNeeded(node.startToken);
};


exports.AssignmentExpression = function(node){
    // can't use node.right.startToken since it might be surrounded by
    // a parenthesis (see #5)
    var operator = _tk.findNext(node.left.endToken, node.operator);
    _tk.removeEmptyInBetween(node.left.endToken, _tk.findNextNonEmpty(operator));
    _ws.aroundIfNeeded(operator, 'AssignmentOperator');
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
            _tk.removeEmptyInBetween(prev, node.startToken);
            node.startToken = prev;
            shouldRevert = true;
        }
        var next = _tk.findNextNonEmpty(node.right.endToken);
        if ( next && next.value === ')') {
            _tk.removeEmptyInBetween(node.endToken, next);
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
    addSpaceInsideExpressionParentheses(node);
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
        _brws.aroundIfNeeded(bodyStart, 'WhileStatementOpeningBrace');
        _brws.aroundIfNeeded(bodyEnd, 'WhileStatementClosingBrace');
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

    _tk.removeEmptyInBetween(node.startToken, expressionStart);
    _tk.removeInBetween(expressionStart, expressionEnd, 'LineBreak');

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
        _brws.aroundIfNeeded(bodyStart, 'ForStatementOpeningBrace');
        _brws.aroundIfNeeded(bodyEnd, 'ForStatementClosingBrace');
        _indent.before(bodyEnd, node.indentLevel);
        _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
    }
    else if (expressionEnd.next && expressionEnd.next.value !== ';') {
        _ws.afterIfNeeded(expressionEnd, 'ForStatementExpression');
    }
};


exports.ForInStatement = function(node){
    var expressionStart = _tk.findNext(node.startToken, '(');
    var expressionEnd = _tk.findPrev(node.body.startToken, ')');

    _tk.removeInBetween(node.startToken, expressionEnd, 'LineBreak');
    _tk.removeInBetween(node.startToken, expressionEnd, 'Indent');
    _ws.aroundIfNeeded(expressionStart, 'ForInStatementExpressionOpening');
    _ws.aroundIfNeeded(expressionEnd, 'ForInStatementExpressionClosing');

    if (node.body.type === 'BlockStatement' && node.body.body.length) {
        var bodyStart = node.body.startToken;
        var bodyEnd = node.body.endToken;
        _tk.removeAdjacentBefore(bodyStart, 'LineBreak');
        _tk.removeAdjacentAfter(bodyStart, 'WhiteSpace');
        _brws.aroundIfNeeded(bodyStart, 'ForInStatementOpeningBrace');
        _brws.aroundIfNeeded(bodyEnd, 'ForInStatementClosingBrace');
        _indent.before(bodyEnd, node.indentLevel);
        _ws.afterIfNeeded(expressionEnd, 'ForInStatementExpression');
    }
    else if (expressionEnd.next && expressionEnd.next.value !== ';') {
        _ws.afterIfNeeded(expressionEnd, 'ForInStatementExpression');
    }

    _tk.removeEmptyInBetween(node.left.endToken, node.right.startToken);
    _ws.afterIfNeeded(node.left.endToken);
    _ws.beforeIfNeeded(node.right.startToken);
};



exports.IfStatement = function(node){

    var startBody = node.consequent.startToken;
    var endBody = node.consequent.endToken;

    var conditionalStart = _tk.findPrev(node.test.startToken, '(');
    var conditionalEnd = _tk.findNext(node.test.endToken, ')');

    _tk.removeEmptyInBetween(node.startToken, conditionalStart);
    _tk.removeEmptyInBetween(conditionalEnd, startBody);

    _ws.aroundIfNeeded(conditionalStart, 'IfStatementConditionalOpening');
    _ws.aroundIfNeeded(conditionalEnd, 'IfStatementConditionalClosing');

    var alt = node.alternate;
    if (alt) {
        var elseKeyword = _tk.findPrev(alt.startToken, 'else');
        var startEmptyRemove = _tk.findPrevNonEmpty(elseKeyword);
        if ( !(startEmptyRemove.type === 'Punctuator' && startEmptyRemove.value === '}')){
            startEmptyRemove = elseKeyword;
        }
        _tk.removeEmptyInBetween(startEmptyRemove, alt.startToken);

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
            _brws.aroundIfNeeded(alt.startToken, 'ElseStatementOpeningBrace');

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
        _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(endBody), endBody);

        _brws.aroundIfNeeded(startBody, 'IfStatementOpeningBrace');
        if (! alt) {
            _br.aroundIfNeeded(endBody, 'IfStatementClosingBrace');
        } else {
            _br.beforeIfNeeded(endBody, 'IfStatementClosingBrace');
        }
        _indent.ifNeeded(startBody, node.indentLevel);
        _indent.ifNeeded(endBody, node.indentLevel);
        _ws.aroundIfNeeded(endBody, 'IfStatementClosingBrace');
    }

    // add indentation on if statements containing break lines
    var breakLineIndent = node.indentLevel+1;
    _indent.inBetween(conditionalStart, conditionalEnd, breakLineIndent);

};



exports.ReturnStatement = function(node) {
    // need to make sure we only remove line breaks inside the node itself
    // because of ASI (see #29)
    var nonEmpty = _tk.findInBetween(node.startToken.next, node.endToken, _tk.isNotEmpty);
    if (nonEmpty) _tk.removeEmptyInBetween(node.startToken, nonEmpty);

    _ws.afterIfNeeded(node.startToken);
    if ( _tk.isSemiColon(node.endToken) ) {
        _tk.removeEmptyInBetween(_tk.findPrevNonEmpty(node.endToken), node.endToken);
    }
};



exports.ConditionalExpression = function(node){
    // we need to grab the actual punctuators since parenthesis aren't counted
    // as part of test/consequent/alternate
    var questionMark = _tk.findNext(node.test.endToken, '?');
    var colon = _tk.findNext(node.consequent.endToken, ':');

    _tk.removeInBetween(node.test.endToken, _tk.findNextNonEmpty(questionMark), _tk.isWs);
    _tk.removeInBetween(node.consequent.endToken, _tk.findNextNonEmpty(colon), _tk.isWs);

    _ws.beforeIfNeeded(questionMark, _ws.needsAfter('ConditionalExpressionTest'));
    _ws.afterIfNeeded(questionMark, _ws.needsBefore('ConditionalExpressionConsequent'));
    _ws.beforeIfNeeded(colon, _ws.needsAfter('ConditionalExpressionConsequent'));
    _ws.afterIfNeeded(colon, _ws.needsBefore('ConditionalExpressionAlternate'));

    var indentLevel = _indent.getLevelLoose(node) + 1;
    // find first token of each, since startToken might be after parenthesis, as above
    _indent.ifNeeded(_tk.findPrev(node.consequent.startToken, _tk.isEmpty).next, indentLevel);
    _indent.ifNeeded(_tk.findPrev(node.alternate.startToken, _tk.isEmpty).next, indentLevel);
};


exports.UnaryExpression = function(node){
    if (node.operator === 'delete') {
        _tk.removeEmptyInBetween(node.startToken, _tk.findNextNonEmpty(node.startToken));
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
        _brws.aroundIfNeeded(node.body.startToken, 'DoWhileStatementOpeningBrace');
        _brws.aroundIfNeeded(node.body.endToken, 'DoWhileStatementClosingBrace');
    } else {
        _ws.afterIfNeeded(node.startToken);
    }
    var whileKeyword = _tk.findPrev(node.test.startToken, 'while');
    _ws.aroundIfNeeded(whileKeyword);
};


exports.ArrayExpression = function(node){
    if (node.elements.length) {
        _ws.aroundIfNeeded(node.startToken, 'ArrayExpressionOpening');
        _ws.aroundIfNeeded(node.endToken, 'ArrayExpressionClosing');
        node.elements.forEach(function(el){
            var next = _tk.findNextNonEmpty(el.endToken);
            if (next.value === ',') {
                _ws.aroundIfNeeded(next, 'ArrayExpressionComma');
            }
        });
    } else {
        _tk.removeEmptyInBetween(node.startToken, node.endToken);
    }

    // add indentation inside arrays containing break lines
    indentArrayContent(node);

};


function indentArrayContent(node) {
    var indentLevel = node.indentLevel;

    var token = node.startToken;
    while (token && token !== node.endToken) {
        if ( _tk.isIndent(token.next) ) {
            _tk.remove(token.next);
        }
        if (token.type === 'Punctuator' && token.value === ']') {
            indentLevel -= 1;
        }
        if (_tk.isBr(token.prev) &&
            token.type !== 'LineComment') {
            _indent.before(token, indentLevel);
        }
        if (token.type === 'Punctuator' && token.value === '[') {
            indentLevel += 1;
        }
        token = token.next;
    }
}


exports.TryStatement = function(node){
    // do it backwards since it's easier to handle
    var finalizer = node.finalizer;
    if (finalizer) {
        _tk.removeEmptyInBetween(_tk.findPrev(finalizer.startToken, '}'),
                                finalizer.startToken);

        _ws.aroundIfNeeded(finalizer.startToken, 'FinallyOpeningBrace');
        _ws.aroundIfNeeded(finalizer.endToken, 'FinallyClosingBrace');

        // only break lines if body is not empty
        if (finalizer.body.length) {
            _br.aroundIfNeeded(finalizer.startToken, 'FinallyOpeningBrace');
            _br.aroundIfNeeded(finalizer.endToken, 'FinallyClosingBrace');
            // indent finally closing brace when there is a body
            _indent.before(finalizer.endToken, node.closingIndentLevel);
        } else {
            _tk.removeEmptyInBetween(finalizer.startToken, finalizer.endToken);
        }
    }

    node.handlers.forEach(function(handler){
        _ws.aroundIfNeeded(handler.body.startToken, 'CatchOpeningBrace');
        _ws.aroundIfNeeded(handler.body.endToken, 'CatchClosingBrace');
        // only break lines if body is not empty
        if (handler.body.body.length) {
            _br.aroundIfNeeded(handler.body.startToken, 'CatchOpeningBrace');
            _br.aroundIfNeeded(handler.body.endToken, 'CatchClosingBrace');

            // indent catch closing brace when there is a body
            _indent.before(handler.body.endToken, node.closingIndentLevel);
        } else {
            _tk.removeEmptyInBetween(handler.body.startToken,
                                    handler.body.endToken);
        }
    });

    _tk.removeEmptyInBetween(node.startToken, node.block.startToken);
    _brws.aroundIfNeeded(node.block.startToken, 'TryOpeningBrace');
    _brws.aroundIfNeeded(node.block.endToken, 'TryClosingBrace');
    _indent.before(node.block.endToken, node.closingIndentLevel);
};


exports.CatchClause = function(node){
    var opening = _tk.findPrev(node.param.startToken, '(');
    _ws.beforeIfNeeded( opening, 'CatchParameterList' );
    var closing = _tk.findNext(node.param.endToken, ')');
    _ws.afterIfNeeded( closing, 'CatchParameterList' );
};


