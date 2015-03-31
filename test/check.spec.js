/*jshint node:true*/
/*global describe:false, it:false*/
'use strict';

var expect = require('chai').expect;
var esformatter = require('../lib/esformatter');

describe('esformatter.check', function() {

  describe('check.chars()', function() {
    it('should return empty string if formatted properly', function() {
      var code = 'var foo = "bar"';
      expect(esformatter.check.chars(code)).to.equal('');
    });

    it('should return differences if not following style', function() {
      var code = 'var foo="bar"';
      var result = esformatter.check.chars(code);
      expect(result).to.equal([
        '\u001b[41mactual\u001b[49m \u001b[42mexpected\u001b[49m',
        '',
        '1 | var foo\u001b[42m \u001b[49m=\u001b[42m \u001b[49m"bar"'
      ].join('\n'));
    });
  });

  describe('check.unified()', function() {
    it('should return empty string if formatted properly', function() {
      var code = 'var foo = "bar"';
      expect(esformatter.check.unified(code)).to.equal('');
    });

    it('should return differences if not following style', function() {
      var code = 'var foo="bar"\n';
      var result = esformatter.check.unified(code);
      expect(result).to.equal([
        '\u001b[33m--- actual\u001b[39m',
        '\u001b[33m+++ expected\u001b[39m',
        '\u001b[35m@@ -1,1 +1,1 @@\u001b[39m',
        '\u001b[32m+var foo = "bar"\u001b[39m',
        '\u001b[31m-var foo="bar"\u001b[39m\n'
      ].join('\n'));
    });
  });

  describe('check.unifiedNoColor()', function() {
    it('should return empty string if formatted properly', function() {
      var code = 'var foo = "bar"';
      expect(esformatter.check.unifiedNoColor(code)).to.equal('');
    });

    it('should return differences if not following style', function() {
      var code = 'var foo="bar"\n';
      var result = esformatter.check.unifiedNoColor(code);
      expect(result).to.equal([
        '--- actual',
        '+++ expected',
        '@@ -1,1 +1,1 @@',
        '+var foo = "bar"',
        '-var foo="bar"\n'
      ].join('\n'));
    });
  });
});
