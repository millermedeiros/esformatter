for (key in obj) {
  doFoo(obj[key]);
}
for (key in obj) doFoo(obj[key]);

for (var k in o) {
  console.log(k, o[k]);
}

for (key in obj) {
  for (prop in obj[key]) {
    //indent
    console.log(prop)
  }
}

// issue #13 : ForInStatement should not mess with inline object indent
function iss13() {
  for (i in {submit: true, change: true, focusin: true}) {
    console.log(i);
  }
}

// keep empty statement on one line
var key;
for (key in obj) {}
