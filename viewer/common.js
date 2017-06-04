/**
 * "Framework" for commonly-used functions.
 */

/* String functions */


String.prototype.beginsWith = function(prefix) {
  return this.indexOf(prefix) == 0;
}

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.replaceAll = function(/*find, replace, find2, replace2... */) {
  if( arguments.length < 2 ){ return; }
  var string = this;
  for( var i = 0; i < arguments.length; i += 2 ){
    var find = arguments[i], replace = arguments[i + 1];
    while( string.indexOf(find) != -1 ){
      string = string.replace(find, replace);
    }
  }
  return string;
};

/* String formatting functions */

/**
 * Returns a human-formatted file size. Uses IEC binary prefixes (KiB, MiB, *1024)
 * by default; specify `binary` as true for ISO decimal (KB, MB, *1000).
 * @param {Number} size
 * @param {Number} digits - max decimal places to round to, default 1.
 * @param {Boolean} binary - use IEC binary prefixes. Default true.
 * @returns {String}
 */
function formatBytes(size, digits, binary) {
  if( arguments.length == 0 ){ return "0 B"; }
  if( arguments.length == 1 ){ digits = 1; }
  if( arguments.length <= 2 ){ binary = true; }
  
  var divisor = binary ? 1024 : 1000,
      prefixes = " KMGTPEZY",
      prefix;
  
  for( var i = 0; i < prefixes.length; i++ ){
    prefix = prefixes[i];
    if( prefix == " " ){ prefix = ""; }
    
    if( Math.abs(size) < divisor ){
      break;
    } else if( i + 1 < prefixes.length ){
      size /= divisor;
    }
  }
  
  if( binary && prefix ){ prefix += "i"; }
   
  return size.round(digits) + " " + prefix + "B";
}

/* Number functions */

/**
 * Rounds to X decimal places as a string for display. For numerical value, use parseFloat.
 * @param {Number} places - the amount of digits maximum to use after the decimal point.
 * @returns {String}
 */
Number.prototype.round = function(places){
  if( Number.isInteger(this) ){ return this.toString() }
  if( arguments.length < 2 ){ asNumber = false; }
  
  var integer = Math.floor(this);
  if( places < 1 ){ return integer.toString(); }  
  
  var places = (arguments.length == 0)
               ? 1 : Math.min(Math.floor(places), 20),
      factor = Math.pow(10, places),
      floating = Math.round((this - integer) * factor) / factor,
      number = integer + floating.toString().substring(1, places + 2);
  return number
}
