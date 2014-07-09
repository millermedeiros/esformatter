foo.bar.Baz(  {
    method2: function () {}, prop   : 'dolor amet'
    , prop2 : 123
});

// issue #142
var foo = [{
bar: 42
}];

function foo(a){ amet(123, a, {flag:true}); }
ipsum({flag:true});
ipsum({flag:true,other:false});
ipsum({flag:true,other:false},789,'bar');


var obj = {foo:"bar", 'lorem'   :  123,
    dolor :new Date()
, "re": /\w+/g}    ;

// ObjectEpression within CallExpression needs to indent comments
declare({
// comment
create: {}
});

this.element
.add()
.set({
// line comment
// one more
prop: "value"
});

define( name, {
_create: function() {
this.element
.add()
.set({
// line comment
// one more
prop: "value"
});
}
});

x = {
props: {
// comment
x: 1
}
};

var x = {
  data: x ?
    x() :
    // comment
    function() {}
};

// edge case
for (key in {
  foo:'bar',
  lorem:'ipsum'
}) {
  doStuff(key);
}

// issues #47 and #166
Ext.define('VMS.model.User', {
  extend: 'Ext.data.Model',
  idProperty: 'UserID',
  fields: [
    {
      // foo
      name: 'UserID',
      type: 'int' // bar
    },
    // dolor
    // amet
    {
      name: 'FirstName',
      type: 'string'
    },
    {
      name: 'LastName',
      type: 'string'

      // lorem ipsum
      // dolor sit amet
      // maecennas ullamcor
    }
  ]
});


// issue #175
var ItemsSchema = new Schema({
  name: String // comments
  ,dds: ""
});


this
.foo({
bar: 'baz'
});


// issue #193
foo = function() {
var a,
b,
c;
		var bar = this.baz({});
};
