// this file is imcomplete since jquery style guide support is still not
// finished (see #19)

var i = 0;

if (condition) { doSomething(); } else if (otherCondition) {
  somethingElse();
// comment
} else {
// comment
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

function x() {
  return something &&
    !somethingElse;
}

ul.outerWidth( Math.max(
  // Firefox wraps long text (possibly a rounding bug)
  // so we add 1px to avoid the wrapping (#7513)
  ul.width( "" ).outerWidth() + 1,
  this.element.outerWidth()
) );

this.isMultiLine =
  // Textareas are always multi-line
  isTextarea ? true :
  // Inputs are always single-line, even if inside a contentEditable element
  // IE also treats inputs as contentEditable
  isInput ? false :
  // All other element types are determined by whether or not they're contentEditable
  this.element.prop( "isContentEditable" );

if ( event.target !== that.element[ 0 ] &&
    event.target !== menuElement &&
    !$.contains( menuElement, event.target ) ) {
  close();
}

contents = this.headers.next()
  .removeClass("ui-helper-reset ui-widget-content ui-corner-bottom " +
    "ui-accordion-content ui-accordion-content-active ui-state-disabled")
  .css("display", "")
  .removeAttr("role");

this.buttonElement
  .addClass( baseClasses )
  .bind( "click" + this.eventNamespace, function( event ) {
    if ( options.disabled ) {
      event.preventDefault();
    }
  });
