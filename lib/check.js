'use strict';

var format = require('./format');
var disparity = require('disparity');

// ---

exports.chars = chars;
exports.unified = unified;
exports.unifiedNoColor = unifiedNoColor;

// these headers makes more sense in this context
disparity.added = 'expected';
disparity.removed = 'actual';

// ---

function chars(str, opts, fileName) {
  return exec('chars', str, opts, fileName);
}

function unified(str, opts, fileName) {
  return exec('unified', str, opts, fileName);
}

function unifiedNoColor(str, opts, fileName) {
  return exec('unifiedNoColor', str, opts, fileName);
}

function exec(method, str, formatOpts, fileName) {
  var formatted = format(str, formatOpts);
  var file = fileName;
  if (method === 'chars') {
    // disparity.chars receive an object as third argument
    // TODO: change disparity methods so they have same signature
    fileName = null;
  }
  var result = disparity[method](str, formatted, fileName);
  return result ? header(file, method) + result : result;
}

var hr = '================================================================================';

function header(file, method) {
  // unified already contains the +++ --- headers at each file
  if (!file || method !== 'chars') {
    return '';
  }
  return cyan(file) + '\n' + cyan(hr) + '\n';
}

function cyan(str) {
  return '\u001b[36m' + str + '\u001b[39m';
}
