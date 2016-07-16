/*jshint node:true*/
/*global describe:false, it:false, beforeEach:false, afterEach: false*/
'use strict';

var cli = require('../lib/cli');
var plugins = require('../lib/plugins');
var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('./helpers');

// ---

var readOut = helpers.readOut;

function comparePath(filePath) {
  return path.join(__dirname, 'compare', filePath);
}

// ---

describe('Command line interface', function() {

  /**
   * Spawn a child process calling the bin file with the specified options
   * @param {String} options Same as you would pass in the command line
   * @param {String} input Standard input
   * @param {Function} testCallback It receives the formatted file
   */
  var spawnEsformatter = function(id, options, input, testCallback) {
    var args = [path.join(__dirname, '../bin/esformatter')];
    if (typeof options === 'function') {
      testCallback = options;
      options = null;
    } else if (typeof input === 'function') {
      testCallback = input;
      input = null;
    }
    if (options) {
      args = args.concat(options.split(' '));
    }
    it('[cli ' + id + '] ' + options, function(mochaCallback) {
      var childprocess = spawn('node', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      var output = '';
      var errorInChildProcess = '';
      childprocess.stdout.on('data', function(data) {
        output += data.toString();
      });
      childprocess.stderr.on('data', function(data) {
        errorInChildProcess += data.toString();
      });
      childprocess.on('exit', function() {
        if (errorInChildProcess) {
          testCallback(new Error(errorInChildProcess));
          // we don't check for the error directly because sometimes we want
          // to test if the error is what we expect
          mochaCallback();
        } else {
          try {
            // There is an extra line feed from piping stdout
            testCallback(helpers.lineFeed(output));
            mochaCallback();
          } catch (ex) {
            mochaCallback(ex);
          }
        }
      });
      if (input) {
        try {
          var textInput = fs.readFileSync(input, 'utf-8');
          childprocess.stdin.write(textInput);
          childprocess.stdin.end();
        } catch (ex) {
          mochaCallback(ex);
        }
      }
    });
  };

  // this is much faster than spawning a childprocess, so we favor it when
  // possible (stdin tests still use the spawnEsformatter for now)
  function testCLI(id, options, testCallback) {
    it('[cli ' + id + '] ' + options.join(' '), function(mochaCallback) {

      var errors;
      var data;

      function mockCLI() {
        errors = '';
        data = '';

        cli.stdout = {
          write: function(msg) {
            data += msg;
          }
        };
        cli.stderr = {
          write: function(msg) {
            errors += msg;
          }
        };
      }

      function unmockCLI() {
        cli.stdout = process.stdout;
        cli.stderr = process.stderr;
        // otherwise registered plugins would persist between runs
        plugins.unregisterAll();
      }

      try {

        mockCLI();
        cli.run(cli.parse(options));
        unmockCLI();

        if (cli.exitCode) {
          testCallback(new Error(errors));
        } else {
          testCallback(data);
        }

        mochaCallback();
      } catch (err) {
        unmockCLI();
        mochaCallback(err);
      }
    });
  }

  // Format a file with default options
  testCLI(
    'default',
    ['--preset=default', comparePath('default/array_expression-in.js')],
    function(result) {
      expect(result).to.equal(readOut('/default/array_expression'));
    }
  );

  // Format a file specifying some options
  testCLI(
    'config',
    [
      '--config',
      comparePath('custom/basic_function_indent-config.json'),
      comparePath('custom/basic_function_indent-in.js')
    ],
    function(result) {
      expect(result).to.equal(readOut('/custom/basic_function_indent'));
    }
  );

  // Format file with jquery preset
  testCLI(
    'preset',
    ['--preset', 'jquery', comparePath('jquery/spacing-in.js')],
    function(result) {
      expect(result).to.equal(readOut('/jquery/spacing'));
    }
  );

  // use settings from package.json file
  testCLI(
    'package.json',
    [comparePath('rc/package/package-in.js')],
    function(result) {
      expect(result).to.equal(readOut('/rc/package/package'));
    }
  );

  // use settings from .esformatter file
  testCLI('rc', [comparePath('rc/top-in.js')], function(result) {
    expect(result).to.equal(readOut('/rc/top'));
  });

  // use settings from .esformatter file
  testCLI('rc nested', [comparePath('rc/nested/nested-in.js')], function(result) {
    expect(result).to.equal(readOut('/rc/nested/nested'));
  });

  // make sure .esformatter file have higher priority than package.json
  testCLI(
    'rc nested package',
    [comparePath('rc/package/rc/nested-in.js')],
    function(result) {
      expect(result).to.equal(readOut('/rc/package/rc/nested'));
    }
  );

  // make sure .esformatter file have higher priority than package.json and
  // that configs are merged even if inside same folder
  testCLI(
    'nested package+rc',
    [comparePath('rc/package/nested/pkg_nested-in.js')],
    function(result) {
      expect(result).to.equal(readOut('/rc/package/nested/pkg_nested'));
    }
  );

  // make sure it shows descriptive error message when config doesn't exist
  testCLI(
    'invalid config',
    ['-c', 'non-existent.json', comparePath('default/call_expression-in.js')],
    function(result) {
      expect(result.message).to.contain("Can't parse configuration file 'non-existent.json'");
    }
  );

  // make sure it shows descriptive error message when config file isn't valid
  testCLI(
    'invalid config 2',
    ['-c', comparePath('error/invalid.json'), comparePath('default/call_expression-in.js')],
    function(result) {
      var configPath = comparePath('error/invalid.json');
      expect(result.message).to.contain(
        "Can't parse configuration file '" + configPath + "'. Exception: Unexpected token l"
      );
    }
  );

  // make sure it shows descriptive error message when file doesn't exist
  testCLI('invalid file', ['fake-esformatter-123.js'], function(result) {
    expect(result.message).to.contain("Error: Can't read source file.");
    expect(result.message).to.contain("fake-esformatter-123.js");
  });

  // comments should be allowed on config.json files
  testCLI(
    'config', [
      '--config',
      comparePath('custom/commented_config-config.json'),
      comparePath('custom/commented_config-in.js')
    ],
    function(result) {
      expect(result).to.equal(readOut('/custom/commented_config'));
    }
  );

  // plugins should be loaded from node_modules
  testCLI(
    'local plugin',
    [
      '--config',
      comparePath('custom/commented_config-config.json'),
      '--plugins',
      'esformatter-test-plugin',
      comparePath('custom/commented_config-in.js')
    ],
    function(result) {
      expect(result).to.equal(readOut('/custom/commented_config').replace(/true/, 'false'));
    }
  );

  // glob expansion
  testCLI(
    'glob',
    [comparePath('default/arr*-in.js')],
    function(result) {
      expect(result).to.equal(
        readOut('default/array_expression') +
        readOut('default/array_pattern') +
        readOut('default/arrow_function_expression')
      );
    }
  );

  // glob expansion + ignore
  testCLI(
    'glob ignore',
    ['--ignore', '**/*_pattern-in.js', comparePath('default/arr*-in.js')],
    function(result) {
      expect(result).to.equal(
        readOut('default/array_expression') +
        readOut('default/arrow_function_expression')
      );
    }
  );

  // glob + multiple ignore
  testCLI(
    'glob ignore multi',
    [
      '--ignore',
      '**/*_pattern-in.js',
      '--ignore',
      '**/array_expression-in.js',
      comparePath('default/arr*-in.js')
    ],
    function(result) {
      expect(result).to.equal(
        readOut('default/arrow_function_expression')
      );
    }
  );

  // invalid glob expansion should throw error
  testCLI(
    'glob invalid',
    [comparePath('default/fake-file*-in.js')],
    function(result) {
      var msg = result.message.trim();
      var filePath = comparePath('default/fake-file*-in.js');
      expect(msg).to.contain("Error: Can't read source file.");
      expect(msg).to.contain(filePath);
    }
  );

  // invalid JS files should throw errors
  testCLI('invalid js', [comparePath('error/invalid-*.js')], function(result) {
    var msg = result.message;
    // using match because of absolute path and also because file order might
    // be different in some OS. we just make sure that error message contains
    // what we expect to find
    expect(msg).to.match(/Error: .+invalid-1.js:4:0 Unexpected token/);
    expect(msg).to.match(/Error: .+invalid-2.js:3:9 Invalid regular expression/);
  });

  describe('modify file in place', function() {
    var cpInPlace = comparePath('default/inplace-in.js.copy');
    var expectedInPlace = comparePath('default/inplace-out.js');

    beforeEach(function() {
      fs.writeFileSync(cpInPlace, fs.readFileSync(comparePath('default/inplace-in.js')));
    });

    afterEach(function() {
      fs.unlinkSync(cpInPlace);
    });

    testCLI('default', ['-i', cpInPlace], function(result) {
      // in place option should modify the input file and not output any data
      expect(result).to.equal('');
      expect(fs.readFileSync(cpInPlace, {
        encoding: 'utf8'
      })).to.equal(fs.readFileSync(expectedInPlace, {
        encoding: 'utf8'
      }));
    });
  });

  // extends 'preset:fake-2' on package.json
  testCLI(
    'extends preset + package.json',
    [comparePath('fake-preset/2-in.js')],
    function(result) {
      expect(result).to.equal(readOut('fake-preset/2'));
    }
  );

  // -----------------------------
  // SLOW TESTS are executed later
  // -----------------------------

  // Format a file from standard input
  spawnEsformatter(
    'stdin',
    '--preset=default',
    comparePath('default/assignment_expression-in.js'),
    function(result) {
      expect(result).to.equal(readOut('/default/assignment_expression'));
    }
  );

  // Format a file from standard input with options
  spawnEsformatter(
    'stdin+config',
    '--config ' + comparePath('custom/call_expression-config.json'),
    comparePath('custom/call_expression-in.js'),
    function(result) {
      expect(result).to.equal(readOut('/custom/call_expression'));
    }
  );

  // it should use locally installed esformatter version if available
  spawnEsformatter(
    'local install',
    ['--config', path.join(__dirname, 'bin/config.json'), comparePath('custom/commented_config-in.js')].join(' '),
    function(result) {
      expect(result.trim()).to.equal('fake-esformatter v0.0.0-alpha');
    }
  );

});
