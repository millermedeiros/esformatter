# Presets

Presets are reusable config files that can `require` other presets/plugins and
override configs.

## Reusing presets

On your [esformatter config file](./config.md) you can do;

```js
{
  // presets are used as "base settings"
  "extends": [
    "preset:foobar", // load "esformatter-preset-foobar" from "./node_modules"
    "./lorem_ipsum.json" // load relative config file
  ],

  // you can still override any setting from the preset if needed
  "indent": {
    "value": "  "
  }
}
```

Note that the `preset:` pseudo-protocol will try to find the module with the
`esformatter-preset-` prefix. That should make it easier to find presets on npm.


## Authoring presets

List all the preset dependencies on the `package.json`, that way consumers of
your preset only need to list the preset as dependency:

```js
{
  // use the `esformatter-preset-` prefix on the name
  "name": "esformatter-preset-foobar",
  // list all the dependencies
  "dependencies": {
    "esformatter-quotes": "^1.0.3",
    "esformatter-preset-dolor": "^1.0.0"
  }
}
```

And the implementation would be something like:

```js
// need to use `require` because dependencies will be listed
// on the preset "package.json"
module.exports = {

  // extend other presets
  extends: [
    require('esformatter-preset-dolor'),
    require('./foo-settings')
  ],

  // register plugins
  plugins: [
    require('esformatter-quotes')
  ],

  // this will override any values set by the `esformatter-preset-dolor` and
  // `./foo-settings`
  indent: {
    value: '\t'
  }
};
```

protip: we use this feature on [lib/preset/default.js](../lib/preset/default.js)
to increase organization.
