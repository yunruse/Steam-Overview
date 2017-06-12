var gameBindings = {},
    gameBindingsLength = 0,
    everBound = false;

function bindGame(game){
  game.bindingID = gameBindingsLength;
  gameBindings[game.bindingID] = game;
  gameBindingsLength++
  
  game.element.onmouseover = function(){ gameSelect(game, true, false)};
  game.element.onmouseout = function(){ gameSelect(game, false, false)};
  game.element.onclick = function(){ gameSelect(game, true, true)};
  
  game.barElement.onmouseover = function(){ gameSelect(game, true, false)};
  game.barElement.onmouseout = function(){ gameSelect(game, false, false)};
  game.barElement.onclick = function(){ gameSelect(game, true, true)};
}

function gameSelect(game, didMouse, didClick){
  everBound = true;
  var isLocked = (gameBindings['locked'] === game);
  if( isLocked ){
    if( !didClick ) { return; /* No clicky, no unlocky! */ }
    if( gameBindings['locked'] === game ){
      didMouse = false;
      gameBindings['locked'] = undefined;
    }
    didClick = false;
  }
  
  if( didClick ){
    var unlockGame = gameBindings['locked']
    if( unlockGame ){
      gameHighlight(unlockGame, false, false, false)
    }
    gameBindings['locked'] = game;
  }
  
  gameHighlight(game, didMouse, didClick, true)
}

function gameHighlight(game, doHighlight, doLockIn, doDisplayPotential) {
  try { game.barElement.classList }
  catch(e) { console.log(game) }
  
  var bC = game.barElement.classList;
  doHighlight ? bC.add('hovered') : bC.remove('hovered');
  doLockIn ? bC.add('locked') : bC.remove('locked')
  
  var gC = game.element.classList;
  doHighlight ? gC.add('hovered') : gC.remove('hovered');
  doLockIn ? gC.add('locked') : gC.remove('locked')
  
  if( !doDisplayPotential ){ return; }
  
  for( i = 0; i < libraries.length; i++ ) {
    var lib = libraries[i],
        percentTaken = 0,
        tooMuch = false;
    
    if( !doHighlight ){
      percentTaken = 0;
    } else if( lib.games.indexOf(game) !== -1 ){
      /* Contains game – don't display */
      percentTaken = 0;
    } else if ( game.size > lib.sizeFree ){
      tooMuch = true;
      percentTaken = (lib.sizeFree / lib.sizeTotal) + 0.001;
    } else {
      percentTaken = game.size / lib.sizeTotal;
    }
    
    var w = lib.element.additional, wC = w.classList;
    tooMuch ? wC.add('tooMuch') : wC.remove('tooMuch');
    w.style.width = percentTaken * 100 + "%";
  }
}