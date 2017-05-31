document.onscroll = window.onresize = function() {
  var fixed;
  for( var i = 0; i < libraries.length; i++ ){
    var lib = libraries[i];
    var offset = lib.box.offsetTop - window.pageYOffset;
    if( offset < 0 ){
      lib.title.classList.add('fixed');
      if( fixed ){ fixed.classList.remove('fixed') }
      fixed = lib.title;
    } else {
      lib.title.classList.remove('fixed');
    }
  }
}