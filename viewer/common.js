/* Useful functions */

function replaceAll(string /*, find, replace, find2, replace2... */) {
  if( arguments.length <3 ){ return; }
  for( var i = 1; i < arguments.length; i += 2 ){
    var find = arguments[i], replace = arguments[i + 1];
    while( string.indexOf(find) != -1 ){
      string = string.replace(find, replace);
    }
  }
  return string;
};

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

/**
 * Returns rounded string to X decimal places (i.e. after the decimal point)
 * For its numerical value, use parseFloat.
 * @param {Number} places - the amount of digits maximum to use after the decimal point.
 * @returns {String}
 */
Number.prototype.round = function(places){
  var integer = Math.floor(this);
  
  if( this == integer ){ return this.toString() }
  if( places < 1 ){ return integer.toString(); }
  
  var places = (arguments.length == 0)
               ? 1 : Math.min(Math.floor(places), 20),
      factor = Math.pow(10, places),
      floating = Math.round((this - integer) * factor) / factor,
      number = integer + floating.toString().substring(1, places + 2);
  return number
}
