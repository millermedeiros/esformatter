'use strict';

// this logic is shared with ExportSpecifier

var _br = require('rocambole-linebreak');
var _tk = require('rocambole-token');
var _ws = require('rocambole-whitespace');
var limit = require('../limit');

exports.format = function(node) {
  var braceStart = _tk.findPrev(node.startToken, _tk.isCode);
  var braceEnd = _tk.findNext(node.endToken, _tk.isCode);

  // handle `import foo, { lorem, ipsum } from 'lib';`
  if (braceStart.value === '{') {
    limit.around(braceStart, 'ModuleSpecifierOpeningBrace');
  } else if (braceStart.value === ',') {
    limit.around(braceStart, 'ModuleSpecifierComma');
  }

  if (braceEnd.value === ',') {
    limit.around(braceEnd, 'ModuleSpecifierComma');
  } else if (braceEnd.value === '}') {
    limit.before(braceEnd, 'ModuleSpecifierClosingBrace');

    var next = _tk.findNextNonEmpty(braceEnd);
    if (next && next.value === ';') {
      // handle `export {foo, bar};`
      _br.limitAfter(braceEnd, 0);
    } else if (node.parent.endToken !== braceEnd) {
      // we don't want to limit line break for lines that contains just
      // `export {foo, bar}` because that would remove undesired line breaks
      limit.after(braceEnd, 'ModuleSpecifierClosingBrace');
    }
  }

  if (node.startToken.value !== node.endToken.value) {
    // handle spaces around "as"
    // eg: `import { named1 as myNamed1 } from 'lib'`
    // eg: `import * as myLib from 'lib'`
    _br.limitAfter(node.startToken, 0);
    _br.limitBefore(node.endToken, 0);
    _ws.limitAfter(node.startToken, 1);
    _ws.limitBefore(node.endToken, 1);
  }
};
