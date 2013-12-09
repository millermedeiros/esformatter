a?foo():bar();

b = (dolor!==amet)  ?  'ipsum': 'dolor';

if(true){
  // this looks weird but indent logic follows the conditionals nesting
c = !a ?(!foo?d  :   function(){
    return a;
}):b;
}

// should break lines
foo.a = true; a?foo() : bar()


// from jquery
x = function(num) {
    return num == null ?

        // Return a 'clean' array
        this.toArray() :

        // Return just the object
        (object);
}

function x() {
    x.test(y) ?
        a :
        b;
}

num == null ?

    // Return a 'clean' array
    this.toArray() :

    // Return just the object
    ( num < 0 ? this[ this.length + num ] : this[ num ] );
