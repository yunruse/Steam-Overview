var libraryList, timeDisplay;

window.onload = function(){
  libraryList = document.getElementById('drives');
  errorDisplay = document.getElementById('errorDisplay');
  try{ libraries } catch(e) { libraries = false; }
  
  if( libraries ){
    updateLibraries();
    loadLibraries();
    var timeSince = (new Date().getTime() / 1000 ) - lastRetrieved;
    if( timeSince > 30 * 60 ){
      /* More than 30 minutes, use warning */
      errorDisplay.classList.remove('hidden');
      errorDisplay.innerText = 'It has been more than 30 minutes since scanned – please rerun `Steam Overview.py`.';
    }
  } else {
    errorDisplay.classList.remove('hidden');
    errorDisplay.innerText = "I couldn't find a libraries.js file. Did you run `Steam Overview.py`?"
  }
  
}

function updateLibraries(){
  for( var i = 0; i < libraries.length; i++ ) {
    var library = libraries[i];
    library.sizeFree = library.sizeTotal - library.sizeUsed;
    library.games.sort(function(a, b){return b.size - a.size})
    library.significantGames = [];
    
    /* Quasi-random but tied to size for constancy */
    var hue = (library.sizeUsed % 1000) * (360 / 1000);
    
    for( var j = 0; j < library.games.length; j++ ){
      var game = library.games[j];
      game.library = library;
      game.percentTaken = (100 * (game.size / library.sizeTotal));
      if( game.percentTaken > 1 ){ library.significantGames.push(game) }
      game.percentString = game.percentTaken.round(2);
      if( game.percentString == "0" ){ game.percentString = "< 0.01"; }
      
      game.formattedSize = formatBytes(game.size, 1, true);
      
      game.colour = "hsl(" + hue + ", 100%, 70%";
      hue += 360 / library.games.length;
      hue %= 360;
    }
  }
}

var libraryConstructor = '\
<div class="header">\
  <h2 class="drivename">$title$</h2>\
  <div class="drivebar">Free\
    <div class="barsegment used"  style="width: $usedPercent$%;">Used</div>\
    <div class="barsegment games" style="width: $gamePercent$%;">All games</div>\
    <div class="barsegment withSelected" style="width: 0%; left: $usedPercent$%;"></div>\
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

var gameConstructor = "\
$name$\
<span class='playLink'><a href='steam://run/$id$'>Play...</a></span>\
<span style='color: $colour$' class='col1'>$size$</span>\
<span style='color: $colour$' class='col2'>$percent$%</span>"

function loadLibraries(){
  for( i = 0; i < libraries.length; i++ ) {
    var library = libraries[i];
    var usedPercent = (100 * (library.sizeUsed / library.sizeTotal)).round(2),
        freePercent = (100 * (library.sizeFree / library.sizeTotal)).round(2),
        gamePercent = (100 * (library.sizeGames / library.sizeTotal)).round(2),
        title = library.path + ' (' + formatBytes(library.sizeTotal, 1) + ', ' +
          library.games.length + ' game' + (library.games.length == 1 ? '' : 's') + ')',
        el = document.createElement('li');
    
    el.innerHTML = libraryConstructor.replaceAll(
      '$title$', title,
      '$free$', formatBytes(library.sizeFree, 1),
      '$used$', formatBytes(library.sizeUsed, 1),
      '$usedGames$', formatBytes(library.sizeGames, 1),
      '$freePercent$', freePercent,
      '$usedPercent$', usedPercent,
      '$gamePercent$', gamePercent);
    
    library.bar = el.getElementsByClassName('drivebar')[0];
    library.withSelected = el.getElementsByClassName('withSelected')[0];
    
    var list = el.getElementsByTagName('ul')[0],
        leftWidth = 0;
    
    for( j = 0; j < library.games.length; j++ ){
      var game = library.games[j],
          li = game.element = document.createElement('li');
      
      li.classList = 'item';
      
      li.onmouseover = gameover;
      li.onmouseout = gameout;
      li.onclick = gameclick;
      
      li.innerHTML = gameConstructor.replaceAll(
        '$name$', game.name, '$id$', game.id,
        '$size$', game.formattedSize, '$percent$', game.percentString,
        '$colour$', game.colour)
      
      list.appendChild(game.element)
      game.element = li;
    
      var bar = document.createElement('span');
      bar.className = "barsegment part";
      
      /* Convince weird pixel rounding to err on the round-up side
       * so as to avoid gaps between segments. */
      bar.style.width = "calc(" + game.percentTaken + "% + 0.2px)";
      bar.style.left = leftWidth + "%";
      
      bar.style.backgroundColor = game.colour;
      leftWidth += game.percentTaken;
      
      library.bar.appendChild(bar);
      game.bar = bar;
    }
    libraryList.appendChild(el);
    library.element = el;
  }
}

gameover  = function(){ gameSelect(this, true, false) }
gameout   = function(){ gameSelect(this, false, false) }
gameclick = function(){ gameSelect(this, true, true) }

var selectedGame = false;

function gameSelect(element, highlight, lock){
  var library;
  if( !lock && selectedGame ){ return; }
  
  for( i = 0; i < libraries.length; i++ ) {
    var lib = libraries[i];
    for( j = 0; j < lib.games.length; j++ ){
      var ga = lib.games[j];
      if( element.innerText.beginsWith(ga.name) ){
        library = lib;
        game = ga;
        break;
      }
    }
  }
  
  if( lock ){
    if( selectedGame == game ){
      highlight = false;
      selectedGame = false;
      game.element.classList.remove('locked')
    } else {
      if( selectedGame ){
        gameHighlight(selectedGame, false)
        selectedGame.element.classList.remove('locked');
      }
      selectedGame = game;
      game.element.classList.add('locked')
    }
  }
  gameHighlight(game, highlight)
}

function gameHighlight(game, highlight) {
  var c = game.bar.classList;
  highlight ? c.add('hovered') : c.remove('hovered');
  
  for( i = 0; i < libraries.length; i++ ) {
    var lib = libraries[i], percent;
    lib.withSelected.classList.remove('tooMuch')
    if( !highlight || lib == game.library ){
      percent = 0;
    } else if( game.size > lib.sizeFree ){
      percent = lib.sizeFree / lib.sizeTotal;
      lib.withSelected.classList.add('tooMuch');
    } else {
      percent = game.size / lib.sizeTotal;
    }
    lib.withSelected.style.width = percent * 100 + "%";
  }
}
