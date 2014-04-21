// this file is imcomplete since jquery style guide support is still not
// finished (see #19)

var i = 0;

if (condition) { doSomething(); } else if (otherCondition) {
  somethingElse();
} else {
otherThing();
}

this.element
  .add()
  .set({
    // line comment
    // one more
    prop: "value"
  });

while (x) {
  y();
}

for (i = 0; i < length; i++) {
  y();
}

if ( event.target !== that.element[ 0 ] &&
    event.target !== menuElement &&
    !$.contains( menuElement, event.target ) ) {
  close();
}
