toggleSteamHelp = function() {
  classBool(!steamHelp.classList.contains('visible'), 'visible', steamHelp)
}

/* Automatic (and manual) tutorial */

var hintInterfaceState, hintInterfaceOthers;

startTutorial = function(){
  if( gameBindings.length === 0 ){ return; }
  
  var hintBindingID = Math.min(3, Math.floor(gameBindings.length / 2));
  gameBindings.tutorialShown = gameBindings[hintBindingID];
  
  otherGames = [];
  for( var i = 0; i < gameBindings.length; i++ ){
    if( i == hintBindingID ){ continue; }
    otherGames.push(gameBindings[i].element);
  }
  gameBindings.tutorialShadowElements = otherGames;
  
  hintInterfaceState = 1;
  hintInterfaceLoop();
}

hintInterfaceLoop = function(){  
  var timeToWait = hintInterfaceDisplay(hintInterfaceState);
  // carries out and returns time to wait
  
  if( timeToWait === "stop" ){ return; }
  setTimeout(hintInterfaceLoop, timeToWait);
  hintInterfaceState++;
}

hintInterfaceDisplay = function(state){
  var game = gameBindings.tutorialShown,
      others = gameBindings.tutorialShadowElements,
      pL = game.element.playLink;
  
  classBool(state < 4, 'shadowed', ...others)
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