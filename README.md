# esformatter

[![Build Status](https://secure.travis-ci.org/millermedeiros/esformatter.png?branch=master)](https://travis-ci.org/millermedeiros/esformatter)

ECMAScript code beautifier/formatter.



## Important

This tool is still on early development and is missing support for many
important features.

**We are looking for contributors!!**



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

So far `esformatter` exposes a single `format()` method which receives a string
containing the code that you would like to format and the configuration options
that you would like to use and returns a string with the result.

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
            BlockStatement : 1,
            DoWhileStatementOpeningBrace : 1,
            // ...
        }
    },
    whiteSpace : {
        // ...
    }
};

var fs = require('fs');
var codeStr = fs.readFileSync('path/to/js/file.js', 'utf-8');

// return a string with the formatted code
var formattedCode = esformatter.format(codeStr, options);
```

### CLI

You can also use the simple CLI to process `stdin` and `stdout` or reading from file:

`stdin`
```sh
# format "test.js" and output result to stdout
cat test.js | esformatter
# format "test.js" using options in "options.json" and output result to stdout
cat test.js | esformatter --config options.json
# process "test.js" and writes to "test.out.js"
esformatter < test.js > test.out.js
```

`file`
````sh
# format "test.js" and output result to stdout
esformatter test.js
# format "test.js" using options in "options.json" and output result to stdout
esformatter --config options.json test.js
# process "test.js" and writes to "test.out.js"
esformatter test.js > test.out.js
````

````sh
# Usage information
esformatter --help
esformatter -h

# Version number
esformatter --version
esformatter -v
````

CLI will be highly improved after we complete the basic features of the
library. We plan to add support for local/global settings and some flags to
toggle the behavior.



## Project structure / Contributing

See [CONTRIBUTING.md](https://github.com/millermedeiros/esformatter/blob/master/CONTRIBUTING.md)



## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)



## Projects built on top of esformatter

 - [esformatter-diff](https://github.com/piuccio/esformatter-diff) - provides a CLI tool to check and validate a codebase
 - [sublime-esformatter](https://github.com/piuccio/sublime-esformatter) - integrates esformatter into Sublime Text
 - [grunt-esformatter](https://github.com/jzaefferer/grunt-esformatter) - provides a grunt plugin for validating and formatting your projects code formatting



## License

Released under the MIT license


