(function(i) {
  function h(a, b, c, d, e) {
    this._listener = b;
    this._isOnce = c;
    this.context = d;
    this._signal = a;
    this._priority = e || 0
  }
  i.h = h;
}(this));
