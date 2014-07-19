var foo = true;
var bar = '123';
var lorem = /\w+/;
var parentheses = (123);

var dolor;

var a,
  b = true,
  c = 3,
  d = false;

var amet = qwe();
var asi = true


// test for issue #4
var
  // foo var
  foo,
  // bar variable
  bar = 'dolor amet';


// issue #28 : comma first
var x = 33,
  y = 12,


  // comment
  w = 45;


// issue #31: multiple var declaration + function expression = wrong indent
(function() {
  var
    // A central reference to the root jQuery(document)
    rootjQuery,

    // Define a local copy of jQuery
    jQuery = function(selector, context) {
      // The jQuery object is actually just the init constructor 'enhanced'
      return new jQuery.fn.init(selector, context, rootjQuery);
    },

    // literal object
    obj = {
      num: 123,
      str: 'literal'
    };
}());

var lorem = ipsum ||
  dolor &&
  (sit || amet);

