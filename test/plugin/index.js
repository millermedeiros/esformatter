"use strict";

// IMPORTANT: run `npm rm esformatter-test-plugin && npm i` every time you
// update this file!
exports.tokenBefore = function(token) {
  if (token.value === 'true') {
    token.value = 'false';
  }
};
