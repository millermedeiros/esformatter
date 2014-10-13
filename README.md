# esformatter

[![Build Status](https://secure.travis-ci.org/millermedeiros/esformatter.png?branch=master)](https://travis-ci.org/millermedeiros/esformatter)

ECMAScript code beautifier/formatter.

Live preview: [lloiser/esformatter-visualize](http://lloiser.github.io/esformatter-visualize/)


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
 - support for local/global config file so settings can be shared between team
   members.
 - presets for the most popular style guides (Google, jQuery, Idiomatic.js).
 - be the best JavaScript code formatter.



## API

### esformatter.format(str[, opts]):String

`format()` method receives a string containing the code that you would like to
format and the configuration options that you would like to use and returns
a string with the result.

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

### esformatter.rc([filePath], [customOptions]):Object

Used by task runners and/or plugin authors to retrieve the configuration stored
on `.esformatter` and `package.json` files relative to the `filePath`, `cwd` or
global config file (`~/.esformatter`) if it can't find any config file until
the root path.

You can also pass an object with `customOptions` to override the default
options.

`rc` will merge the options from multiple [config files](#configuration).

```js
// will start search from the "foo/bar" directory
var baseConfig = esformatter.rc('foo/bar/baz.js');
// will start the search from cwd
var otherConfig = esformatter.rc();
// merge some custom options to the user settings
var override = esformatter.rc({
  indent: { value: '\t' }
});
```

### esformatter.register(plugin)

Register a [plugin](#plugins) module.

```js
var plugin = {
  nodeAfter: function(node) {
    // called once for each node, after the esformatter manipulation
  }
};
esformatter.register(plugin);
```

### esformatter.unregister(plugin)

Remove [plugin](#plugins) from the execution queue.

```js
esformatter.unregister(pluginObject);
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

For a live preview check [esformatter-visualize](http://lloiser.github.io/esformatter-visualize/)

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


Configuration in esformatter consists of three main building blocks:

#### indent

Indent is responsible for whitespace at the front of each line. `indent.value` is used for each indentation. The default indents with two spaces. Setting `indent.value` to `"\t"` will switch to indentation using tabs.

The other properties for indent toggle indentation for specific elements. These all refer to regular JavaScript statements except for TopLevelFunctionBlock. This is enabled by default, with no special behaviour. When disabled (set to `0`), esformattter will not indent top level function blocks (used by the jQuery preset).

#### lineBreak and whiteSpace

Both of these have `value`, `before` and `after` properties. `lineBreak`'s value is `"\n"` by default, while whiteSpace uses a single space (`" "`). Its unlikely that you ever need to change these.

More interesting are all the properties nested under `before` and `after`. These refer to various elements of JavaScript syntax, where the terms mostly match the names used by the Abstract Syntax Tree (AST) for JavaScript. A lot of them have "...Opening", "...Closing", "...OpeningBrace" and "...ClosingBrace" as variants, allowing very fine grained control over each settings.

Documenting each property here wouldn't be practical. For now we recommend you look at the existing presets (default and jquery) to find the properties you need to adjust for your specific needs. Better yet, adopt one of the presets to avoid having to configure anything beyond the most basic settings (like `indent.value`).

For `lineBreak` you can use ranges or integers:

 - positive integer (`1` till `99`): "add or keep `[n]` line breaks".
 - `-1`: keep original line breaks.
 - `">2"`: add linebreaks until it's over `2`.
 - `">=1"`: add line breaks until it's equal or greater than `1`.
 - `"<2"`: remove linebreaks until it's smaller than `2`.
 - `"<=1"`: remove/add line breaks until it's smaller or equal to `1`.

For `whiteSpace` you can only use positive integers for now (any positive number between `1` and `99`) or `-1` when you want to keep the original value.


## Plugins

Esformatter also have support for plugins (v0.2.0+).

JavaScript is a very flexible language, which means people write it in many
different ways, since adding support for every single kind of style would be
*impossible*, we decided to introduce plugins; that should give enough
flexibility to tailor the formatting to match the craziest needs.

Plugins are automatically loaded from `node_modules` if you pass the module id
in the config file:

```json
{
  "indent": {
    "value": "\t"
  },
  "plugins": ["esformatter-sample-plugin", "foobar"]
}
```

List of plugins and plugins wish list: https://github.com/millermedeiros/esformatter/wiki/Plugins

You also have the option to `register` a plugin programmatically:

```js
var plugin = {
  nodeAfter: function(node) {
    // transform node here
  }
};
esformatter.register(plugin);
```

Plugins are executed in the same order as they are registered (first in, first
out).

The plugin methods are executed on the following order: `stringBefore` > `tokenBefore` > `nodeBefore` > `nodeAfter` > `tokenAfter` > `transform` > `stringAfter`.

**All plugin methods are optional.**

**protip:** You can use
[rocambole-token](https://github.com/millermedeiros/rocambole-token) and
[rocambole-node](https://github.com/millermedeiros/rocambole-node) to simplify
the AST manipulation process.


### setOptions(options)

Called once before any manipulation, the object is shared with the esformatter
which means you can use this method to override default options if needed.

```js
var options;

plugin.setOptions = function(opts) {
  // override the default settings (objects are passed by reference, changing
  // the value here will also change the value used by esformatter)
  opts.indent.value = '  ';
  // store the options to be used later
  options = opts;
};
```

### stringBefore(inputString):String

A way to replace the input string, it should **ALWAYS** return a string.

```js
plugin.stringBefore = function(str) {
  // prepend a variable declaration to the file
  return 'var foo = "bar";\n' + str;
};
```

### stringAfter(outputString):String

Replaces the output string.

PS: using regular expressions or string manipulation methods to process code
is very error-prone! BEWARE!

```js
plugin.stringAfter = function(str) {
  // replaces all the occurances of "foo" with "bar" (very naive)
  return str.replace(/foo/g, 'bar');
};
```

### tokenBefore(token)

Called once for each token (eg. Keyword, Punctuator, WhiteSpace, Indent...)
before processing the nodes. Can be used to manipulate the token value or
add/remove/replace the token or tokens around it.

```js
var tk = require('rocambole-token');

plugin.tokenBefore = function(token) {
  if (tk.isSemiColon(token) && tk.isSemiColon(token.next)) {
    // remove semicolon if next token is also a semicolon
    tk.remove(token);
  }
};
```

### tokenAfter(token)

Called once for each token (eg. Keyword, Punctuator, WhiteSpace, Indent...)
after processing all the nodes. Can be used to manipulate the token value or
add/remove/replace the token or tokens around it.

### nodeBefore(node)

Called once for each `node` of the program (eg. VariableDeclaration,
IfStatement, FunctionExpression...) before the esformatter default
manipulations.

### nodeAfter(node)

Called once for each `node` of the program (eg. VariableDeclaration,
IfStatement, FunctionExpression...) after the esformatter default
manipulations.

```js
var tk = require('rocambole-token');

plugin.nodeAfter = function(node) {
  if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
    if (node.body) {
      // insert a line break before the function body
      tk.before(node.body.startToken, {
        type: 'LineBreak',
        value: options.lineBreak.value
      });
    }
  }
};
```

### transformBefore(ast)

Called before esformatter loops through all the nodes, allows plugin authors to
modify the AST before esformatter. This is the ideal place to add/replace
nodes.

### transformAfter(ast)

Called after all nodes and tokens are processed, allows overriding all the
changes (including indentation).

```js
var rocambole = require('rocambole');

plugin.transformAfter = function(ast) {
  // if you need to manipulate multiple nodes you can use the
  // rocambole.moonwalk or rocambole.recusive methods. we don't do it
  // automatically since you might have very specific needs
  rocambole.moonwalk(ast, function(node) {
    doStuff(node);
  });
};
```


## IRC

We have an IRC channel [#esformatter on
irc.freenode.net](http://webchat.freenode.net/?channels=esformatter) for quick
discussions about the project development/structure.


## Wiki

See project Wiki for more info: https://github.com/millermedeiros/esformatter/wiki



## Project structure / Contributing

See [CONTRIBUTING.md](https://github.com/millermedeiros/esformatter/blob/master/CONTRIBUTING.md)



## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)



## License

Released under the MIT license


