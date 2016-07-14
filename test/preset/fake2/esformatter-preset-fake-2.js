"use strict";

// IMPORTANT: run `npm rm esformatter-preset-fake-2 && npm i test/preset/fake2`
// every time you update this file!

module.exports = {
  extends: [
    require('esformatter-preset-fake-1')
  ],
  indent: {
    FunctionDeclaration: 2
  }
};
