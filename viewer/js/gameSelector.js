var gameBindings = { "length": 0 };

function bindGame(game){
  game.bindingID = gameBindings.length
  gameBindings[game.bindingID] = game
  gameBindings.length++  
  
  game.element.onmouseover = game.barElement.onmouseover =
      function(){ gameSelect(game, true, false)}
  game.element.onmouseout = game.barElement.onmouseout =
      function(){ gameSelect(game, false, false)}
  game.element.onclick = game.barElement.onclick = 
      function(){ gameSelect(game, true, true)}
}

function gameSelect(game, didMouse, didClick){
  var isLocked = (gameBindings['locked'] === game);
  if( isLocked ){
    if( !didClick ) { return; /* No clicky, no unlocky! */ }
    if( gameBindings['locked'] === game ){
      didMouse = true;
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
  
  gameHighlight(game, didMouse, didClick, didClick)
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
    
    if( !doLockIn ){
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