var gameBindings = {},
    gameBindingsLength = 0;

function bindGame(game){
  game.bindingID = gameBindingsLength;
  gameBindings[game.bindingID] = game;
  gameBindingsLength++
  
  game.element.onmouseover = function(){ gameSelect(game, true, false)};
  game.element.onmouseout = function(){ gameSelect(game, false, false)};
  game.element.onclick = function(){ gameSelect(game, true, true)};
}

function gameSelect(game, didMouse, didClick){
  var isLocked = (gameBindings['locked'] === game);
  
  if( isLocked ){
    if( !didClick ) { return; /* No clicky, no unlocky! */ }
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
  doLockIn ? gC.add('locked') : gC.remove('locked')
  
  for( i = 0; i < libraries.length; i++ ) {
    var lib = libraries[i],
        percentTaken = 0,
        tooMuch = false;
    
    if(lib){
      percentTaken = 0;
    } else if( game.size > lib.sizeFree ) {
      tooMuch = true;
      percentTaken = lib.sizeFree / lib.sizeTotal
    } else {
      percentTaken = game.size / lib.sizeTotal
    }
    
    var w = lib.element.withSelected, wC = w.classList;
    tooMuch ? wC.add('tooMuch') : wC.remove('tooMuch');
    w.style.width = percentTaken * 100 + "%";
  }
}