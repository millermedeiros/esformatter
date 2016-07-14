//jshint node:true
/*global describe, it, afterEach*/
"use strict";

var expect = require('chai').expect;
var esformatter = require('../lib/esformatter');


describe('API', function() {

  afterEach(function() {
    // clean up plugins to avoid undesired side effects
    esformatter.unregisterAll();
  });

  describe('exposed API', function() {
    // plugins might need to access some internal methods from esformatter
    // so we check if these methods are really available
    var limit = require('../lib/limit');
    var options = require('../lib/options');

    it('shoud expose useful methods to plugin authors', function() {
      // we don't need to check implementation here since these methods are
      // used internally
      expect(limit.before).to.be.a('function');
      expect(limit.after).to.be.a('function');
      expect(limit.around).to.be.a('function');
      expect(options.set).to.be.a('function');
      expect(options.get).to.be.a('function');
      expect(options.getRc).to.be.a('function');
      expect(options.loadAndParseConfig).to.be.a('function');
      expect(esformatter.diff.chars).to.be.a('function');
      expect(esformatter.hooks.FunctionExpression.format).to.be.a('function');
      expect(esformatter.format).to.be.a('function');
      expect(esformatter.transform).to.be.a('function');
      expect(esformatter.rc).to.be.a('function');
      expect(esformatter.register).to.be.a('function');
      expect(esformatter.unregister).to.be.a('function');
      expect(esformatter.unregisterAll).to.be.a('function');
    });
  });

  describe('esformatter.rc', function() {
    // PS: CLI is already testing this method indirectly, we are only checking
    // for edge cases for now

    it('should return custom options if root == true', function() {
      expect(
        esformatter.rc(null, {
          root: true
        })
      ).to.be.eql({
        root: true
      });
    });

    it('should return custom options if preset', function() {
      expect(
        esformatter.rc(null, {
          preset: 'default'
        })
      ).to.be.eql({
        preset: 'default'
      });
    });

    it('should merge the custom option', function() {
      var customOpts = {
        whiteSpace: {
          before: {
            "ArrayExpressionClosing": 1
          },
          after: {
            "ArrayExpressionOpening": 1
          }
        }
      };
      var result = esformatter.rc('test/compare/rc/top-in.js', customOpts);
      expect(result.whiteSpace.before.FunctionDeclarationOpeningBrace).to.be.eql(0);
      expect(result.whiteSpace.before.ArrayExpressionClosing).to.be.eql(1);
      expect(result.whiteSpace.after.ArrayExpressionOpening).to.be.eql(1);
    });

    it('should merge rcs from parent folder', function() {
      var result = esformatter.rc('test/compare/rc/nested/nested-in.js');
      expect(result.indent.value).to.be.eql('\t');
      expect(result.whiteSpace.before.FunctionDeclarationOpeningBrace).to.be.eql(0);
    });

    it('should merge .esformatter and package.json files', function() {
      var result = esformatter.rc('test/compare/rc/package/nested/pkg_nested-in.js');
      expect(result.indent.value).to.be.eql('\t');
      expect(result.lineBreak.before.FunctionDeclarationOpeningBrace).to.be.eql(1);
      expect(result.lineBreak.before.FunctionDeclarationClosingBrace).to.be.eql(0);
    });

    it('should load presets from node modules + merge with user settings', function() {
      var result = esformatter.rc(null, {
        'extends': [
          'preset:fake-2',
          './test/compare/rc/.esformatter'
        ],
        indent: {
          value: '>>'
        }
      });

      expect(result.root).to.be.eql(true);
      expect(result.indent.value).to.be.eql('>>');
      expect(result.indent.FunctionDeclaration).to.be.eql(2);
      expect(result.indent.FunctionExpression).to.be.eql(42);
      expect(result.whiteSpace.before.FunctionDeclarationOpeningBrace).to.be.eql(0);
      expect(result.plugins).to.have.lengthOf(1);
    });
  });
});
