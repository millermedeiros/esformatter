arr.map(a => a * 2);
arr.map(b => {
  return b * 2;
});
arr.map((c, i) => {
  return c * i;
});
arr.map(d => {
  return d * 2;
});
arr.map((e, f, g) => e * f - g);

// default params (#285)
let defaultParams = (x, y = 1, z = 2) => {
  return x + y + z;
}
