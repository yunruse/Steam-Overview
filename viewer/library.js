var libraryList, timeDisplay;

window.onload = function(){
  libraryList = document.getElementById('drives');
  timeDisplay = document.getElementById('timeSince');
  
  updateLibraries();
  loadLibraries();
  
  var timeSince = (new Date().getTime() / 1000 ) - lastRetrieved;
  if( timeSince > 30 * 60 ){
    /* More than 30 minutes, use warning */
    timeDisplay.parentElement.classList.remove('hidden');
    timeDisplay.innerText = formatTimeDelta(timeSince);
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
<div class="titlebox"><div class="title">\
  <h2 class="drivename">$title$</h2>\
    <div class="drivebar">Free\
      <div class="barsegment used"  style="width: $usedPercent$%;">Used</div>\
      <div class="barsegment games" style="width: $gamePercent$%;">All games</div>\
      <div class="barsegment selected" style="width: 0%; left: $usedPercent$%;"></div>\
    </div>\
  </div>\
</div></div>\
<ul class="gamelist">\
<li class="meta free">Free\
  <span class="gamesize">$free$</span>\
  <span class="gamePercent">$freePercent$%</span>\
</li>\
<li class="meta used">Used\
  <span class="gamesize">$used$</span>\
  <span class="gamePercent">$usedPercent$%</span>\
</li>\
<li class="meta games">All Games\
  <span class="gamesize">$usedGames$</span>\
  <spaan class="gamePercent">$gamePercent$%</span>\
</li></ul>'

var gameConstructor = "\
$name$\
<span style='color: $colour$' class='gamesize'>$size$</span>\
<span style='color: $colour$' class='gamePercent'>$percent$%</span>"

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
    
    library.box = el.getElementsByClassName('titlebox')[0];
    library.title = el.getElementsByClassName('title')[0];
    library.bar = el.getElementsByClassName('drivebar')[0];
    library.selected = el.getElementsByClassName('selected')[0];
    
    var list = el.getElementsByTagName('ul')[0],
        leftWidth = 0;
    
    for( j = 0; j < library.games.length; j++ ){
      var game = library.games[j],
          li = game.element = document.createElement('li');
      li.onmouseover = gameover;
      li.onmouseout = gameout;
      li.onclick = gameclick;
      
      li.innerHTML = gameConstructor.replaceAll(
        '$name$', game.name, '$size$', game.formattedSize, '$percent$', game.percentString,
        '$colour$', game.colour)
      
      list.appendChild(game.element)
      game.element = li;
    
      var bar = document.createElement('span');
      bar.className = "barsegment part";
      bar.style.width = game.percentTaken + "%";
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
    lib.selected.classList.remove('tooMuch')
    if( !highlight || lib == game.library ){
      percent = 0;
    } else if( game.size > lib.sizeFree ){
      percent = lib.sizeFree / lib.sizeTotal;
      lib.selected.classList.add('tooMuch');
    } else {
      percent = game.size / lib.sizeTotal;
    }
    lib.selected.style.width = percent * 100 + "%";
  }
}