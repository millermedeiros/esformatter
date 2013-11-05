// line comment, no indent

/*
 * block comment, no indent
 */
if (true) {
  // line comment, 1 indent
  /**
   * block comment, 1 indent
   */
  if (true) {
    // line comment, 2 indents
    /*
     * block comment, 2 indent
     */
    if (true) {
      /* block single line, 3 indents */
      /*
        BLOCK ASCII
          |___________
                      |___
                          `----> YEAH
      */
    }
  }
}

/* block single line, no indent */



// test PR #57
var obj = { /* test trailing space after multi line comment */
  then: function( /* fnDone, fnFail, fnProgress */ ) {
    var fns = arguments; // test space before comment
  }
};
