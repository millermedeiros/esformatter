# esformatter changelog

## v0.3.2 (2014-06-23)

 - fix issue with sparse arrays. see millermedeiros/rocambole#15
 - fix Params comma handling and update rocambole to 0.3.4 to fix BlockComment. closes #139
 - fix indent for objects inside arrays. closes #142
 - fix white space inside expression statement with parens. closes #155
 - change IfStatement indent edges to avoid indenting comments that are just before `} else`. closes #123
 - fix comments inside ObjectExpression. closes #166


## v0.3.1 (2014-06-23)

 - avoid merging undefined config on `esformatter.rc`.
 - make sure `esformatter.rc` doesn't load config file if user provides
   a 'preset' or if 'root == true' to match CLI behavior.


## v0.3.0 (2014-06-20)

 - expose ALL the things!! exposed a few methods related to line break, white
   space and indentation; also flattened the directory structure to make it
   easier for plugin authors to reuse esformatter internal methods when needed.


## v0.2.0 (2014-06-16)

 - add plugin support.
 - refactored the way indentation is handled (and changed default settings
   related to indentation).
 - expose the `rc` method.
 - fix rc merge/search logic to avoid problems on windows.
 - fix `void 0`
 - proper indent edges for `AssignmentExpression`
 - indent `CallExpression` by default
 - make sure `_br.limit` doesn't remove LineBreak if previous token is
   a comment (fixes a few bugs).
 - fix comments inside empty catch block (avoid removing line breaks).


## v0.1.1 (2014-05-12)

 - fix error when input is an empty file.
 - fix `typeof`
 - add spaces inside ForStatement and WhileStatement parenthesis on jQuery
   preset.


## v0.1.0 (2014-04-15)

 - major refactor on the code structure and major changes to the default tool
   behavior.
 - changed some rules so the tool is less opinionated.
 - change formatter logic to support ranges on the configuration file.
 - avoid removing line breaks during the formatting process, increasing the
   flexibility of the formatting rules.


## notes about v0.0.1 (2012-12-06) till v0.0.16 (2014-02-24)

The formatter had stricter rules and was way less flexible before v0.1.0;

Lots of small improvements between each version. Behavior was still in flux and
each version was breaking backwards compatibility.

We considered v0.0.15 (2013-12-18) to be "stable" for most common cases, most
of bugs found in the following months after release was on edge-cases. We
decided to make a big refactor to increase the formatter flexibility and to be
less aggressive on the changes.


