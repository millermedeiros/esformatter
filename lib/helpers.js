"use strict";

exports.shouldIndentChild = shouldIndentChild;
function shouldIndentChild(parent, child, opts) {
  // this will avoid indenting objects/arrays/functions twice if they
  // are on the right of a BinaryExpression, LogicalExpression or
  // UnaryExpression
  if (!child || !opts[parent.type + '.' + child.type]) {
    return false;
  }

  return !child.right || !opts[child.right.type];
}
