toggleSteamHelp = function() {
  classBool(!steamHelp.classList.contains('visible'), 'visible', steamHelp)
}

/* Automatic (and manual) tutorial */

var hintInterfaceState;

startTutorial = function(){
  hintInterfaceState = 1;
  hintInterfaceLoop();
}

hintInterfaceLoop = function(){
  if( gameBindingsLength === 0 ){
    return;
  }
  var hintBindingID = Math.min(3, Math.floor(gameBindingsLength / 2))
      game = gameBindings[hintBindingID];
  
  var timeToWait = hintInterfaceDisplay(game, hintInterfaceState);
  // carries out and returns time to wait
  if( timeToWait === "stop" ){ return; }
  setTimeout(hintInterfaceLoop, timeToWait);
  hintInterfaceState++;
}

hintInterfaceDisplay = function(game, state){
  var pL = game.element.playLink;
  
  classBool(state < 4, 'smaller', game.element.playLink)
  classBool(state == 4, 'visible', tutorialBox)
  
  classBool(state == 2, 'locked', game.element, game.barElement)
  classBool(state < 4, 'hovered', game.element, game.barElement)
  
  switch( state ){
    case 1:
      pL.innerText = "[Mouseover to see info]";
      return 3000;
    case 2:
      pL.innerText = "[Click to lock in]";
      return 5000;
    case 3:
      pL.innerText = "[Scroll down to see size on other libraries]";
      return 5000;
    case 4:
      pL.innerText = "Play..."
      return "stop";
  }
}