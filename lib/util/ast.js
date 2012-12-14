"use strict";

// helpers for dealing with the AST itself


// ---


exports.getNodeKey = getNodeKey;
function getNodeKey(node) {
    var result;
    if (node.parent) {
         for (var key in node.parent) {
            if (node.parent[key] === node) {
                result = key;
                break;
            }
        }
    }
    return result;
}

