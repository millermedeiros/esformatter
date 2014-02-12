/*jshint node:true*/
/*global describe:false, it:false*/
"use strict";

var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('./helpers');

describe('Command line interface', function() {
  var filePath;
  var configPath;

  /**
   * Spawn a child process calling the bin file with the specified options
   * @param {String} options Same as you would pass in the command line
   * @param {String} input Standard input
   * @param {Function} testCallback It receives the formatted file
   */
  var spawnEsformatter = function(id, options, input, testCallback) {
    var args = [path.join(__dirname + '/../bin/esformatter')];
    if (typeof options === 'function') {
      testCallback = options;
      options = null;
    } else if (typeof input === 'function') {
      testCallback = input;
      input = null;
    }
    if (options) {
      args = args.concat(options.split(" "));
    }
    it('[cli '+ id +'] ' + options, function(mochaCallback) {
      var childprocess = spawn('node', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      var output = "";
      var errorInChildProcess = "";
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


  // Format a file with default options
  filePath = path.join(__dirname + '/compare/default/array_expression-in.js');
  spawnEsformatter('default', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/default/array_expression'));
  });

  // Format a file specifying some options
  filePath = path.join(__dirname + '/compare/custom/basic_function_indent-in.js');
  configPath = path.join(__dirname + '/compare/custom/basic_function_indent-config.json');
  spawnEsformatter('config', "--config " + configPath + " " + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/basic_function_indent'));
  });

  // Format a file from standard input
  filePath = path.join(__dirname + '/compare/default/assignment_expression-in.js');
  spawnEsformatter('stdin', null, filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/default/assignment_expression'));
  });

  // Format a file from standard input with options
  filePath = path.join(__dirname + '/compare/custom/call_expression-in.js');
  configPath = path.join(__dirname + '/compare/custom/call_expression-config.json');
  spawnEsformatter('stdin+config', "--config " + configPath, filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/call_expression'));
  });

  // Format file with jquery preset
  filePath = path.join(__dirname + '/compare/jquery/spacing-in.js');
  spawnEsformatter('preset', "--preset jquery " + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/jquery/spacing'));
  });

  // use settings from package.json file
  filePath = path.join(__dirname + '/compare/rc/package/package-in.js');
  spawnEsformatter('package.json', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/package/package'));
  });

  // use settings from .esformatter file
  filePath = path.join(__dirname + '/compare/rc/top-in.js');
  spawnEsformatter('rc', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/top'));
  });

  // use settings from .esformatter file
  filePath = path.join(__dirname + '/compare/rc/nested/nested-in.js');
  spawnEsformatter('rc nested', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/nested/nested'));
  });

  // make sure .esformatter file have higher priority than package.json
  filePath = path.join(__dirname + '/compare/rc/package/rc/nested-in.js');
  spawnEsformatter('rc nested package', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/package/rc/nested'));
  });

  // make sure .esformatter file have higher priority than package.json and
  // that configs are merged even if inside same folder
  filePath = path.join(__dirname + '/compare/rc/package/nested/pkg_nested-in.js');
  spawnEsformatter('nested package+rc', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/package/nested/pkg_nested'));
  });

  // make sure it shows descriptive error message when config doesn't exist
  filePath = path.join(__dirname + '/compare/default/call_expression-in.js');
  spawnEsformatter('invalid config', '-c non-existent.json '+ filePath, function(formattedFile) {
    expect(formattedFile.message).to.equal('Can\'t parse configuration file: "non-existent.json"\nException: ENOENT, no such file or directory \'non-existent.json\'\n');
  });

  // make sure it shows descriptive error message when file doesn't exist
  spawnEsformatter('invalid file', 'fake-esformatter-123.js', function(formattedFile) {
    expect(formattedFile.message).to.equal('Can\'t read source file: "fake-esformatter-123.js"\nException: ENOENT, no such file or directory \'fake-esformatter-123.js\'\n');
  });

  // comments should be allowed on config.json files
  filePath = path.join(__dirname + '/compare/custom/commented_config-in.js');
  configPath = path.join(__dirname + '/compare/custom/commented_config-config.json');
  spawnEsformatter('config', "--config " + configPath + " " + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/commented_config'));
  });


});
