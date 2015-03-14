a||b
a   || foo;
foo&&bar
;(a||b);
(   a&&b&&c   );


// expressions
;(a&&b) ||foo&&bar
;((a&&b)||c)||d


// test line break and indent
if (true) {
    var b;this.foo&&this.bar();
}

(foo || bar); (dolor || amet);

foo = dolor ||
  amet &&
  bar

var foo = dolor &&
  amet ||
  maecennas

var foo,
  bar = x &&
    ( a || b );

function x() {
  return (x || y) &&

    // comment
    call();
}
