// issue #400
() => process.exit( 0 );
( example ) => process.exit( 0 );
( example ) => {
  process.exit( 0 );
};
function example() {
  return process.exit( 0 );
}
