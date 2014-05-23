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

contents = this.headers.next()
  .removeClass("ui-helper-reset ui-widget-content ui-corner-bottom " +
    "ui-accordion-content ui-accordion-content-active ui-state-disabled")
  .css("display", "")
  .removeAttr("role");

this.headers
  .attr({
    "aria-selected": "false",
    "aria-expanded": "false",
    tabIndex: -1
  })
  .next()
    .attr({
      "aria-hidden": "true"
    })
    .hide();
