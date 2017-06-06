// Polyfills to work on older versions of Javascript

// No need to check for these oneliners

String.prototype.beginsWith = function(p) { return this.indexOf(p) == 0; };

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

Number.prototype.isInteger = function(){ this == Math.floor(this) }
