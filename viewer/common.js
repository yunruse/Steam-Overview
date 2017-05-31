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
 * @param {bool} binary - use IEC binary prefixes. Default true.
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
  if( prefix ){ size = size.round(digits) }
   
  return size + " " + prefix + "B";
}

/**
 * Returns the length of time in human time units to the nearest unit.
 * Uses 'less than a minute', 'X minutes', 'more than X hours' and 'X days'.
 * @param {Number} duration - the duration in seconds.
 */
function formatTimeDelta(duration){
  var hour = 3600, day = hour * 24, week = day * 7;
  if( duration < 60 ){
    return 'less than a minute';
  } else if( duration < 120 ){
    return 'a minute';
  } else if( duration < hour ){
    return (duration / 60).round(0) + ' minutes';
  } else if( duration < 70 * 60 ){
    return 'an hour';
  } else if( duration < day ){
    return 'more than ' + (duration / hour).round(0) + ' hours'
  } else if( duration < week ){
    return (duration / day).round(0) + ' days'
  } else {
    return (duration / week).round(0) + ' weeks'
  }
}

/* Number functions */

/**
 * Floating-point round.
 * For a fixed-digit string, use Number.toFixed().
 * @param {Number} places - the amount of digits maximum to use after the decimal point.
 */
Number.prototype.round = function(places){
  var places = (arguments.length == 0 || places < 0)
               ? 1 : Math.round(  Math.min(Math.max(places, 0), 20)  ),
      factor = Math.pow(10, places),
      integer = Math.floor(this),
      floating = this - integer;
  return integer + Math.round(floating * factor) / factor;
}