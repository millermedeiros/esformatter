"use strict";


// simplify line break and white space insertion around same token


function makeHelper(name) {
  return function() {
    _br[name].apply(this, arguments);
    _ws[name].apply(this, arguments);
  };
}


// ---


exports.aroundIfNeeded = makeHelper('aroundIfNeeded');




