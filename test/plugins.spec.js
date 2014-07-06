//jshint node:true
/*global describe, it, before, after*/
"use strict";

var expect = require('chai').expect;
var mockery = require('mockery');
var esformatter = require('../lib/esformatter');

var input = 'var foo=lorem?"bar":"baz";';
var output = 'var foo = lorem ? "bar" : "baz";';


describe('plugin API', function() {

  describe('> register plugin', function() {
    var plugin;

    before(function() {
      plugin = makePlugin();
      esformatter.register(plugin);
      esformatter.format(input);
    });

    after(function() {
      esformatter.unregister(plugin);
    });

    it('should call setOptions', function() {
      expect(plugin.setOptions.count).to.eql(1);
      expect(plugin.setOptions.args[0].indent.value).to.eql('  ');
    });

    it('should call tokenBefore for each token', function() {
      expect(plugin.tokenBefore.count).to.eql(10);
      expect(plugin.tokenBefore.args.length).to.eql(10);
      expect(plugin.tokenBefore.args[0].value).to.eql('var');
      expect(plugin.tokenBefore.args[4].value).to.eql('lorem');
    });

    it('should call tokenAfter for each token', function() {
      expect(plugin.tokenAfter.count).to.eql(16);
      expect(plugin.tokenAfter.args.length).to.eql(16);
      expect(plugin.tokenAfter.args[0].value).to.eql('var');
      expect(plugin.tokenAfter.args[6].value).to.eql('lorem');
    });

    it('should call stringBefore at the begining of process', function() {
      expect(plugin.stringBefore.count).to.eql(1);
      expect(plugin.stringBefore.args).to.eql([input]);
    });

    it('should call stringAfter at end of process', function() {
      expect(plugin.stringAfter.count).to.eql(1);
      expect(plugin.stringAfter.args).to.eql([output]);
    });

    it('should call nodeBefore for each node', function() {
      expect(plugin.nodeBefore.count).to.eql(8);
      expect(plugin.nodeBefore.args[3].toString()).to.eql('foo');
    });

    it('should call nodeAfter for each node', function() {
      expect(plugin.nodeAfter.count).to.eql(8);
      expect(plugin.nodeAfter.args[3].toString()).to.eql('foo');
    });

    it('should call transformBefore once', function() {
      expect(plugin.transformBefore.count).to.eql(1);
      expect(plugin.transformBefore.args[0].type).to.eql('Program');
    });

    it('should call transformAfter once', function() {
      expect(plugin.transformAfter.count).to.eql(1);
      expect(plugin.transformAfter.args[0].type).to.eql('Program');
    });

  });

  describe('> load from node_modules', function() {
    var plugin1;
    var plugin2;

    before(function() {
      plugin1 = makePlugin();
      // this shuold be enough to ensure plugin methods are optional and that
      // multiple plugins are executed in a row.
      plugin2 = {
        // "transform" was deprecated on v0.4 but we still have a test for it
        // to make sure we are backwards compatible.
        transform: stub()
      };
      mockery.registerMock('esformatter-foo', plugin1);
      mockery.registerMock('bar', plugin2);
      mockery.enable();

      esformatter.format(input, {
        plugins: ['esformatter-foo', 'bar']
      });
    });

    after(function() {
      mockery.disable();
    });

    it('should load plugins from node_modules and register it', function() {
      expect(plugin1.transformBefore.count).to.eql(1);
      expect(plugin1.transformAfter.count).to.eql(1);
      expect(plugin1.nodeAfter.count).to.eql(8);
      expect(plugin2.transform.count).to.eql(1);
    });

  });
});


// extremely basic stub method, I know I could have used something more
// complex like sinon, but this is good enough for now
function stub(isIdentity) {
  var fn = function() {
    fn.count += 1;
    fn.args.push.apply(fn.args, arguments);
    if (isIdentity) {
      return arguments[0];
    }
  };

  fn.count = 0;
  fn.args = [];

  return fn;
}


function makePlugin() {
  return {
    setOptions: stub(),
    stringBefore: stub(true),
    stringAfter: stub(true),
    tokenBefore: stub(),
    tokenAfter: stub(),
    nodeBefore: stub(),
    nodeAfter: stub(),
    transformAfter: stub(),
    transformBefore: stub()
  };
}
