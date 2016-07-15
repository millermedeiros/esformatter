module.exports = {
  "extends": [
    require('./default-indent'),
    require('./default-linebreak-before'),
    require('./default-linebreak-after'),
    require('./default-whitespace-before'),
    require('./default-whitespace-after')
  ],

  "esformatter": {
    "allowShebang": true
  },

  "indent": {
    "value": "  ",
    "alignComments": true,
  },

  "lineBreak": {
    "value": "\n"
  },

  "whiteSpace": {
    "value": " ",
    "removeTrailing": 1
  }
};
