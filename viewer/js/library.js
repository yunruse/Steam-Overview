var gameItemContents = "\
$name$\
<span class='playLink'><a$playHref$>$playText$</a></span>\
<span style='color: $colour$' class='col1'>$size$</span>\
<span style='color: $colour$' class='col2'>$percent$%</span>"

function constructGameItem(game){
  var library = game.library,
      li = document.createElement('li'),
      playText = '(Shortcut)',
      url = ''
  
  if( game.ID.indexOf('/') == -1 && game.ID.indexOf('\\') == -1){
    playText = 'Details...'
    url = " href='steam://nav/games/details/" + game.ID + "'"
  }
  
  li.innerHTML = replaceAll(gameItemContents,
    '$name$', game.name, '$playHref$', url, '$playText$', playText,
    '$size$', game.formattedSize, '$percent$', game.percentString,
    '$colour$', game.interfaceColour)
  
  li.playLink = li.getElementsByClassName('playLink')[0];
  
  return li;
}

function constructBarPart(game){
  var barPart = document.createElement('span');
  barPart.className = "barsegment part";
  
  /* Convince weird pixel rounding to err on the round-up side
   * so as to avoid gaps between segments. */
  barPart.style.width = "calc(" + game.percentTaken + "% + 0.1px)";
  barPart.style.left = game.barCurrentLeft + "%";
  
  barPart.style.backgroundColor = game.interfaceColour;
  return barPart;
}

var libraryItemContents = '\
<div class="header">\
  <h2 class="drivename">$title$</h2>\
  <div class="drivebar">Free\
    <div class="barsegment used"  style="width: $usedPercent$%;">Used</div>\
    <div class="barsegment games" style="width: $gamePercent$%;">All games</div>\
    <div class="barsegment additional" style="width: 0%; left: $usedPercent$%;"></div>\
  </div>\
</div>\
<ul class="gamelist">\
<li class="meta free">Free\
  <span class="col1">$free$</span>\
  <span class="col2">$freePercent$%</span>\
</li>\
<li class="meta used">Used\
  <span class="col1">$used$</span>\
  <span class="col2">$usedPercent$%</span>\
</li>\
<li class="meta allGames">All Games\
  <span class="col1">$usedGames$</span>\
  <span class="col2">$gamePercent$%</span>\
</li></ul>'

function constructLibraryItem(library){
  var usedPercent = roundDecimals(100 * (library.sizeUsed / library.sizeTotal), 2)
      freePercent = roundDecimals(100 * (library.sizeFree / library.sizeTotal), 2),
      gamePercent = roundDecimals(100 * (library.sizeGames / library.sizeTotal), 2),
      title = library.path + ' (' + formatBytes(library.sizeTotal, 1) + ', ' +
        library.games.length + ' game' + (library.games.length == 1 ? '' : 's') + ')',
      el = document.createElement('li');
  
  el.innerHTML = replaceAll(libraryItemContents,
    '$title$', title,
    '$free$', formatBytes(library.sizeFree, 1),
    '$used$', formatBytes(library.sizeUsed, 1),
    '$usedGames$', formatBytes(library.sizeGames, 1),
    '$freePercent$', freePercent,
    '$usedPercent$', usedPercent,
    '$gamePercent$', gamePercent);
  
  el.drivebar = el.getElementsByClassName('drivebar')[0];
  el.additional = el.getElementsByClassName('additional')[0];
  el.gameList = el.getElementsByClassName('gamelist')[0];
  
  return el;
}

function constructLibraryList() {
  for( var i = 0; i < libraries.length; i++ ) {
    var library = libraries[i];
    
    // Quasi-random but tied to size for constancy
    var randomIsh = (library.sizeUsed % 1000) / 1000;
    
    var currentHue = 60 + randomIsh * 120, // Visual opposite of 'All games' hue
        currentBarLeft = 0;
    
    library.element = constructLibraryItem(library);
    
    for( var j = 0; j < library.games.length; j++ ){
      var game = library.games[j];
      
      /* Game variables */
      
      game.library = library;
      game.percentString = roundDecimals(100 * (game.size / library.sizeTotal), 2);
      game.percentTaken = parseFloat(game.percentString);
      if( game.percentString == "0" ){ game.percentString = "< 0.01"; }
      
      game.formattedSize = formatBytes(game.size, 1, true);
      
      game.interfaceColour = "hsl(" + currentHue + ", 100%, 70%)";
      currentHue += (360 / library.games.length) + 140;
      currentHue %= 360;
      
      /* Game elements */
      
      game.barCurrentLeft = currentBarLeft;
      currentBarLeft += game.percentTaken;
      
      game.element = constructGameItem(game);
      library.element.gameList.appendChild(game.element)
      
      game.barElement = constructBarPart(game);
      library.element.drivebar.appendChild(game.barElement);
      
      bindGame(game);
    }
    
    libraryList.appendChild(library.element);
  }
}