// this file is imcomplete since jquery style guide support is still not
// finished (see #19)

var i = 0;

if ( condition ) {
	doSomething();
} else if ( otherCondition ) {
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

while ( x ) {
	y();
}

for ( i = 0; i < length; i++ ) {
	y();
}

ul.outerWidth( Math.max(
	// Firefox wraps long text (possibly a rounding bug)
	// so we add 1px to avoid the wrapping (#7513)
	ul.width( "" ).outerWidth() + 1,
	this.element.outerWidth()
) );
