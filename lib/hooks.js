"use strict";


// Hooks for each node.type that should be processed individually
// ---
// using an object to store each transform method to avoid a long switch
// statement, will be more organized in the long run and also allow
// monkey-patching/spies/mock/stub.


// ---


// XXX: yeah, globals are ugly but really useful in this case.. specially since
// we have dozens of hooks and they basically require the same helpers.
// maybe we will replace this logic later and include individual `require()`
// calls inside each hook file.
global._ast = require('./util/ast');
global._tk = require('./util/token');
global._ws = require('./util/whiteSpace');
global._br = require('./util/lineBreak');
global._indent = require('./util/indent');
global._brws = require('./util/insert');

// ---


exports.ArrayExpression = require('./hooks/ArrayExpression');
exports.AssignmentExpression = require('./hooks/AssignmentExpression');
exports.BinaryExpression = require('./hooks/BinaryExpression');
exports.CallExpression = exports.NewExpression = require('./hooks/CallExpression');
exports.CatchClause = require('./hooks/CatchClause');
exports.ConditionalExpression = require('./hooks/ConditionalExpression');
exports.DoWhileStatement = require('./hooks/DoWhileStatement');
exports.ExpressionStatement = require('./hooks/ExpressionStatement');
exports.ForInStatement = require('./hooks/ForInStatement');
exports.ForStatement = require('./hooks/ForStatement');
exports.FunctionDeclaration = require('./hooks/FunctionDeclaration');
exports.FunctionExpression = require('./hooks/FunctionExpression');
exports.IfStatement = require('./hooks/IfStatement');
exports.Literal = require('./hooks/Literal');
exports.LogicalExpression = require('./hooks/LogicalExpression');
exports.MemberExpression = require('./hooks/MemberExpression');
exports.ObjectExpression = require('./hooks/ObjectExpression');
exports.Params = require('./hooks/Params');
exports.ReturnStatement = require('./hooks/ReturnStatement');
exports.SequenceExpression = require('./hooks/SequenceExpression');
exports.SwitchStatement = require('./hooks/SwitchStatement');
exports.TryStatement = require('./hooks/TryStatement');
exports.UnaryExpression = require('./hooks/UnaryExpression');
exports.VariableDeclaration = require('./hooks/VariableDeclaration');
exports.WhileStatement = require('./hooks/WhileStatement');



