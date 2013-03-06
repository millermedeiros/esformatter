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


exports.getClosest = function(node, type){
    var result;
    var parent;
    while (parent = node.parent) {
        if (parent.type === type) {
            result = parent;
            break;
        }
        node = parent;
    }
    return result;
};

