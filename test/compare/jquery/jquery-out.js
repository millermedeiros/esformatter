(function( $, undefined ) {

switch ( event.keyCode ) {
case $.ui.keyCode.ENTER:
case $.ui.keyCode.SPACE:
	x();
	break;
case $.ui.keyCode.ESCAPE:
	y();
	break;
default:
	z();
}

functionl.call( "argument", function( param1, param2 ) {
	// comment
	var var1, var2,
		var3 = [],
		var4 = {},
		// comment
		var5 = [ var1, var2, var3 ],
		var6 = [
			// multi-line array literal needs indent
			"jquery.ui.core.js",
			"jquery.ui.widget.js"
		];
	for ( var1 in var4 ) {
		// comment
		doSomething[ x ] = something();
	}
	// comment
	call();
	call(function() {});
	call(function() {
		something();
		return "a multi line string" +
			"should be allowed to stay" +
			"on multiple lines";
	});
	foo([ "alpha", "beta" ]);
});

define( name, {
	props: {
		// comment
		x: 1,
		y: 2,

		change: null,
		select: null
	},

	_create: function() {
		var var1,
			var2 = "x",
			var3 = call([]),
			var4 = call({});

		// line comment
		this.doSomething();

		this.element
			.add()
			.set({
				// line comment
				// one more
				prop: "value"
			});

		if ( this === that ) {
			x = ( value / 1 ) * ( y / x );
		}
		x = { inline: "object" };

		// tertiary expressions, not defined yet: https://github.com/jquery/contribute.jquery.org/issues/45

		// inline
		parts = typeof value === "string" ? value.split( " " ) : [ value ];

		// line break after question mark and colon:
		return rnumnonpx.test( computed ) ?
			jQuery( elem ).position()[ prop ] + "px" :
			computed;

		// line break after colon:
		return this.indeterminate ? false :
			Math.min( this.options.max, Math.max( this.min, newValue ) );

		return amount + ( amount > 1 ? " results are" : " result is" ) +
			" available, use up and down arrow keys to navigate.";
	}
});

}( jQuery ));
