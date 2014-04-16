# esformatter

[![Build Status](https://secure.travis-ci.org/millermedeiros/esformatter.png?branch=master)](https://travis-ci.org/millermedeiros/esformatter)

ECMAScript code beautifier/formatter.



## Important

This tool is still on early development and is missing support for many
important features.

**We are looking for [contributors](https://github.com/millermedeiros/esformatter/blob/master/CONTRIBUTING.md)!!**



## Why?

[jsbeautifier.org](http://jsbeautifier.org/) doesn't have enough options and
not all IDEs/Editors have a good JavaScript code formatter. I would like to
have a command line tool (and standalone lib) as powerful/flexible as the
[WebStorm](http://www.jetbrains.com/webstorm/) and
[FDT](http://fdt.powerflasher.com/) code formatters.

This tool could also be reused by other node.js libs like
[escodegen](https://github.com/Constellation/escodegen/) to format the output
(so each lib has a single responsibility).

For more reasoning behind it and history of the project see: [esformatter
& rocambole](http://blog.millermedeiros.com/esformatter-rocambole/)



## How?

This tool uses [rocambole](https://github.com/millermedeiros/rocambole) (based
on Esprima) to recursively parse the tokens and transform it *in place*.



## Goals

 - *granular* control about white spaces, indent and line breaks.
 - command line interface (cli).
 - be non-destructive.
 - option to control automatic semicolon insertion (asi).
 - support for local/global config file so settings can be shared between team
   members.
 - presets for the most popular style guides (Google, jQuery, Idiomatic.js).
 - be the best JavaScript code formatter.



## API

### esformatter.format(str[, opts]):String

So far `esformatter` exposes 2 methods.

`format()` method which receives a string containing the code that you would
like to format and the configuration options that you would like to use and
returns a string with the result.

```js
var esformatter = require('esformatter');

// for a list of available options check "lib/preset/default.json"
var options = {
    // inherit from the default preset
    preset : 'default',
    indent : {
        value : '  '
    },
    lineBreak : {
        before : {
            // at least one line break before BlockStatement
            BlockStatement : '>=1',
            // only one line break before BlockStatement
            DoWhileStatementOpeningBrace : 1,
            // ...
        }
    },
    whiteSpace : {
        // ...
    }
};

var fs = require('fs');
var codeStr = fs.readFileSync('path/to/js/file.js').toString();

// return a string with the formatted code
var formattedCode = esformatter.format(codeStr, options);
```

### esformatter.transform(ast[, opts]):AST

or you can use the `transform()` method to manipulate an AST in place (allows
pipping other tools that manipulates the AST). - so far only supports
[rocambole](https://github.com/millermedeiros/rocambole) generated ASTs, but we
will work to fix this limitation in the future (see [issue #86](https://github.com/millermedeiros/esformatter/issues/86)).

```js
var inputAST = rocambole.parse('var foo=123;');
// you can also pass the formatting options as second argument like the
// `format` method
var outputAST = esformatter.transform(inputAST);
assert(outputAST === inputAST, 'edits AST in place');
assert(outputAST.toString() === 'var foo = 123;', 'formats input');
```


## CLI

You can also use the simple command line interface to process `stdin` and
`stdout` or read from a file.

```sh
npm install -g esformatter
```

### Usage:

````sh
esformatter [OPTIONS] [FILES]

Options:
  -c, --config   Path to custom configuration file.
  -p, --preset   Set style guide preset ("jquery", "default").
  -h, --help     Display help and usage details.
  -v, --version  Display the current version.
````

### Examples:

```sh
# format "test.js" and output result to stdout
esformatter test.js
# you can also pipe other shell commands (read file from stdin)
cat test.js | esformatter
# format "test.js" using options in "options.json" and output result to stdout
esformatter --config options.json test.js
# process "test.js" and writes to "test.out.js"
esformatter test.js > test.out.js
# you can override the default settings, see lib/preset/default.json for
# a list of available options
esformatter test.js --indent.value="\t" --lineBreak.before.IfStatementOpeningBrace=0
```

### Configuration

`esformatter` will look for the closest `.esformatter` file and use that as
a setting unless you specify `--preset` or `--config`.

You also have the option to put your `esformatter` settings inside the
`package.json` file under the `esformatter` property.

Settings from multiple files will be merged until it finds a config file that
contains the property `"preset"` or `"root": true`; that makes it easy to
define exceptions to the project rules without needing to copy all the shared
properties. - for an example see test files inside the `"test/compare/rc"`
folder.

The `"preset"` property is used to set the `prototype` of the config file,
enabling inheritance. For instance, you can say your config inherits from the
`jquery` preset and only override the settings you need:

```json
{
  "preset": "jquery",
  "indent": {
    "value": "  "
  }
}
```

PS: the [jQuery preset](https://github.com/millermedeiros/esformatter/issues/19) is still under development.



## IRC

We have an IRC channel [#esformatter on
irc.freenode.net](http://webchat.freenode.net/?channels=esformatter) for quick
discussions about the project development/structure.



## Project structure / Contributing

See [CONTRIBUTING.md](https://github.com/millermedeiros/esformatter/blob/master/CONTRIBUTING.md)



## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)



## Projects built on top of esformatter

 - [esformatter-diff](https://github.com/piuccio/esformatter-diff) - provides a CLI tool to check and validate a codebase
 - [sublime-esformatter](https://github.com/piuccio/sublime-esformatter) - integrates esformatter into Sublime Text
 - [grunt-esformatter](https://github.com/jzaefferer/grunt-esformatter) - provides a grunt plugin for validating and formatting your projects code formatting
 - [vim-esformatter](https://gist.github.com/nisaacson/6939960) - integrates esformatter into vim
 - [gulp-esformatter](https://github.com/sindresorhus/gulp-esformatter) - gulp plugin
 - [broccoli-esformatter](https://github.com/shinnn/broccoli-esformatter) - Broccoli plugin



## License

Released under the MIT license


