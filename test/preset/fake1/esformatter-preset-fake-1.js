"use strict";

// IMPORTANT: run `npm rm esformatter-preset-fake-1 && npm i test/preset/fake1`
// every time you update this file!

module.exports = {
  plugins: [
    require('esformatter-test-plugin')
  ],
  indent: {
    FunctionExpression: 42
  }
};
